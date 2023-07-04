import * as https from 'https';
import { OutgoingHttpHeaders, RequestOptions } from 'http';

console.log(`Has Key OPENAI_API_KEY: ${!!process.env.OPENAI_API_KEY}`);

interface ChatGPTMessage {
  role: string;
  content: string;
}
interface UserFacingMessage {
  author: string;
  content: string;
}

function sendTextToChatGPT(
  userPrompt: string,
  theologianPropmt: string,
  pastMessages: UserFacingMessage[] = [],
): Promise<string> {
  console.log('sending_request...');
  return new Promise((resolve, reject) => {
    const messages: ChatGPTMessage[] = [
      { role: 'system', content: theologianPropmt },
      ...pastMessages.map((message) => {
        return { role: message.author === 'user' ? 'user' : 'assistant', content: message.content };
      }),
      { role: 'user', content: userPrompt },
    ];
    console.log(messages);
    const apiKey: string | undefined = process.env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers: OutgoingHttpHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
    /* eslint-disable */
    const requestBody: { [key: string]: any } = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0,
    };
    /* eslint-enable */

    const options: RequestOptions = { method: 'POST', headers };
    const req = https.request(apiUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk: string) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          /* eslint-disable */
          const parsedData: { [key: string]: any } = JSON.parse(data);
          /* eslint-enable */
          console.log(parsedData);
          const response: string = parsedData.choices[0].message.content;
          resolve(response);
        } else {
          reject(`Error: ${res.statusCode}`);
        }
      });
    });
    req.on('error', (error: Error) => {
      reject(error);
    });
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

export { sendTextToChatGPT };
