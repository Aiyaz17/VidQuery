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
const { Configuration, OpenAIApi } = require("openai");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
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

  if (!url)
    return res.status(400).json({ status: "failed", error: "No url provided" });
  // const url = "https://www.youtube.com/watch?v=i5DjkBBonlo"; // replace with video URL

  var title,
    thumbnail,
    description,
    transcript,
    videoUrl = url;

  const info = await ytdl.getBasicInfo(videoUrl);
  // console.log(info.videoDetails);
  title = info.videoDetails.title;
  thumbnail = info.videoDetails.thumbnails[0].url;
  description = info.videoDetails.description;

  const chunkSize = 8 * 1024 * 1024; // mb

  const stream = ytdl(videoUrl, {
    filter: "audioonly",
    quality: "highestaudio",
  });

  var audioChunks = [];
  const audioStreams = [];

  stream.on("data", async (chunk) => {
    if (!chunk.length) {
      return;
    }

    audioChunks.push(chunk);
    if (Buffer.concat(audioChunks).length >= chunkSize) {
      const audioData = Buffer.concat(audioChunks);
      audioStreams.push(audioData);
      audioChunks = [];
    }
  });

  stream.on("end", async () => {
    if (audioChunks.length > 0) {
      const audioData = Buffer.concat(audioChunks);
      audioStreams.push(audioData);
    }
    console.log("Chunks segregation complete,len = ", audioStreams.length);

    transcript = await audioChunksToTranscript(audioStreams);
    console.log("Audio retrieval complete .");
    // console.log({ transcript });
    audioChunks.length = 0;

    try {
      const uploadedDocsResp = await uploadToPinecone((data = transcript));

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
  });

  stream.on("error", (err) => {
    console.log("Error from stream.on error");
    console.error(err);
  });
};

async function audioChunksToTranscript(audioStreams) {
  let transcript = "";

  for (let i = 0; i < audioStreams.length; i++) {
    try {
      console.log(
        "\n\nConverting audio to text - " +
          (i + 1) +
          " / " +
          audioStreams.length
      );
      const audioStream = Readable.from(audioStreams[i]);
      audioStream.path = `file${i}.mp3`;

      const resp = await openai.createTranscription(audioStream, "whisper-1");
      // console.log(resp.data.text);
      transcript += resp.data.text;
      console.log("Got transcript");
    } catch (err) {
      console.log(err);
      console.log("Error occurred, skipping chunk");
    }
  }
  return transcript;
}

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
