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
import {
  readOnGoingJob
} from "./batchJobs";
import assert from 'assert';
import { getTheologians } from './theologians';
import { ObjectId } from 'mongodb';
import { createUser, getUserByEmail } from './User';
import auth from './auth';

const app = express();

type SAFE_user = {
  userId: string
  userEmail: string
}
function getUser(req: express.Request): SAFE_user|undefined {
  const rawCookieHeader = req.headers.cookie
  try {
    const cookieContents = auth.attemptCookieDecryption(rawCookieHeader)
    return JSON.parse(cookieContents) as SAFE_user;
  } catch(e) {
    console.log(e);
  }
}

// middleware to parse request bodies
app.use(bodyParser.json());

app.post('/api/user/create', async (req: express.Request, res: express.Response, next: NextFunction) => {
  console.log("Create!");

  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send({error: "failed to provide email and password"});
  }
  const currentUser = await getUserByEmail(email);
  if(currentUser) {
    return res.status(400).send({error: "email already allocated"});
  }
  await createUser(email, password);
  const newUser = await getUserByEmail(email);
  const cookieHeader = await auth.attemptLoginAndGetCookie(newUser, password);
  res.setHeader("Set-Cookie", cookieHeader);
  res.send("ok");
  next();
})
app.post("/api/user/login", async (req: express.Request, res: express.Response, next: NextFunction) => {
  console.log("Login");
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send({error: "failed to provide email and password"});
  }
  try {
    const currentUser = await getUserByEmail(email);
    if(!currentUser) {
      return res.status(400).send({error: "no user"});
    }
    const cookie = await auth.attemptLoginAndGetCookie(currentUser, password);
    res.setHeader("Set-Cookie", cookie);
    res.send("ok");
  } catch(e) {
    next(e);
  }
  next();

})
app.get('/api/chat/job/:id', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const chatId: string = req.params.id;
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  const user = getUser(req);
  if(!user) {
    return res.redirect("https://" + req.headers.host);
  }
  const userId = user.userId;
  readOnGoingJob(chatId, userId).then((result) => {
    res.send(result)
  }).catch(next);
})
// add a new chat message in the chat history
// will get a reply from chatGPT and save that as well as return it to the user.
app.post('/api/chat/:id', async (req: express.Request, res: express.Response, next: NextFunction) => {
  
  const chatId: string = req.params.id;
  const message: string = req.body.message;
  const user = getUser(req);
  if(!user) {
    return res.redirect("https://" + req.headers.host);
  }
  const userId = user.userId;

  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  // Allow it to get a really long time to respond
  appendUserAndChatGPTResponse(chatId, userId, message)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

// get chat history so far
app.get('/api/chat/:id', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const user = getUser(req);
  if(!user) {
    return res.redirect("https://" + req.headers.host);
  }
  const userId = user.userId;
  const chatId: string = req.params.id;

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
app.delete('/api/chat/:id', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const chatId: string = req.params.id;
  const user = getUser(req);
  if(!user) {
    return res.redirect("https://" + req.headers.host);
  }
  const userId = user.userId;
  if (!ObjectId.isValid(chatId)) {
    return res.status(400).send({ error: 'Invalid chat id' });
  }
  deleteChatHistory(chatId, userId)
    .then(() => {
      res.send({});
    })
    .catch(next);
});

app.get('/api/chats', async (req: express.Request, res: express.Response, next: NextFunction) => {
  // get chat history based on id and return it
  const user = getUser(req);
  if(!user) {
    return res.redirect("https://" + req.headers.host);
  }
  const userId = user.userId;
  
  getChatList(userId)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

// create a new chat
app.post('/api/chat', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const theologianId: string = req.body.theologianId;
  const user = getUser(req);
  if(!user) {
    return res.redirect("https://" + req.headers.host);
  }
  const userId = user.userId;

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
  app.listen(process.env.PORT || 3002, () => console.log(`Server running on port ${process.env.PORT || 3002}`));
});
