import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from 'openai';

console.log(`Has Key OPENAI_API_KEY: ${!!process.env.OPENAI_API_KEY}`);

interface ChatGPTMessage {
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
}
interface UserFacingMessage {
  author: string;
  content: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function sendTextToChatGPT(
  userPrompt: string,
  theologianPropmt: string,
  pastMessages: UserFacingMessage[] = [],
): Promise<string> {
  console.log('sending_request...');
  const messages: ChatGPTMessage[] = [
    { role: ChatCompletionRequestMessageRoleEnum.System, content: theologianPropmt },
    ...pastMessages.map((message) => {
      return {
        role:
          message.author === 'user'
            ? ChatCompletionRequestMessageRoleEnum.User
            : ChatCompletionRequestMessageRoleEnum.Assistant,
        content: message.content,
      };
    }),
    { role: ChatCompletionRequestMessageRoleEnum.User, content: userPrompt },
  ];
  try {
    const chatResponse = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages,
    });
    if (!chatResponse.data.choices[0].message?.content) {
      throw new Error('No message in response');
    }
    return chatResponse.data.choices[0].message.content;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export { sendTextToChatGPT };
