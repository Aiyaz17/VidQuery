const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const db_conn = require("./db_conn")();
const videoTranscriptRouter = require("./routers/videoTranscriptRouter");

const PORT = process.env.PORT || 9000;

app.use(bodyParser.json());
app.use(cors());

app.use("/api", videoTranscriptRouter);

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
