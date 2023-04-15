const router = require("express").Router();
const {
  createVideo,
  queryToPinecone,
  listVideos,
} = require("../controllers/videoTranscriptController");

router.post("/transcript", createVideo);
router.post("/query", queryToPinecone);
router.get("/list-videos", listVideos);

module.exports = router;
