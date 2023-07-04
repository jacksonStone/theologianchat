import { connect, close } from './mongodb';
import { createNewChatHistory, readChat, appendUserAndChatGPTResponse } from './chatHistories';
import { getTheologians } from './theologians';

(async function () {
  await connect();
  const theologians = await getTheologians();
  console.log(theologians);
  const theologian = theologians.find((t) => t.name === 'C.S. Lewis');
  const teacherId = theologian?._id as string;
  const userId = 'test';

  const resp = await createNewChatHistory(teacherId, userId);
  console.log(resp);
  await appendUserAndChatGPTResponse(
    resp.insertedId.toString(),
    userId,
    'Should I study other religious texts such as the Quran?',
  );
  console.log(await readChat(resp.insertedId.toString(), userId));
  await close();
})();
