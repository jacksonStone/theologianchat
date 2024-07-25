import { getDb } from './mongodb';
import { InsertOneResult } from 'mongodb';

interface GPTRequest {
  _id: string;
  userId: string;
  chatId: string;
  sent: Message[];
  response: string;
  timeSent: number;
  timeAnswered: number;
}
interface Message {
  content: string;
  author: string;
}

async function createJob(chatId: string, userId: string, messages: Message[]): Promise<InsertOneResult> {
  const chatRequests = getDb().collection('ChatRequests');
  return chatRequests.insertOne({
    chatId,
    userId,
    sent: messages,
    timeSent: Date.now(),
    timeAnswered: 0,
  });
}

async function readOnGoingJob(chatId: string, userId: string): Promise<boolean> {
  const chatRequests = getDb().collection('ChatRequests');
  const response = await chatRequests.findOne({ chatId, userId, timeAnswered: 0 });
  console.log(response);
  return !!response;
}
async function cancelJob(chatId: string, userId: string): Promise<any> {
  const chatRequests = getDb().collection('ChatRequests');
  return chatRequests.deleteOne({ chatId, userId, timeAnswered: 0 });
}
async function resolveJob(chatId: string, userId: string, response: string): Promise<any> {
  const chatRequests = getDb().collection('ChatRequests');

  return chatRequests.updateOne(
    { chatId, userId, timeAnswered: 0 },
    {
      response,
      timeAnswered: Date.now(),
    },
  );
}

export { createJob, readOnGoingJob, resolveJob, cancelJob };
