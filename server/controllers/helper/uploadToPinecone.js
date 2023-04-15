async function uploadToPinecone(data) {
  const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
  const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
  const { client } = require("../helper/pinecone");
  const { PineconeStore } = require("langchain/vectorstores/pinecone");
  const { v4: uuidv4 } = require("uuid");
  require("dotenv").config();

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log("Taking steps to upload to pinecone -");
    console.log("1. Spliting text into multiple documents");

    const text_splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 0,
    });

    var texts = await text_splitter.createDocuments([data]);
    console.log("After splitting Total documents = " + texts.length);
    console.log("2. Adding random id to metaData of each document");
    texts = texts.map((text) => ({
      ...text,
      metadata: {
        id: uuidv4(),
      },
    }));

    console.log("3. Uploading to pinecone index");
    const indexName = "index1";
    const pineconeIndex = client.Index(indexName);
    const docSearch = await PineconeStore.fromDocuments(texts, embeddings, {
      pineconeIndex,
    });

    console.log("Done uploading, Returning documentIds");

    if (docSearch) {
      return { documentIds: texts.map((doc) => doc.metadata.id) };
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}
module.exports = { uploadToPinecone };
