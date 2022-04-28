import { describe, expect, test } from "@jest/globals";
import { DnsResolver } from "./dns";

describe("dns-resolver", () => {
  test("can resolve", async () => {
    const resolver = DnsResolver();
    const resolved = resolver("did:web:bengo.is");
    expect(resolved).toEqual("127.0.0.1");
  });
});
