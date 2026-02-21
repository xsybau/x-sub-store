import { generateKeyPairSync, randomBytes, type KeyObject } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface, type Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const ENV_EXAMPLE_PATH = ".env.example";
const ENV_PATH = ".env";

type EnvValues = Record<string, string>;

interface JwtKeyPair {
  privatePem: string;
  publicPem: string;
}

interface UserInputValues {
  traefikAcmeEmail: string;
  traefikAppHost: string;
  traefikCertMainDomain: string;
  traefikCertSans: string;
  traefikDnsProvider: string;
  traefikDnsResolvers: string;
  dockerApiVersion: string;
  appImage: string;
  cfDnsApiToken: string;
  mongoUrl: string;
  adminAuthTokenExpiresSeconds: string;
  adminRefreshTokenExpiresSeconds: string;
  devDomain: string;
  publicSubscriptionBaseUrl: string;
}

interface GeneratedSecrets {
  appSecret: string;
  adminSessionSecret: string;
  authKeyPair: JwtKeyPair;
  refreshKeyPair: JwtKeyPair;
}

const parseEnvContent = (content: string): EnvValues => {
  const values: EnvValues = {};
  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }
  return values;
};

const loadEnvValues = (path: string): EnvValues => {
  if (!existsSync(path)) return {};
  return parseEnvContent(readFileSync(path, "utf-8"));
};

const ask = async (
  rl: Interface,
  label: string,
  defaultValue: string,
  options?: { required?: boolean },
) => {
  const required = options?.required === true;
  const suffix = defaultValue ? ` [${defaultValue}]` : "";

  while (true) {
    const answer = (await rl.question(`${label}${suffix}: `)).trim();
    if (answer) return answer;
    if (defaultValue) return defaultValue;
    if (!required) return "";
    console.log("This value is required.");
  }
};

const askYesNo = async (
  rl: Interface,
  question: string,
  defaultAnswer: boolean,
) => {
  const suffix = defaultAnswer ? "[Y/n]" : "[y/N]";
  const answer = (await rl.question(`${question} ${suffix}: `))
    .trim()
    .toLowerCase();

  if (!answer) return defaultAnswer;
  if (answer === "y" || answer === "yes") return true;
  if (answer === "n" || answer === "no") return false;
  return defaultAnswer;
};

const exportPem = (key: KeyObject, kind: "private" | "public"): string => {
  if (kind === "private") {
    return key.export({ format: "pem", type: "pkcs8" }).toString("utf-8");
  }
  return key.export({ format: "pem", type: "spki" }).toString("utf-8");
};

const generateJwtKeyPair = (): JwtKeyPair => {
  const generated = generateKeyPairSync("ed25519");

  return {
    privatePem: exportPem(generated.privateKey, "private"),
    publicPem: exportPem(generated.publicKey, "public"),
  };
};

const asEnvMultilineValue = (value: string) =>
  value.trim().replace(/\r?\n/gu, "\\n");

const generateSecrets = (): GeneratedSecrets => {
  return {
    appSecret: randomBytes(32).toString("hex"),
    adminSessionSecret: randomBytes(32).toString("hex"),
    authKeyPair: generateJwtKeyPair(),
    refreshKeyPair: generateJwtKeyPair(),
  };
};

const printSecretBlock = (title: string, value: string) => {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
  console.log(value);
};

const buildEnvFileContent = (
  templateContent: string,
  values: EnvValues,
): string => {
  const lines = templateContent.split(/\r?\n/u);
  const renderedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) return line;

    const key = line.slice(0, separatorIndex).trim();
    const selectedValue = values[key];
    if (typeof selectedValue !== "string") return line;

    return `${key}=${selectedValue}`;
  });

  return `${renderedLines.join("\n")}\n`;
};

const pickDefault = (
  defaults: EnvValues,
  key: string,
  fallback = "",
  options?: { allowEmpty?: boolean },
) => {
  const value = defaults[key];
  if (typeof value !== "string") return fallback;
  if (options?.allowEmpty === true) return value;
  return value || fallback;
};

