const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connect } = require('./mongodb');
const { createNewChatHistory, readChat, appendUserAndChatGPTResponse, getChatList } = require('./chatHistories');
const { assert } = require('console');
const { getTheologians } = require('./theologians');

const app = express();

// middleware to parse request bodies
app.use(bodyParser.json());

// add a new chat message in the chat history
// will get a reply from chatGPT and save that as well as return it to the user.
app.post('/api/chat/:id', (req, res) => {
    let chatId = req.params.id;
    let message = req.body.message;
    let userId = "test"
    appendUserAndChatGPTResponse(chatId, userId, message).then((result) => {
        res.send(result);
    })
});

// get chat history so far
app.get('/api/chat/:id', (req, res) => {
    let chatId = req.params.id;
    let userId = "test"
    readChat(chatId, userId).then((result) => {
        res.send(result);
    })
});

app.get('/api/chat-view/:id', (req, res) => {
    // get chat history based on id and return it
    let chatId = req.params.id;
    let userId = "test"
    Promise.all(readChat(chatId, userId), )
    readChat(chatId, userId).then((result) => {
        res.send(result);
    });
})

app.get('/api/chats', (req, res) => {
    // get chat history based on id and return it
    let userId = "test"

    getChatList(userId).then((result) => {
        res.send(result);
    });
})

// create a new chat
app.post('/api/chat', (req, res) => {
    let theologianId = req.body.theologianId;
    let userId = "test"

    assert(theologianId && message);
    createNewChatHistory(theologianId, userId).then((result) => {
        res.send(result);
    })
});

// enumerate theologians
app.get('/api/theologians', (req, res) => {
    getTheologians().then((result) => {
        res.send(result);
    })
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
connect().then(() => {
    const port = 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
});
