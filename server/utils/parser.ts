import { Buffer } from "node:buffer";
import { URL, URLSearchParams } from "node:url";

export interface NodeFingerprint {
  protocol: string;
  host: string;
  port: string;
  id?: string; // uuid or password
  sni?: string; // optional extra deduplication key
  path?: string;
  uri: string; // Original URI
  name?: string; // Extracted name
}

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asStringOrNumber = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
};

export const parseNode = (uri: string): NodeFingerprint | null => {
  try {
    uri = uri.trim();
    let name = "";
    if (uri.includes("#")) {
      const parts = uri.split("#");
      name = decodeURIComponent(parts.at(-1) || "");
    }

    if (uri.startsWith("vmess://")) {
      const b64 = uri.substring(8);
      try {
        const json = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
        return {
          protocol: "vmess",
          host: json.add,
          port: String(json.port),
          id: json.id,
          sni: json.sni || json.host || "",
          path: json.path || "",
          uri,
          name: json.ps || name,
        };
      } catch {
        return null;
      }
    }

    if (uri.startsWith("vless://") || uri.startsWith("trojan://")) {
      // URL parser might fail on custom protocols if not careful, but usually ok
      // If it fails, we might need to replace protocol with http temporarily
      const safeUri = uri.replace(/^(vless|trojan):\/\//, "http://");
      const url = new URL(safeUri);
      const params = new URLSearchParams(url.search);
      return {
        protocol: uri.startsWith("vless") ? "vless" : "trojan",
        host: url.hostname,
        port: url.port,
        id: url.username, // uuid/password
        sni: params.get("sni") || "",
        path: params.get("path") || "",
        uri,
        name: url.hash ? decodeURIComponent(url.hash.substring(1)) : name,
      };
    }

    if (uri.startsWith("ss://")) {
      let content = uri.substring(5);
      let fragment = "";
      const hashIndex = content.indexOf("#");
      if (hashIndex > -1) {
        fragment = content.substring(hashIndex + 1);
        content = content.substring(0, hashIndex);
      }

      // Check if base64 encoded (no @ usually means base64 user:pass@host:port)
      if (!content.includes("@")) {
        try {
          content = Buffer.from(content, "base64").toString("utf-8");
        } catch {}
      }

      const atIndex = content.lastIndexOf("@");
      if (atIndex > -1) {
        const hostPort = content.substring(atIndex + 1);
        const [host = "", port = ""] = hostPort.split(":");
        return {
          protocol: "ss",
          host,
          port,
          id: content.substring(0, atIndex), // method:password
          uri,
          name: fragment ? decodeURIComponent(fragment) : name,
        };
      }
    }

    // Ignore others for fingerprinting but keep them?
    // Requirement: "Deduplicate nodes using a stable fingerprint".
    // If we can't fingerprint, we can't deduplicate effectively.
    // We will return null for unknown formats, effectively dropping them from deduplication logic
    // (or we can include them as unique if we return a unique fingerprint).
    // Let's return a simple fingerprint for unknown types using the whole URI?
    // No, safer to just return null or minimal info.

    return null;
  } catch (e) {
    return null;
  }
};

export const isInformationalNode = (uri: string): boolean => {
  try {
    const trimmed = uri.trim();
    if (!(trimmed.startsWith("vless://") || trimmed.startsWith("trojan://"))) {
      return false;
    }

    const safeUri = trimmed.replace(/^(vless|trojan):\/\//, "http://");
    const url = new URL(safeUri);
    const params = new URLSearchParams(url.search);

    // Known marker used by some providers for usage/time metadata entries.
    const sni = (params.get("sni") || "").toLowerCase();
    if (sni === "fake_ip_for_sub_link") {
      return true;
    }

    // Fallback pattern for "HH.MM--YYYY.MM.DD.time" style hosts.
    const host = (url.hostname || "").toLowerCase();
    if (/--\d{4}\.\d{2}\.\d{2}\.time$/.test(host)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const PROTOCOLS = ["vmess://", "vless://", "trojan://", "ss://", "ssr://"];

export const extractNodes = (content: string): string[] => {
  let decoded = content.trim();

  // Attempt base64 decode if it doesn't look like a list
  const hasProtocol = PROTOCOLS.some((p) => decoded.includes(p));

  if (!hasProtocol) {
    try {
      // Fix base64 padding/url-safe
      const safeBase64 = decoded.replace(/-/g, "+").replace(/_/g, "/");
      const buffer = Buffer.from(safeBase64, "base64");
      const d = buffer.toString("utf-8");
      if (PROTOCOLS.some((p) => d.includes(p))) {
        decoded = d;
      }
    } catch {}
  }

  return decoded
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && PROTOCOLS.some((p) => l.startsWith(p)));
};
