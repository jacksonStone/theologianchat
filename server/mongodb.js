const { MongoClient } = require('mongodb');

// You should ideally store this in environment variables, never hardcode this in real applications
const url = process.env.MONGODB_URI;
const dbName = 'theologianchat';

let db;
let client;

async function connect() {
    client = new MongoClient(url);
    await client.connect();
    console.log("Connected successfully to MongoDB server");

    db = client.db(dbName);
}
async function close() {
    await client.close()
}

function getDb() {
    return db;
}


module.exports = {
    connect,
    close,
    getDb,
};