<script lang="ts">
  import { onMount } from "svelte";
  import { Turnstile } from "sveltekit-turnstile";
  import { parse } from "cookie";
  import { raw } from "../interactions/config";
  import { Commands, Client } from "../../../cloudcord";
  import type { LocaleString } from "discord-api-types/v10";
  let statusText: string;
  let config: (typeof raw)["en" | "ja"];
  let params: URLSearchParams;

  onMount(async () => {
    params = new URLSearchParams(new URL(location.href).search);
    config =
      raw[
        new Commands<Env, typeof raw>(
          "",
          "",
          {} as Client<Env, typeof raw>
        ).toSupportedLocale(navigator.language as LocaleString, raw)
      ];
    const stateFromQuery = params.get("state");
    const stateFromCookie = JSON.parse(parse(document.cookie)["data"]).state;

    if (stateFromCookie !== stateFromQuery)
      location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  });

  function onFailed() {
    statusText = config._.frontError;
    setTimeout(
      () => (location.href = "https://www.google.com/robots.txt"),
      3000
    );
  }

  async function onSuccess(e: CustomEvent<{ token: string }>) {
    const res = await fetch("/execute", {
      method: "POST",
      body: JSON.stringify({
        token: e.detail.token,
        code: params.get("code"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401)
      location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    if (res.status === 403) return (statusText = config._.restrictedAddress);

    statusText = config._.verified;
  }
</script>

<div class="main">
  <div class="center">
    {#if config}
      {#if !statusText}
        <p>{config._.verify}</p>
        <div>
          <Turnstile
            siteKey="0x4AAAAAAAFFJQZaQURKW6eJ"
            on:turnstile-timeout={onFailed}
            on:turnstile-error={onFailed}
            on:turnstile-expired={() => location.reload()}
            on:turnstile-callback={onSuccess}
          />
        </div>
      {:else}
        <p>{statusText}</p>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  :global {
    body {
      background-color: rgb(18, 18, 18);
      font-family: Arial, Helvetica, sans-serif;
      color: white;
    }
  }

  .main {
    margin: 1em;
    background-color: rgb(18, 18, 18);
    * {
      margin: 1em;
    }
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
