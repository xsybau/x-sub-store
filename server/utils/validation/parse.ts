import type { H3Event } from "h3";
import { ZodError, type ZodType } from "zod";

interface ValidationIssue {
  path: string;
  message: string;
}

const toIssues = (error: ZodError): ValidationIssue[] => {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
};

const throwValidationError = (statusMessage: string, error: ZodError) => {
  throw createError({
    statusCode: 400,
    statusMessage,
    data: {
      issues: toIssues(error),
    },
  });
};

const parseWithSchema = <T>(
  input: unknown,
  schema: ZodType<T>,
  statusMessage: string,
): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throwValidationError(statusMessage, error);
    }

    throw error;
  }
};

export const parseBody = async <T>(
  event: H3Event,
  schema: ZodType<T>,
): Promise<T> => {
  const body: unknown = await readBody(event);
  return parseWithSchema(body, schema, "Invalid request body");
};

export const parseQueryParams = <T>(event: H3Event, schema: ZodType<T>): T => {
  return parseWithSchema(getQuery(event), schema, "Invalid query parameters");
};

export const parseRouteParams = <T>(event: H3Event, schema: ZodType<T>): T => {
  return parseWithSchema(
    event.context.params,
    schema,
    "Invalid route parameters",
  );
};

export const parseHeaders = <T>(event: H3Event, schema: ZodType<T>): T => {
  return parseWithSchema(getHeaders(event), schema, "Invalid request headers");
};
