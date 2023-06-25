const https = require('https');
console.log(`Has Key OPENAI_API_KEY: ${!!process.env.OPENAI_API_KEY}`);

function sendTextToChatGPT(userPrompt, theologianPropmt, pastMessages = []) {
    console.log(arguments)
    console.log("sending_request...");
    return new Promise((resolve, reject) => {
        const messages = [
            { "role": "system", "content": theologianPropmt },
            ...pastMessages.map((message) => { return { "role": message.author === "user" ? "user" : "assistant", "content": message.content } }),
            { "role": "user", "content": userPrompt }]
        console.log(messages);
        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
        const requestBody = {
            model: "gpt-3.5-turbo",
            messages,
            temperature: 0
        };
        const options = { method: 'POST', headers };
        const req = https.request(apiUrl, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const parsedData = JSON.parse(data);
                    console.log(parsedData);
                    response = parsedData.choices[0].message.content;
                    resolve(response);
                } else { reject(`Error: ${res.statusCode}`); }
            });
        });
        req.on('error', (error) => { reject(error); });
        req.write(JSON.stringify(requestBody));
        req.end();
    })
}
module.exports = {
    sendTextToChatGPT
}