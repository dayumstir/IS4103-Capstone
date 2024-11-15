import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const creditScoreApi = createApi({
  reducerPath: "creditScoreApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:5000" }),
  endpoints: (builder) => ({
    getFirstCreditRating: builder.mutation<{ credit_rating: number }, FormData>(
      {
        query: (formData) => ({
          url: "/get-first-credit-rating",
          method: "POST",
          body: formData,
        }),
      },
    ),

    updateCreditRating: builder.mutation<
      { credit_rating: number },
      { customer_id: string }
    >({
      query: ({ customer_id }) => ({
        url: "/update-credit-rating",
        method: "POST",
        body: { customer_id },
      }),
    }),
  }),
});

export const {
  useGetFirstCreditRatingMutation,
  useUpdateCreditRatingMutation,
} = creditScoreApi;
