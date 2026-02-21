export const useSubscriptionUrlBuilder = () => {
  const runtimeConfig = useRuntimeConfig();

  const normalizeBaseUrl = (value: string): string => {
    return value.trim().replace(/\/+$/, "");
  };

  const isPrivateIpv4Host = (hostname: string): boolean => {
    const octets = hostname.split(".");
    if (octets.length !== 4) {
      return false;
    }

    const values = octets.map((octet) => Number.parseInt(octet, 10));
    if (
      values.some((value) => Number.isNaN(value) || value < 0 || value > 255)
    ) {
      return false;
    }

    const first = values[0];
    const second = values[1];
    if (first === undefined || second === undefined) {
      return false;
    }

    return (
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  };

  const isPrivateIpv6Host = (hostname: string): boolean => {
    const normalized = hostname.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  };

  const shouldUseHttpSubscriptionUrl = (hostname: string): boolean => {
    const normalized = hostname.toLowerCase();
    return (
      normalized === "localhost" ||
      normalized.endsWith(".localhost") ||
      normalized.endsWith(".local") ||
      normalized.endsWith(".test") ||
      isPrivateIpv4Host(normalized) ||
      isPrivateIpv6Host(normalized)
    );
  };

  const buildSubscriptionUrl = (token: string): string => {
    const configuredBaseUrl = normalizeBaseUrl(
      runtimeConfig.public.subscriptionBaseUrl,
    );

    if (configuredBaseUrl) {
      return `${configuredBaseUrl}/subs/${token}`;
    }

    if (import.meta.client) {
      if (shouldUseHttpSubscriptionUrl(window.location.hostname)) {
        return `http://${window.location.hostname}/subs/${token}`;
      }

      return `${window.location.origin}/subs/${token}`;
    }

    return `/subs/${token}`;
  };

  return {
    buildSubscriptionUrl,
  };
};
