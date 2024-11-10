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
    // Get all merchant size
    getMerchantSizes: builder.query<IMerchantSize[], void>({
      query: () => "/merchantSize",
      providesTags: ["MerchantSizeList"],
    }),

    // Create merchant size
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

    // Update merchant size
    updateMerchantSize: builder.mutation<IMerchantSize, IMerchantSize>({
      query: (merchantSize) => ({
        url: `/merchantSize/${merchantSize.merchant_size_id}`,
        method: "PUT",
        body: merchantSize,
      }),
      invalidatesTags: ["MerchantSizeList"],
    }),
    
    // Delete merchant size
    deleteMerchantSize: builder.mutation<void, string>({
      query: (id) => ({
        url: `/merchantSize/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MerchantSizeList"],
    }),
  }),
});

export const {
  useGetMerchantSizesQuery,
  useCreateMerchantSizeMutation,
  useUpdateMerchantSizeMutation,
  useDeleteMerchantSizeMutation,
} = merchantSizeApi;
