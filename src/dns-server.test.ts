import { describe, expect, test } from "@jest/globals";
import { DnsServer, withServerListening } from "./dns";
import { Resolver } from "dns/promises";

describe("dns-server", () => {
  test("can listen", async () => {
    const server = new DnsServer();
    let serverListened = false;
    await withServerListening(server, undefined, "127.0.0.1", async () => {
      serverListened = true;
    });
    expect(serverListened).toEqual(true);
  });

  test("can resolve", async () => {
    const server = new DnsServer();
    let serverListened = false;
    await withServerListening(
      server,
      undefined,
      "127.0.0.1",
      async ({ address }) => {
        serverListened = true;
        const resolver = new Resolver();
        resolver.setServers([address]);
        const resolved = await resolver.resolve("dns:web:bengo.is");
        expect(resolved).toEqual(["127.0.0.1"]);
      }
    );
    expect(serverListened).toEqual(true);
  });
});
