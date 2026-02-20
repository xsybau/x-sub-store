import { describe, expect, test } from "bun:test";
import { deduplicateNodes } from "../server/utils/deduplicator";
import { Buffer } from "node:buffer";

describe("Deduplicator", () => {
  test("should deduplicate identical nodes", () => {
    const nodes = [
      { uri: "vmess://abc", priority: 1, source: "Global" },
      { uri: "vmess://abc", priority: 2, source: "User" },
    ];
    // deduplicateNodes sorts by priority desc (User first)
    // Then iterates. Seen 'vmess://abc' -> added.
    // Next 'vmess://abc' -> seen -> skipped.
    const result = deduplicateNodes(nodes);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("vmess://abc");
  });

  test("should deduplicate based on fingerprint", () => {
    // Mock parseNode logic by using valid vmess
    // We need actual valid base64 vmess for parseNode to work
    const v1 = { add: "h", port: 80, id: "u", ps: "name1" };
    const v2 = { add: "h", port: 80, id: "u", ps: "name2" };
    const uri1 = `vmess://${Buffer.from(JSON.stringify(v1)).toString("base64")}`;
    const uri2 = `vmess://${Buffer.from(JSON.stringify(v2)).toString("base64")}`;

    const nodes = [
      { uri: uri1, priority: 1, source: "Global" }, // Low prio
      { uri: uri2, priority: 2, source: "User" }, // High prio
    ];

    const result = deduplicateNodes(nodes);

    expect(result).toHaveLength(1);
    // Should correspond to uri2 because higher priority (2 > 1)
    expect(result[0]).toBe(uri2);
  });

  test("should place informational nodes at the top", () => {
    const infoUri =
      "trojan://1@04.49--2026.02.17.time:0449?sni=fake_ip_for_sub_link&security=tls#info";
    const normalUri =
      "trojan://60f5d0cb-9e52-4f11-8c56-a362daff5609@example.com:443?security=tls#normal";

    const result = deduplicateNodes([
      { uri: normalUri, priority: 2, source: "User" },
      { uri: infoUri, priority: 2, source: "User" },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(infoUri);
    expect(result[1]).toBe(normalUri);
  });

  test("should place informational nodes at the top", () => {
    const infoUri =
      "trojan://1@04.49--2026.02.17.time:0449?sni=fake_ip_for_sub_link&security=tls#info";
    const normalUri =
      "trojan://60f5d0cb-9e52-4f11-8c56-a362daff5609@example.com:443?security=tls#normal";

    const result = deduplicateNodes([
      { uri: normalUri, priority: 2, source: "User" },
      { uri: infoUri, priority: 2, source: "User" },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(infoUri);
    expect(result[1]).toBe(normalUri);
  });
});