const askUserInputs = async (
  rl: Interface,
  defaults: EnvValues,
): Promise<UserInputValues> => {
  const traefikAcmeEmail = await ask(
    rl,
    "Traefik ACME email",
    pickDefault(defaults, "TRAEFIK_ACME_EMAIL", "admin@example.com"),
    { required: true },
  );

  const traefikCertMainDomain = await ask(
    rl,
    "Main certificate domain",
    pickDefault(defaults, "TRAEFIK_CERT_MAIN_DOMAIN", "example.com"),
    { required: true },
  );

  const traefikAppHost = await ask(
    rl,
    "App host (Traefik router host)",
    pickDefault(defaults, "TRAEFIK_APP_HOST", `app.${traefikCertMainDomain}`),
    { required: true },
  );

  const traefikCertSans = await ask(
    rl,
    "Certificate SANs",
    pickDefault(defaults, "TRAEFIK_CERT_SANS", `*.${traefikCertMainDomain}`),
    { required: true },
  );

  const traefikDnsProvider = await ask(
    rl,
    "Traefik DNS provider",
    pickDefault(defaults, "TRAEFIK_DNS_PROVIDER", "cloudflare"),
    { required: true },
  );

  const traefikDnsResolvers = await ask(
    rl,
    "Traefik DNS resolvers",
    pickDefault(defaults, "TRAEFIK_DNS_RESOLVERS", "1.1.1.1:53,8.8.8.8:53"),
    { required: true },
  );

  const dockerApiVersion = await ask(
    rl,
    "Docker API version",
    pickDefault(defaults, "DOCKER_API_VERSION", "1.44"),
    { required: true },
  );

  const appImage = await ask(
    rl,
    "App image",
    pickDefault(defaults, "APP_IMAGE", "ghcr.io/xsybau/x-sub-store:latest"),
    { required: true },
  );

  const cfDnsApiToken = await ask(
    rl,
    "Cloudflare DNS API token (optional)",
    pickDefault(defaults, "CF_DNS_API_TOKEN", "", { allowEmpty: true }),
  );

  const mongoUrl = await ask(
    rl,
    "Mongo URL",
    pickDefault(defaults, "MONGO_URL", "mongodb://mongo:27017/v2ray-hub"),
    { required: true },
  );

  const adminAuthTokenExpiresSeconds = await ask(
    rl,
    "Admin auth token TTL (seconds)",
    pickDefault(defaults, "ADMIN_AUTH_TOKEN_EXPIRES_SECONDS", "86400"),
    { required: true },
  );

  const adminRefreshTokenExpiresSeconds = await ask(
    rl,
    "Admin refresh token TTL (seconds)",
    pickDefault(defaults, "ADMIN_REFRESH_TOKEN_EXPIRES_SECONDS", "604800"),
    { required: true },
  );

  const devDomain = await ask(
    rl,
    "Dev domain",
    pickDefault(defaults, "DEV_DOMAIN", "localhost"),
    { required: true },
  );

  const publicSubscriptionBaseUrl = await ask(
    rl,
    "Public subscription base URL",
    pickDefault(
      defaults,
      "NUXT_PUBLIC_SUBSCRIPTION_BASE_URL",
      `https://${traefikAppHost}`,
    ),
  );

  return {
    traefikAcmeEmail,
    traefikAppHost,
    traefikCertMainDomain,
    traefikCertSans,
    traefikDnsProvider,
    traefikDnsResolvers,
    dockerApiVersion,
    appImage,
    cfDnsApiToken,
    mongoUrl,
    adminAuthTokenExpiresSeconds,
    adminRefreshTokenExpiresSeconds,
    devDomain,
    publicSubscriptionBaseUrl,
  };
};

