import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/apiConfig";
import { RootState } from "../store";
import { IRating } from "@repo/interfaces";

export const ratingApi = createApi({
  reducerPath: "ratingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/rating`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({

    // Create rating
    createRating: builder.mutation<IRating, Partial<IRating>>({
      query: (rating) => ({
        url: "/add",
        method: "POST",
        body: rating,
      }),
    }),
  }),
});

export const { useCreateRatingMutation } = ratingApi;
