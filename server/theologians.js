const db = require('./mongodb');
const ObjectId = require('mongodb').ObjectId;

//Excludes the prompt field to keep it short
async function getTheologians() {
    return db.getDb().collection('Theologians').find({}, { projection: { name: 1, imageUrl: 1, description: 1 } }).toArray();
}

async function upsertTheologian(name, prompt, description, imageUrl) {
    const theologians = db.getDb().collection('Theologians');
    const maybeTheologian = await theologians.findOne({ name });
    if (!maybeTheologian) {
        console.log("Creating: " + name);
        return createNewTheologian(name, prompt, description, imageUrl)
    }
    console.log("Syncing: " + name);
    return updateTheologian(maybeTheologian._id.toString(), name, prompt, description, imageUrl);
}

async function createNewTheologian(name, prompt, description, imageUrl) {
    const theologians = db.getDb().collection('Theologians');
    const theologian = {
        name,
        prompt,
        description,
        imageUrl
    };
    return theologians.insertOne(theologian);
}

async function updateTheologian(id, name, prompt, description, imageUrl) {
    const theologians = db.getDb().collection('Theologians');
    const theologian = {
        name,
        prompt,
        description,
        imageUrl
    };
    return theologians.updateOne({ _id: new ObjectId(id) }, { $set: theologian })
}

async function getTheologian(id) {
    const theologians = db.getDb().collection('Theologians');
    return theologians.findOne({ _id: new ObjectId(id) });
}

module.exports = {
    getTheologian,
    getTheologians,
    upsertTheologian,
    updateTheologian,
    createNewTheologian,
};