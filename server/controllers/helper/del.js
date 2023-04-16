const ytdl = require("ytdl-core");
const fs = require("fs");
const { Readable } = require("stream");

const videoUrl = "https://www.youtube.com/watch?v=ZWHxQCmBt7U";

(async () => {
  const info = await ytdl.getBasicInfo(videoUrl);
  //   console.log(info);
  durationSeconds = info.videoDetails.lengthSeconds;
  //   console.log(durationSeconds);
  console.log(info.formats);
  if (durationSeconds > 600) {
    
    // code to break down the video into chunks and retrieve audio
    let totalSize = 0;
    const chunkSize = 20 * 1024 * 1024; // 20MB
    const stream = ytdl(videoUrl, {
      filter: "audioonly",
    });
    const audioChunks = [];

    var i = 0;
    var transcript = "";
    stream.on("data", (chunk) => {
      audioChunks.push(chunk);
      if (Buffer.concat(audioChunks).length >= chunkSize) {
        transcript += audioChunksToTranscript(audioChunks);
        i++;
      }
    });

    stream.on("end", () => {
      if (audioChunks.length > 0) {
        transcript += audioChunksToTranscript(audioChunks);
      }
      console.log("Audio retrieval complete.");
    });

    stream.on("error", (err) => {
      console.error(err);
    });
  } else {
    console.log("The video is shorter than or equal to 10 minutes.");
    // code to retrieve audio
  }
})();
