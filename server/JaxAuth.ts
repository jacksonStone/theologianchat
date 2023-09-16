let crypto = require('crypto')
const DEFAULT_HASHING_FUNCTION_NAME = "sha256"
const ENCRYPTION_FUNCTION_NAME = 'aes-128-cbc'
const COOKIE_NAME = "jaxauth"

export class JaxAuth<User> {
    public getUser: (userId: string) => Promise<User> = () => { throw new Error("Unimplemented, specify userGetter"); }
    public getUserHashPasswordField: (user: User) => string = () => { throw new Error("Unimplemented, specify getUserHashPasswordField"); }
    public getUserPasswordSaltField: (user: User) => string = () => ''
    public createRawCookieContents: (user: User) => string = () => { throw new Error("Unimplemented, specify createStringifiedCookieContents"); }
    public createWrongPasswordError: () => Error = () => new Error("Failed Validation")
    public getEncryptionSecret: () => string = () => { throw new Error("Must provide an encryption secret") }
    public getHMACKey: () => string = () => { throw new Error("Must provide an HMACKey") }
    public hashFunctionName: string = DEFAULT_HASHING_FUNCTION_NAME
    public encryptionFunctionName: string = ENCRYPTION_FUNCTION_NAME
    public experation: number = 1000 * 60 * 60 * 24 * 30 // 30 days
    public cookieName: string = COOKIE_NAME
    public useDevCookie: boolean = false
    /**
     * Attempts to login the user, if the login is successful, it will return the stringified cookie meant to contain auth details
     * @param userId 
     * @param password Plain text password
     * @returns 
     */
    public async attemptLoginAndGetCookie(userId: string | User, password: string): Promise<string> {
        let user: User;
        if(typeof userId === "string") {
            user = await this.getUser(userId);
        } else {
            user = userId
        }
        const hashPassword: string = this.getUserHashPasswordField(user);
        const saltForPassword: string = this.getUserPasswordSaltField(user);
        if (JaxAuth.hash(password + saltForPassword) !== hashPassword) {
            throw this.createWrongPasswordError();
        }
        // Correct Password, create cookie
        const cookieContents: string = this.createRawCookieContents(user);
        const encryptionSecret = this.getEncryptionSecret();
        let nonce = getNonce()

        let cipher = crypto.createCipheriv(ENCRYPTION_FUNCTION_NAME, encryptionSecret, nonce)
        cipher.setEncoding('hex')
        cipher.write(cookieContents)
        cipher.end()
        let crypted = cipher.read()
        let experation = this.experation + Date.now();
        let hmac = JaxAuth.hash(crypted + nonce + experation + this.getHMACKey())
        // Encrypted cookie with nonce and hmac
        const cookieContent = [nonce, experation, crypted, hmac].join(':')
        if(this.useDevCookie) {
            return this.cookieName+"="+encodeURIComponent(cookieContent)+'; Max-Age=' + this.experation + "; SameSite=None";
        }
        return this.cookieName+"="+encodeURIComponent(cookieContent)+'; HttpOnly; Max-Age=' + this.experation + "; SameSite=Strict; Secure";
    }
    /**
     * Takes the request "cookie" header string contents (raw), and will extract the auth header, verifying it's contents are legitimate and unexpired
     * @param rawCookieHeader 
     */
    public attemptCookieDecryption(rawCookieHeader: string | null | undefined): string {
        if(!rawCookieHeader) {
            throw new Error("no cookie value");
        }
        const headers = parseCookieHeader(rawCookieHeader);
        if(!headers[this.cookieName]) {
            throw new Error("No auth header");
        }
        const rawAuthCookie = headers[this.cookieName];
        if (!this.verifyBodyWithHMAC(rawAuthCookie)) {
            throw new Error("Tampered contents");
        }
        let parts = rawAuthCookie.split(':')
        let nonce = parts[0]
        let experation = parts[1]
        let encryptedText = parts[2]
        if(parseInt(experation) < Date.now()) {
            throw Error("Expired cookie");
        }
        let decipher = crypto.createDecipheriv(ENCRYPTION_FUNCTION_NAME, this.getEncryptionSecret(), nonce)
        let dec = decipher.update(encryptedText, 'hex', 'utf8')
        dec += decipher.final('utf8')
        return dec
    }

    private verifyBodyWithHMAC(encryptionBody: string) {
        let parts = encryptionBody.split(':')
        if (parts.length < 3) return false
        let nonce = parts[0]
        let experation = parts[1]
        let encryptedText = parts[2]
        let hmac = parts[3]
        let newHMAC = JaxAuth.hash(encryptedText + nonce + experation + this.getHMACKey())
        return hmac === newHMAC
    }

    public static hash(val: string): string {
        // Remove hardcoding once able to build
        const hashFunction = crypto.createHash("sha256")
        return hashFunction.update(val).digest('base64')
    }

    public static hashPassword(plainTextPassword: string, salt: string = "") {
        return JaxAuth.hash(plainTextPassword + salt);
    }
    public static generateSalt() {
        return crypto.randomBytes(16).toString('base64');
    }
}
export class JaxAuthBuilder<User> {
    private jaxAuthInstance: JaxAuth<User>;

    constructor() {
        this.jaxAuthInstance = new JaxAuth<User>();
    }

    setUseDevelopmentCookie(useDevCookie: boolean): JaxAuthBuilder<User> {
        this.jaxAuthInstance.useDevCookie = useDevCookie;
        return this;
    }

    setUserGetter(func: (userId: string) => Promise<User>): JaxAuthBuilder<User> {
        this.jaxAuthInstance.getUser = func;
        return this;
    }

    setUserHashPasswordField(func: (user: User) => string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.getUserHashPasswordField = func;
        return this;
    }

    setUserPasswordSaltField(func: (user: User) => string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.getUserPasswordSaltField = func;
        return this;
    }

    setStringifiedCookieContents(func: (user: User) => string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.createRawCookieContents = func;
        return this;
    }

    setEncryptionSecret(secret: string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.getEncryptionSecret = () => secret;
        return this;
    }

    setHMACKey(key: string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.getHMACKey = () => key;
        return this;
    }

    setCookieName(name: string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.cookieName = name;
        return this;
    }

    setHashFunctionName(name: string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.hashFunctionName = name;
        return this;
    }

    setEncryptionFunctionName(name: string): JaxAuthBuilder<User> {
        this.jaxAuthInstance.encryptionFunctionName = name;
        return this;
    }

    setExperation(time: number): JaxAuthBuilder<User> {
        this.jaxAuthInstance.experation = time;
        return this;
    }

    build(): JaxAuth<User> {
        return this.jaxAuthInstance;
    }

}


function getNonce() {
    const iv = Buffer.from(crypto.randomBytes(16))
    return iv.toString('hex').slice(0, 16)
}


function parseCookieHeader(cookieHeader: string): Record<string, string> {
    const result: Record<string, string> = {};

    // Split the header based on semi-colon followed by optional spaces
    const pairs = cookieHeader.split(/;\s*/);

    for (const pair of pairs) {
        const [key, ...rest] = pair.split('=');
        // Rejoin any '=' characters that were split
        const value = rest.join('=');

        result[key.trim()] = decodeURIComponent(value.trim());
    }

    return result;
}