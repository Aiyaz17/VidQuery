const { PineconeClient } = require("@pinecone-database/pinecone");
require("dotenv").config();

const client = new PineconeClient();
(async () => {
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_API_ENV,
  });
})();

module.exports = { client };
