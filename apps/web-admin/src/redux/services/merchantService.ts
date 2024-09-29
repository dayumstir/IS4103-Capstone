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
    getAllMerchants: builder.query<IMerchant[], string | undefined>({
      query: (search = '') => {
        // Construct query parameters based on whether there is a search term
        const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
        return {
          url: `/allMerchants${queryParams}`,
          method: 'GET',
        };
      },
      providesTags: ['Merchant']
    }),

    // View Merchant Profile
    viewMerchantProfile: builder.query<IMerchant, IMerchant>({
      query: ({ merchant_id }) => ({
        url: `/merchant/${merchant_id}`,
        method: "GET",
      }),
      providesTags: ["Merchant"],
    }),

    // Update Merchant Status
    updateMerchantStatus: builder.mutation({
      query: ({ merchant_id, status }) => ({
        url: `/merchant/${merchant_id}`,
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