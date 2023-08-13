import { connect, close } from './mongodb';
import { createNewChatHistory, readChat, appendUserAndChatGPTResponse } from './chatHistories';
import { deleteTestChats } from './theologians';

(async function () {
  await connect();
  const theologians = await deleteTestChats();
  await close();
})();
