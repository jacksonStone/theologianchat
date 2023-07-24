import { MongoClient, Db } from 'mongodb';

const url = process.env.MONGODB_URI || '';
const dbName = 'theologianchat';

let db: Db;
let client: MongoClient;

async function connect() {
  client = new MongoClient(url, {});
  await client.connect();
  console.log('Connected successfully to MongoDB server');

  db = client.db(dbName);
}

async function close() {
  await client.close();
}

function getDb(): Db {
  return db;
}

export { connect, close, getDb };
