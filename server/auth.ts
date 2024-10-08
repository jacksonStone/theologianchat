import { JaxAuth, JaxAuthBuilder } from './JaxAuth';
import { User } from './types';
import { Buffer } from 'buffer';

const auth: JaxAuth<User> = new JaxAuthBuilder<User>()
  .setUserPasswordSaltField((user) => user.salt)
  .setUserHashPasswordField((user) => user.hashedPassword)
  // HMACKey and EncryptionKey are stored in hex in the environment variables
  // EncryptionKey is 16 bytes long, HMACKey is 32 bytes long
  .setHMACKey((process.env.HMAC_KEY as string).substring(0, 32))
  .setEncryptionSecret((process.env.ENCRYPTION_KEY as string).substring(0, 16))
  .setStringifiedCookieContents((user) => JSON.stringify({ userId: user.userId, userEmail: user.userEmail }))
  .setCookieName('auth')
  .setUseDevelopmentCookie(process.env.NODE_ENV !== 'production')
  .build();

export default auth;
