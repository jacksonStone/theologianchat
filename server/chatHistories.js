const db = require('./mongodb');
const ObjectId = require('mongodb').ObjectId;
const { sendTextToChatGPT } = require('./chatgpt');
const { getTheologian } = require('./theologians');

async function appendUserAndChatGPTResponse(chatId, userId, message) {
    const chat = await readChat(chatId, userId);
    // TODO: On the first chat create a summary message and make that the title
    return appendChatMessages(chatId, userId, [{
        content: message,
        author: "user"
    },
    {
        content: await sendTextToChatGPT(
            message,
            (await getTheologian(chat.theologianId)).prompt,
            chat.messages),
        author: "theologian"
    }]);
}
async function appendChatMessages(id, userId, messages) {
    //Appends the messages to the array of messages for the given chat
    const chatHistoriesCollection = db.getDb().collection('ChatHistories');
    return chatHistoriesCollection.updateOne({ _id: new ObjectId(id), userId }, {
        $push: {
            messages: { $each: messages }
        }
    });
}

async function createNewChatHistory(theologianId, userId) {
    const chatHistoriesCollection = db.getDb().collection('ChatHistories');
    const chatHistory = {
        theologianId,
        userId,
        messages: [],
    };
    const result = await chatHistoriesCollection.insertOne(chatHistory);
    return result;
}

async function deleteChatHistory(id, userId) {
    const chatHistoriesCollection = db.getDb().collection('ChatHistories');
    await chatHistoriesCollection.deleteOne({ _id: new ObjectId(id), userId });
    return;
}



async function readChat(id, userId) {
    const chatHistoriesCollection = db.getDb().collection('ChatHistories');
    const chatHistory = await chatHistoriesCollection.findOne({ _id: new ObjectId(id), userId });
    console.log("Found chatHistory: ", chatHistory)
    return chatHistory;
}
async function getChatList(userId) {
    const chatHistoriesCollection = db.getDb().collection('ChatHistories');
    // TODO Think of a smarter way to summerize
    return chatHistoriesCollection.find({ userId }, { projection: { chatId: 1, theologianId: 1, firstMessage: {$first: "$messages"}} }).toArray();
}

module.exports = {
    appendUserAndChatGPTResponse,
    createNewChatHistory,
    getChatList,
    readChat,
    deleteChatHistory
};