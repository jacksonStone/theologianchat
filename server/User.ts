import { getDb } from './mongodb';
import { JaxAuth } from './JaxAuth';
import { randomUUID } from 'crypto';
async function insertUser(userId: string, userEmail: string, salt: string, hashedPassword: string): Promise<void> {
    const users = getDb().collection('Users');
    await users.insertOne({
        userId,
        userEmail,
        salt,
        hashedPassword
    });
}
export async function createUser(userEmail: string, textPassword: string) {
    const salt = JaxAuth.generateSalt();
    const hashedPassword = JaxAuth.hashPassword(textPassword, salt);
    const userId = randomUUID();
    return insertUser(userId, userEmail, salt, hashedPassword);
}

export async function getUserByEmail(userEmail: string): Promise<any> {
    const users = getDb().collection('Users');
    return users.findOne({ userEmail });
}
