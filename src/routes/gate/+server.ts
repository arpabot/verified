import type { RequestHandler } from "./$types";
import cookie from "cookie";

export const GET: RequestHandler = async ({ url }) => {
  const state = Array.from(crypto.getRandomValues(new Uint16Array(8)))
    .map((x) => x.toString(16))
    .join("");
  const scope = new URLSearchParams(url.search).get("scope");

  return new Response("", {
    headers: {
      "Set-Cookie": cookie.serialize(
        "data",
        JSON.stringify({
          state,
          guild_id: new URLSearchParams(url.search).get("guild_id")!,
        })
      ),
      Location: `https://discord.com/api/oauth2/authorize?client_id=1107486267450605608&redirect_uri=https%3A%2F%2F${url.host}%2Foauth2&response_type=code&scope=${encodeURIComponent(
        scope || "identify"
      )}&state=${state}`,
    },
    status: 301,
  });
};
