import { getDb } from './mongodb';
import { ObjectId, InsertOneResult } from 'mongodb';

interface Theologian {
  _id: string;
  name: string;
  prompt: string;
  description: string;
  imageUrl: string;
}

interface PartialTheologian {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
}

async function getTheologians(): Promise<PartialTheologian[]> {
  return getDb()
    .collection('Theologians')
    .find({}, { projection: { name: 1, imageUrl: 1, description: 1 } })
    .toArray() as unknown as Promise<PartialTheologian[]>;
}

async function upsertTheologian(name: string, prompt: string, description: string, imageUrl: string): Promise<void> {
  const theologians = getDb().collection('Theologians');
  const maybeTheologian = await theologians.findOne({ name });
  if (!maybeTheologian) {
    console.log('Creating: ' + name);
    await createNewTheologian(name, prompt, description, imageUrl);
    return;
  }
  console.log('Syncing: ' + name);
  await updateTheologian(maybeTheologian._id.toString(), name, prompt, description, imageUrl);
}

async function createNewTheologian(
  name: string,
  prompt: string,
  description: string,
  imageUrl: string,
): Promise<InsertOneResult<{ _id: string }>> {
  const theologians = getDb().collection('Theologians');
  const theologian = {
    name,
    prompt,
    description,
    imageUrl,
  };
  return theologians.insertOne(theologian);
}

async function updateTheologian(
  id: string,
  name: string,
  prompt: string,
  description: string,
  imageUrl: string,
): Promise<void> {
  const theologians = getDb().collection('Theologians');
  const theologian = {
    name,
    prompt,
    description,
    imageUrl,
  };
  await theologians.updateOne({ _id: new ObjectId(id) }, { $set: theologian });
}

async function getTheologian(id: string): Promise<Theologian | null> {
  const theologians = getDb().collection('Theologians');
  return theologians.findOne({ _id: new ObjectId(id) }) as Promise<Theologian | null>;
}

export { getTheologian, getTheologians, upsertTheologian, updateTheologian, createNewTheologian };
