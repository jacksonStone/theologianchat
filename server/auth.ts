
import { JaxAuth, JaxAuthBuilder } from "./JaxAuth";
import { User } from "./types";

const auth: JaxAuth<User> = new JaxAuthBuilder<User>()
    .setUserPasswordSaltField(user => user.salt)
    .setUserHashPasswordField(user => user.hashedPassword)
    .setHMACKey(process.env.HMACKey as string)
    .setEncryptionSecret(process.env.ENCRYPTION_KEY as string)
    .setStringifiedCookieContents(user => JSON.stringify({userId: user.userId, userEmail: user.userEmail}))
    .setCookieName('auth')
    .setUseDevelopmentCookie(process.env.NODE_ENV !== "production")
    .build();

export default auth;