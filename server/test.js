const { Configuration, OpenAIApi } = require('openai');
(async function () {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const chatResponse = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'how are you?' }], // Some messages
  });
  console.log(chatResponse);
})();
