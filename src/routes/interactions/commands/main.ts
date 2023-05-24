import { Client, reply } from "cloudcord";
import config, { raw } from "../config";
import {
  ButtonStyle,
  type APIApplicationCommandInteractionDataRoleOption,
  type APIChatInputApplicationCommandGuildInteraction,
  type APIApplicationCommandInteractionDataSubcommandOption,
  type APIApplicationCommandInteractionDataStringOption,
} from "discord-api-types/v10";

export default function (client: Client<Env, typeof raw>, env: Env) {
  class Main {
    @client.command(config.config)
    async config(interaction: APIChatInputApplicationCommandGuildInteraction) {
      console.log(JSON.stringify(interaction.data));
      await env.KV.put(
        "roles-" + interaction.guild_id,
        (
          (
            interaction.data
              .options![0] as APIApplicationCommandInteractionDataSubcommandOption
          ).options![0] as APIApplicationCommandInteractionDataRoleOption
        ).value
      );
      return reply(":o:");
    }

    @client.command(config.send_panel)
    async send_panel(
      interaction: APIChatInputApplicationCommandGuildInteraction
    ) {
      const conf =
        raw[client.commands.toSupportedLocale(interaction.locale, raw)];
      return reply({
        embeds: [{ description: conf._.webDescription, color: 0xff00ff }],
        components: [
          {
            type: 1,
            components: [
              {
                style: ButtonStyle.Link,
                type: 2,
                label: conf._.verify,
                url:
                  "https://verified.identmous.com/gate?guild_id=" +
                  interaction.guild_id + "&scope=" + encodeURIComponent((interaction.data.options?.[0] as unknown as APIApplicationCommandInteractionDataStringOption)?.value || "identify"),
              },
            ],
          },
        ],
      });
    }
  }
  return Main;
}
