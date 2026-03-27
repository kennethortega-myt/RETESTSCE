declare module 'jsencrypt' {
  export class JSEncrypt {
    constructor();
    setPublicKey(key: string): void;
    setPrivateKey(key: string): void;
    encrypt(text: string): string | false;
    decrypt(text: string): string | false;
  }
}
