import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { connect } from './mongodb';
import {
  createNewChatHistory,
  readChat,
  appendUserAndChatGPTResponse,
  getChatList,
  deleteChatHistory,
} from './chatHistories';
import assert from 'assert';
import { getTheologians } from './theologians';
import { ObjectId } from 'mongodb';

const app = express();

// middleware to parse request bodies
app.use(bodyParser.json());

// add a new chat message in the chat history
// will get a reply from chatGPT and save that as well as return it to the user.
app.post('/api/chat/:id', (req: express.Request, res: express.Response) => {
  const chatId: string = req.params.id;
  const message: string = req.body.message;
  const userId = 'test';
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  appendUserAndChatGPTResponse(chatId, userId, message).then((result) => {
    res.send(result);
  });
});

// get chat history so far
app.get('/api/chat/:id', (req: express.Request, res: express.Response) => {
  const chatId: string = req.params.id;
  const userId = 'test';
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  readChat(chatId, userId).then((result) => {
    res.send(result);
  });
});

// Delete a chat history
app.delete('/api/chat/:id', (req: express.Request, res: express.Response) => {
  const chatId: string = req.params.id;
  const userId = 'test';
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  deleteChatHistory(chatId, userId).then(() => {
    res.send({});
  });
});

app.get('/api/chats', (req: express.Request, res: express.Response) => {
  // get chat history based on id and return it
  const userId = 'test';

  getChatList(userId).then((result) => {
    res.send(result);
  });
});

// create a new chat
app.post('/api/chat', (req: express.Request, res: express.Response) => {
  const theologianId: string = req.body.theologianId;
  const userId = 'test';

  assert(theologianId);
  createNewChatHistory(theologianId, userId).then((result) => {
    res.send(result);
  });
});

// enumerate theologians
app.get('/api/theologians', (req: express.Request, res: express.Response) => {
  getTheologians().then((result) => {
    res.send(result);
  });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
connect().then(() => {
  const port = 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
