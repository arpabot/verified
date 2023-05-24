import type { RequestHandler } from "./$types";
import { _init } from "../interactions/+server";
import { Routes, RouteBases } from "discord-api-types/v10";
import { validateToken } from "sveltekit-turnstile";
import { wrap } from "cl-wrapper/index.ts";
let vpngateList: string;

export const POST: RequestHandler = async ({
  request,
  platform,
  getClientAddress,
  cookies,
  url
}) => {
  const ip =
    request.headers.get("true-client-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(", ")[0] ||
    getClientAddress();
  const client = _init(platform!.env);
  const vpngateList = await getVpngateList();
  const { proxy, mobile, hosting } = await (
    await fetch(`http://ip-api.com/json/${ip}?fields=16990208`)
  ).json<Record<string, boolean>>();
  const { code, token } = await request.json<Record<string, string>>();
  const guildId = JSON.parse(cookies.get("data")!).guild_id;
  if (!(await validateToken(token, platform!.env.turnstileSecretKey)))
    return new Response("", { status: 401 });
    
  if (proxy || mobile || hosting || vpngateList.match(ip))
    return new Response("", { status: 403 });

  const oauth2TokenExchange = await (
    await client.request(
      new Request(Routes.oauth2TokenExchange(), {
        method: "POST",
        // @ts-ignore
        body: new URLSearchParams({
          client_id: platform!.env.clientId,
          client_secret: platform!.env.secret,
          grant_type: "authorization_code",
          code,
          redirect_uri: "https://" + url.host +"/oauth2",
        }),
        headers: {
          // @ts-ignore
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    )
  ).json<Record<string, string>>();

  const { access_token, token_type } = oauth2TokenExchange;

  await wrap(oauth2TokenExchange, ip, guildId, platform!.env).catch(console.error);

  const user = await (
    await fetch(RouteBases.api + Routes.user(), {
      headers: { Authorization: token_type + " " + access_token },
    })
  ).json<any>();

  const response = await client.put(
    Routes.guildMemberRole(
      guildId || "",
      user.id,
      (await platform!.env.KV.get("roles-" + guildId)) || ""
    )
  );

  return new Response("", {
    status: response.status,
  });
};

async function getVpngateList() {
  if (vpngateList) return vpngateList;
  vpngateList = await (
    await fetch("http://www.vpngate.net/api/iphone/")
  ).text();
  return vpngateList;
}
