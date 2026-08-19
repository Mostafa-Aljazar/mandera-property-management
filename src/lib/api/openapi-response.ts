import { NextResponse } from "next/server";

/**
 * OpenAPI response helpers for the flat mobile API contract.
 * Unlike apiSuccess/apiError, these return raw JSON on success
 * and {message} on error, per openapi.yaml's non-wrapped format.
 */

export function openApiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function openApiError(
  message: string,
  status = 400,
): NextResponse<{ message: string }> {
  return NextResponse.json({ message }, { status });
}
