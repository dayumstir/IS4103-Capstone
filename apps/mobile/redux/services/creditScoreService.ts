import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const creditScoreApi = createApi({
  reducerPath: "creditScoreApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:5000" }),
  endpoints: (builder) => ({
    getFirstCreditRating: builder.mutation<
      { credit_rating: number },
      FormData | void
    >({
      query: () => ({
        url: "/get-first-credit-rating",
        method: "POST",
      }),
    }),

    updateCreditRating: builder.mutation<
      { credit_rating: number },
      { customer_id: string }
    >({
      query: () => ({
        url: "/update-credit-rating",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetFirstCreditRatingMutation,
  useUpdateCreditRatingMutation,
} = creditScoreApi;
