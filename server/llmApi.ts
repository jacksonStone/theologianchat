import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { Groq } from 'groq-sdk';
let groq: Groq | null = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

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

async function sendTextToLlm(
  userPrompt: string,
  theologianPropmt: string,
  pastMessages: UserFacingMessage[] = [],
): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    return sendTextToGroqLlama(userPrompt, theologianPropmt, pastMessages);
  }
  if (process.env.OPENAI_API_KEY) {
    return sendTextToOpenAi(userPrompt, theologianPropmt, pastMessages);
  }
  throw new Error('No API key found');
}

async function sendTextToGroqLlama(
  userPrompt: string,
  theologianPropmt: string,
  pastMessages: UserFacingMessage[] = [],
): Promise<string> {
  console.log('sending_request to Groq Llama...');
  const messages = [
    { role: 'system', content: theologianPropmt },
    ...pastMessages.map((message) => {
      return {
        role: message.author === 'user' ? 'user' : 'assistant',
        content: message.content,
      };
    }),
    { role: 'user', content: userPrompt },
  ];
  const result = await groq!.chat.completions.create({
    messages: messages as unknown as any,
    model: 'llama3-70b-8192',
  });
  if (!result.choices[0].message?.content) {
    console.log('Falling back to openai');
    return sendTextToOpenAi(userPrompt, theologianPropmt, pastMessages);
  }
  return result.choices[0].message.content;
}

async function sendTextToOpenAi(
  userPrompt: string,
  theologianPropmt: string,
  pastMessages: UserFacingMessage[] = [],
): Promise<string> {
  console.log('sending_request to OpenAi...');
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

export { sendTextToLlm };
