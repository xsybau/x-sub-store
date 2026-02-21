import { useI18n } from "vue-i18n";
import type { FetchError } from "ofetch";

export const useApiErrorMessage = () => {
  const { t } = useI18n();

  const getErrorMessage = (error: unknown): string => {
    if (typeof error !== "object" || !error) {
      return t("common.errors.unexpected");
    }

    const candidate = error as FetchError;
    const message =
      candidate.data && typeof candidate.data === "object"
        ? (candidate.data as { message?: string }).message
        : undefined;

    return message || candidate.message || t("common.errors.unexpected");
  };

  return {
    getErrorMessage,
  };
};
