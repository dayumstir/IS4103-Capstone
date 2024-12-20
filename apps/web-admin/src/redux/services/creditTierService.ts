import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ICreditTier } from "../../interfaces/creditTierInterface";

export const creditTierApi = createApi({
  reducerPath: "creditTierApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/creditTier",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["CreditTierList"],
  endpoints: (builder) => ({
    // Get all credit tiers
    getCreditTiers: builder.query<ICreditTier[], void>({
      query: () => "/",
      providesTags: ["CreditTierList"],
    }),

    getCreditTierByScore: builder.query<ICreditTier, number>({
      query: (creditScore) => `/credit-tier?score=${creditScore}`,
      providesTags: ["CreditTierList"],
    }),

    // Create credit tier
    createCreditTier: builder.mutation<
      ICreditTier,
      Omit<ICreditTier, "credit_tier_id">
    >({
      query: (creditTier) => ({
        url: "/",
        method: "POST",
        body: creditTier,
      }),
      invalidatesTags: ["CreditTierList"],
    }),

    // Update credit tier
    updateCreditTier: builder.mutation<ICreditTier, ICreditTier>({
      query: (creditTier) => ({
        url: `/${creditTier.credit_tier_id}`,
        method: "PUT",
        body: creditTier,
      }),
      invalidatesTags: ["CreditTierList"],
    }),

    // Delete credit tier
    deleteCreditTier: builder.mutation<void, string>({
      query: (credit_tier_id) => ({
        url: `/${credit_tier_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CreditTierList"],
    }),
  }),
});

export const {
  useGetCreditTiersQuery,
  useGetCreditTierByScoreQuery,
  useCreateCreditTierMutation,
  useUpdateCreditTierMutation,
  useDeleteCreditTierMutation,
} = creditTierApi;
