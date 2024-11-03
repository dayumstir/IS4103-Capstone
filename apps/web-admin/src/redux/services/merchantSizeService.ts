import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IMerchantSize } from  "@repo/interfaces";

export const merchantSizeApi = createApi({
  reducerPath: "merchantSizeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["MerchantSizeList"],
  endpoints: (builder) => ({
    // Get all merchant Size
    getMerchantSizes: builder.query<IMerchantSize[], void>({
      query: () => "/merchantSize",
      providesTags: ["MerchantSizeList"],
    }),

    // Create merchant Size
    createMerchantSize: builder.mutation<
    IMerchantSize,
      Omit<IMerchantSize, "merchant_size_id">
    >({
      query: (merchantSize) => ({
        url: "/merchantSize",
        method: "POST",
        body: merchantSize,
      }),
      invalidatesTags: ["MerchantSizeList"],
    }),

    // Update merchant Size
    updateMerchantSize: builder.mutation<IMerchantSize, IMerchantSize>({
      query: (merchantSize) => ({
        url: `/merchantSize/${merchantSize.merchant_size_id}`,
        method: "PUT",
        body: merchantSize,
      }),
      invalidatesTags: ["MerchantSizeList"],
    }),
  }),
});

export const {
  useGetMerchantSizesQuery,
  useCreateMerchantSizeMutation,
  useUpdateMerchantSizeMutation,
} = merchantSizeApi;