const main = async () => {
  if (!existsSync(ENV_EXAMPLE_PATH)) {
    console.error(`Missing ${ENV_EXAMPLE_PATH}.`);
    process.exit(1);
  }

  const envExampleContent = readFileSync(ENV_EXAMPLE_PATH, "utf-8");
  const envExampleValues = parseEnvContent(envExampleContent);
  const existingEnvValues = loadEnvValues(ENV_PATH);
  const defaults = { ...envExampleValues, ...existingEnvValues };

  const rl = createInterface({ input, output });

  try {
    if (existsSync(ENV_PATH)) {
      const shouldOverwrite = await askYesNo(
        rl,
        `${ENV_PATH} already exists. Overwrite it?`,
        false,
      );
      if (!shouldOverwrite) {
        console.log("Cancelled.");
        return;
      }
    }

    console.log("\nProvide .env values (press Enter to accept defaults):\n");
    const userInputs = await askUserInputs(rl, defaults);
    const secrets = generateSecrets();

    const values: EnvValues = {
      TRAEFIK_ACME_EMAIL: userInputs.traefikAcmeEmail,
      TRAEFIK_APP_HOST: userInputs.traefikAppHost,
      TRAEFIK_CERT_MAIN_DOMAIN: userInputs.traefikCertMainDomain,
      TRAEFIK_CERT_SANS: userInputs.traefikCertSans,
      TRAEFIK_DNS_PROVIDER: userInputs.traefikDnsProvider,
      TRAEFIK_DNS_RESOLVERS: userInputs.traefikDnsResolvers,
      DOCKER_API_VERSION: userInputs.dockerApiVersion,
      APP_IMAGE: userInputs.appImage,
      CF_DNS_API_TOKEN: userInputs.cfDnsApiToken,
      APP_SECRET: secrets.appSecret,
      MONGO_URL: userInputs.mongoUrl,
      ADMIN_SESSION_SECRET: secrets.adminSessionSecret,
      ADMIN_AUTH_TOKEN_EXPIRES_SECONDS: userInputs.adminAuthTokenExpiresSeconds,
      ADMIN_REFRESH_TOKEN_EXPIRES_SECONDS:
        userInputs.adminRefreshTokenExpiresSeconds,
      ADMIN_AUTH_PRIVATE_KEY: asEnvMultilineValue(
        secrets.authKeyPair.privatePem,
      ),
      ADMIN_AUTH_PUBLIC_KEY: asEnvMultilineValue(secrets.authKeyPair.publicPem),
      ADMIN_REFRESH_PRIVATE_KEY: asEnvMultilineValue(
        secrets.refreshKeyPair.privatePem,
      ),
      ADMIN_REFRESH_PUBLIC_KEY: asEnvMultilineValue(
        secrets.refreshKeyPair.publicPem,
      ),
      DEV_DOMAIN: userInputs.devDomain,
      NUXT_PUBLIC_SUBSCRIPTION_BASE_URL: userInputs.publicSubscriptionBaseUrl,
    };

    const content = buildEnvFileContent(envExampleContent, values);
    writeFileSync(ENV_PATH, content, { encoding: "utf-8", mode: 0o600 });

    console.log(`\nCreated ${ENV_PATH}.\n`);
    console.log("Generated secrets:");

    printSecretBlock("APP_SECRET", secrets.appSecret);
    printSecretBlock("ADMIN_SESSION_SECRET", secrets.adminSessionSecret);
    printSecretBlock("ADMIN_AUTH_PRIVATE_KEY", secrets.authKeyPair.privatePem);
    printSecretBlock("ADMIN_AUTH_PUBLIC_KEY", secrets.authKeyPair.publicPem);
    printSecretBlock(
      "ADMIN_REFRESH_PRIVATE_KEY",
      secrets.refreshKeyPair.privatePem,
    );
    printSecretBlock(
      "ADMIN_REFRESH_PUBLIC_KEY",
      secrets.refreshKeyPair.publicPem,
    );
  } finally {
    rl.close();
  }
};

void main();
