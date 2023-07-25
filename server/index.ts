import express, { NextFunction } from 'express';
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
import { auth } from 'express-oauth2-jwt-bearer';

const domain = process.env.AUTH0_DOMAIN || '';
const app = express();

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: 'theologian.chat',
  issuerBaseURL: domain,
});

function getUserInfo(req: express.Request) {
  (req as any).user = parseJwt(req.headers?.authorization || '');
}

// middleware to parse request bodies
app.use(bodyParser.json());
// Caused infinite redirect loop
app.use(function(request, response, next) {
  if (process.env.NODE_ENV !== 'development') {
    // Heroku supplies this header and it communicates the original http/https protocol used
    const httpOrHttps = request.headers["x-forwarded-proto"] as string;
    if (!httpOrHttps) {
      next();
      return;
    }
    if (httpOrHttps.toLowerCase().indexOf("https") === -1) {
      return response.redirect("https://" + request.headers.host + request.url);
    }
  }
  next();
})
// add a new chat message in the chat history
// will get a reply from chatGPT and save that as well as return it to the user.
app.post('/api/chat/:id', checkJwt, async (req: express.Request, res: express.Response, next: NextFunction) => {
  const chatId: string = req.params.id;
  const message: string = req.body.message;
  getUserInfo(req);
  const userId = (req as any).user.sub;
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  appendUserAndChatGPTResponse(chatId, userId, message)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

// get chat history so far
app.get('/api/chat/:id', checkJwt, async (req: express.Request, res: express.Response, next: NextFunction) => {
  getUserInfo(req);
  const userId = (req as any).user.sub;
  const chatId: string = req.params.id;
  console.log((req as any).user);
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  readChat(chatId, userId)
    .then((result) => {
      res.send(result);
    })
    .then(next);
});

// Delete a chat history
app.delete('/api/chat/:id', checkJwt, async (req: express.Request, res: express.Response, next: NextFunction) => {
  const chatId: string = req.params.id;
  getUserInfo(req);
  const userId = (req as any).user.sub;
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  deleteChatHistory(chatId, userId)
    .then(() => {
      res.send({});
    })
    .catch(next);
});

app.get('/api/chats', checkJwt, async (req: express.Request, res: express.Response, next: NextFunction) => {
  // get chat history based on id and return it
  getUserInfo(req);
  const userId = (req as any).user.sub;

  getChatList(userId)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

// create a new chat
app.post('/api/chat', checkJwt, async (req: express.Request, res: express.Response, next: NextFunction) => {
  const theologianId: string = req.body.theologianId;
  getUserInfo(req);
  const userId = (req as any).user.sub;

  assert(theologianId);
  createNewChatHistory(theologianId, userId)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

// enumerate theologians
app.get('/api/theologians', (req: express.Request, res: express.Response, next: NextFunction) => {
  getTheologians()
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req: express.Request, res: express.Response) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html')),
);
connect().then(() => {
  app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`));
});
