import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { logout } from "./features/customerAuthSlice";

function isPayloadWithStatus(payload: unknown): payload is { status: number } {
  return typeof payload === "object" && payload !== null && "status" in payload;
}

export const authMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (
      isRejectedWithValue(action) &&
      isPayloadWithStatus(action.payload) &&
      action.payload.status === 401
    ) {
      console.log("Unauthorized request, logging out");
      dispatch(logout());
    }

    return next(action);
  };
