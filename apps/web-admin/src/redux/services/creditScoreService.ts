import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  GetFirstCreditRatingResult,
  UpdateCreditRatingResult,
  UpdateCreditScoreToBackend,
  UploadCCIResult,
} from "@repo/interfaces/creditTierInterface";

export const creditScoreApi = createApi({
  reducerPath: "creditScoreApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:5000/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Get first credit rating
    getFirstCreditRating: builder.mutation<
      GetFirstCreditRatingResult,
      FormData
    >({
      query: (body) => ({
        method: "POST",
        body: body,
        url: "/get-admin-credit-rating",
      }),
    }),
    updateCreditScore: builder.mutation<
      UpdateCreditRatingResult,
      UpdateCreditScoreToBackend
    >({
      query: (body) => ({
        method: "POST",
        body: body,
        url: "/admin-update-credit-rating",
      }),
    }),
    uploadCCI: builder.mutation<UploadCCIResult, FormData>({
      query: (body) => ({
        method: "POST",
        body: body,
        url: "/upload-cci",
      }),
    }),
  }),
});

export const {
  useGetFirstCreditRatingMutation,
  useUpdateCreditScoreMutation,
  useUploadCCIMutation,
} = creditScoreApi;
