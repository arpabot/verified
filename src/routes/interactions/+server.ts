import type { RequestHandler } from "@sveltejs/kit";
import { Client } from "cloudcord";
import main from "./commands/main";
import { raw } from "./config";
let client: Client<Env, typeof raw>;

export const POST: RequestHandler = async ({ platform, request }) => {
  _init(platform!.env);

  return client.handleRequest(request);
};

export const GET: RequestHandler = async ({ platform }) => {
  _init(platform!.env);

  return new Response(JSON.stringify(await client.commands.register()));
};

export function _init(env: Env): Client<Env, typeof raw> {
  if (client) return client;
  client = new Client(env, raw);
  main(client, env);
  return client;
}
