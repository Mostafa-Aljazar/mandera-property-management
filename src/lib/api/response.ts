import { NextResponse } from "next/server";
import type { IApiError, IApiSuccess } from "@/types/api.type";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<IApiSuccess<T>>({ success: true, data }, { status });
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json<IApiError>(
    { success: false, error: { code, message } },
    { status },
  );
}
