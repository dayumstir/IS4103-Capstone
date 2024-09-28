import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IMerchant } from "../../interfaces/merchantInterface";

export const merchantApi = createApi({
  reducerPath: 'merchantApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/admin',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Merchant'],
  endpoints: (builder) => ({
    // Get all Merchants
    getAllMerchants: builder.query<IMerchant[], void>({
      query: () => '/all<Merchant>s',
      providesTags: ['Merchant']
    }),

    // Update Merchant Status
    updateMerchantStatus: builder.mutation({
      query: ({ merchant_id, status }) => ({
        url: `merchant/${merchant_id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Merchant']
    }),
  }),
});

export const {
  useGetAllMerchantsQuery,
  useUpdateMerchantStatusMutation,
} = merchantApi;