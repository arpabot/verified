interface Env {
  publicKey: string;
  token: string;
  clientId: string;
  secret: string;
  KV: KVNamespace;
  turnstileSecretKey: string,
  endpoint: string
}

declare namespace App {
  interface Platform {
    env: Env;
  }
}

declare module "cl-wrapper/index.ts" {
  export async function wrap(...args: any[]);
}