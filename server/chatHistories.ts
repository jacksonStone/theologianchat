import { getDb } from './mongodb';
import { ObjectId, UpdateResult, InsertOneResult, DeleteResult } from 'mongodb';
import { sendTextToLlm } from './llmApi';
import { getTheologian } from './theologians';
import { createJob, resolveJob, cancelJob } from './batchJobs';

interface PartialChat {
  _id: string;
  theologianId: string;
  firstMessage: Message;
}
interface Message {
  content: string;
  author: string;
}

interface Chat {
  theologianId: string;
  userId: string;
  messages: Message[];
}

async function appendUserAndChatGPTResponse(chatId: string, userId: string, message: string): Promise<any> {
  const chat = await readChat(chatId, userId);
  if (!chat) {
    // TODO:: Better error handling
    throw new Error('Chat not found');
  }
  const theologian = await getTheologian(chat.theologianId);
  if (!theologian) {
    // TODO:: Better error handling
    throw new Error('Theologian not found');
  }

  const userMessage: Message = {
    content: message,
    author: 'user',
  };
  let aiReply = '';
  await Promise.all([
    createJob(chatId, userId, chat.messages.concat([userMessage])),
    appendChatMessages(chatId, userId, [userMessage]),
  ]);
  sendTextToLlm(message, theologian.prompt, chat.messages)
    .then((reply) => {
      aiReply = reply;
      return appendChatMessages(chatId, userId, [
        {
          content: reply,
          author: 'theologian',
        },
      ]);
    })
    .then(async () => {
      return resolveJob(chatId, userId, aiReply);
    })
    .catch(() => {
      cancelJob(chatId, userId);
    });
}

async function appendChatMessages(id: string, userId: string, messages: Message[]): Promise<UpdateResult> {
  const chatHistoriesCollection = getDb().collection('ChatHistories');
  return chatHistoriesCollection.updateOne(
    { _id: new ObjectId(id), userId },
    {
      $push: {
        messages: { $each: messages },
      },
    },
  );
}

async function createNewChatHistory(theologianId: string, userId: string): Promise<InsertOneResult<{ _id: string }>> {
  const chatHistoriesCollection = getDb().collection('ChatHistories');
  const chatHistory = {
    theologianId,
    userId,
    messages: [],
  };
  return chatHistoriesCollection.insertOne(chatHistory);
}

async function deleteChatHistory(id: string, userId: string): Promise<DeleteResult> {
  const chatHistoriesCollection = getDb().collection('ChatHistories');
  return chatHistoriesCollection.deleteOne({ _id: new ObjectId(id), userId });
}

async function readChat(id: string, userId: string): Promise<Chat | null> {
  const chatHistoriesCollection = getDb().collection('ChatHistories');
  return chatHistoriesCollection.findOne({ _id: new ObjectId(id), userId }) as Promise<Chat | null>;
}

async function getChatList(userId: string): Promise<PartialChat[]> {
  const chatHistoriesCollection = getDb().collection('ChatHistories');
  return chatHistoriesCollection
    .find({ userId }, { projection: { theologianId: 1, firstMessage: { $first: '$messages' } } })
    .toArray() as unknown as Promise<PartialChat[]>;
}

export { appendUserAndChatGPTResponse, createNewChatHistory, getChatList, readChat, deleteChatHistory };
