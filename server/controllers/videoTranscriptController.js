const ytdl = require("ytdl-core");
const { client } = require("./helper/pinecone");
const { OpenAI } = require("langchain/llms/openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { loadQAStuffChain } = require("langchain/chains");
const { Readable } = require("stream");
const concat = require("concat-stream");
const VideoTranscript = require("../models/VideoTranscript");
const { uploadToPinecone } = require("./helper/uploadToPinecone");
const { Document } = require("langchain/document");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { Configuration, OpenAIApi } = require("openai");

ffmpeg.setFfmpegPath(ffmpegPath);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const createVideo = async (req, res) => {
  const url = req.body.url;
  console.log({ url });

  if (!url) return res.status(400).json({ error: "No url provided" });
  // const url = "https://www.youtube.com/watch?v=i5DjkBBonlo"; // replace with video URL

  var title,
    thumbnail,
    description,
    transcript,
    videoUrl = url;

  const stream = ytdl(url, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  console.log("Audiio extracted now, Getting video info");
  stream.on("info", (info) => {
    title = info.videoDetails.title;
    thumbnail = info.videoDetails.thumbnail.thumbnails[0].url;
    description = info.videoDetails.description;
  });
  console.log("Got Info now creating audio buffer");
  const proc = new ffmpeg({ source: stream }).toFormat("mp3");

  proc.pipe(
    concat(async (audioBuffer) => {
      const audioReadStream = Readable.from(audioBuffer);
      audioReadStream.path = `file.mp3`;

      console.log(
        "Buffer created now , Sending audio/buffer to Whisper - OpenAI "
      );

      const resp = await openai.createTranscription(
        audioReadStream,
        "whisper-1"
      );

      transcript = resp.data.text;

      // console.log({ transcript });
      console.log(
        "Transcript recieved from whisper now , Uploading to Data Pinecone and saving to MongoDB as well"
      );

      try {
        const uploadedDocsResp = await uploadToPinecone((data = transcript));

        // console.log({ uploadedDocsResp });
        console.log(
          "Recieved docIds / Uploaded to pinecone - now saving to MongoDB"
        );
        const videoTranscript = new VideoTranscript({
          title,
          thumbnail,
          description,
          videoUrl,
          transcript,
          documentsId: uploadedDocsResp.documentIds,
          createdAt: new Date(),
        });

        const savedVideoTranscript = await videoTranscript.save();
        console.log("Saved details to MongoDB as well, Task completed !");

        if (uploadedDocsResp) {
          res.json({
            status: "success",
            data: {
              savedVideoTranscript,
            },
          });
        } else throw new Error("Error uploading to pinecone");
      } catch (err) {
        console.log(err);
        res.json({
          status: "failed",
          data: {
            err,
          },
        });
      }
    })
  );

  proc.on("error", (err) => {
    console.log(err);
    res.status(400).json(err);
  });
};

const queryToPinecone = async (req, res) => {
  const { query, id } = req.body;
  console.log({ query, id });

  console.log("Getting video Data from MongoDB");
  const videoTranscript = await VideoTranscript.findById(id);
  const documentIds = videoTranscript.documentsId;

  console.log("Got video Data from MongoDB now querying pinecone");
  const queryEmbedding = await embeddings.embedQuery(query);

  const index = client.Index(process.env.PINECONE_INDEX);
  const queryRequest = {
    vector: queryEmbedding,
    topK: 2,
    filter: {
      id: { $in: documentIds },
    },
    includeMetadata: true,
  };

  const queryResponse = await index.query({ queryRequest });
  console.log("Got response from pinecone now sending to langchain");

  const docs = queryResponse.matches.map((match) => {
    return new Document({ pageContent: match.metadata.text });
  });

  const llmA = new OpenAI({ temperature: 0 });
  const chain = loadQAStuffChain(llmA);

  const answer = await chain.call({
    input_documents: docs,
    question: query,
  });

  console.log("Got answer from langchain now sending to frontend");
  console.log({ answer });
  res.json({
    status: "success",
    data: answer.text.trim(),
  });
};

const listVideos = async (req, res) => {
  console.log("Getting all videos from MongoDB");
  const videosData = await VideoTranscript.find().sort({ createdAt: -1 });
  res.json({
    status: "success",
    data: videosData,
  });
};

exports.createVideo = createVideo;
exports.queryToPinecone = queryToPinecone;
exports.listVideos = listVideos;
