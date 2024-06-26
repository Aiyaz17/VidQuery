## **Introduction**

This question-answering system aims to make information from YouTube videos more accessible. You can ask questions about a YouTube video and the system will find the answer within the transcript of the video.

Here's a bit about how it works technically: The system is built using a combination of technologies including MERN Stack (MongoDB, Express.js, React.js, and Node.js) to manage data and user interaction. To understand the video content, it utilizes OpenAI's Whisper API for speech recognition and Langchain for natural language processing. Finally, Pinecone helps store and retrieve information efficiently to answer your questions.

## **Installation**

1. Clone the project from the GitHub repository:

```bash
git clone https://github.com/Aiyaz17/VidQuery.git
```

2. Install the necessary dependencies using npm in both folders server and client:

```bash

cd VidQuery/client
npm install

cd ../server
npm install
```

3. Set Env variables in server and client .env files:

```
In both Client and server

3.1 Make a copy of example.env
3.2 Rename the copy to ".env"
3.3 Open ".env" file and Enter corresponding values for each Variable
```

4. Start the server :

```bash
npm start
```

5. Run the client:

```bash

npm run start
```

## **Usage**

1. Start by visiting the homepage of the application.
2. To add a new video for question answering, enter the YouTube video URL in the input field and click the "Send" Icon. You will then be redirected to the QNA page for that video.
3. On the QNA page, you will see the video's title and an option to view its transcript. Type your question in the input bar and the answer will be displayed below.
4. If you don't want to wait for a new video to be added, you can choose from a list of past videos that were added by other users on the homepage.
5. Once you select a video, you will be redirected to its QNA page. Repeat step 3 to ask a question and get an answer.

## **Additional Information**

- The system can only answer questions that are related to the content of the video. If you ask a question that is not related to the video, the system may not be able to generate a valid answer.
- It may take long for the video to get ready for QNA (especially for longer duration videos) , as Whisper API takes time to generate video’s Transcript, So please be patience and don’t reload or close the tab.
