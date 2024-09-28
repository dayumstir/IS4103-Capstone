import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ICustomer } from "../../interfaces/customerInterface";

export const customerApi = createApi({
  reducerPath: 'customerApi',
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
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    // Get all Customers
    getAllCustomers: builder.query<ICustomer[], void>({
      query: () => '/allCustomers',
      providesTags: ['Customer']
    }),

    // Update Customer Status
    updateCustomerStatus: builder.mutation({
      query: ({ customer_id, status }) => ({
        url: `customer/${customer_id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Customer']
    }),
  }),
});

export const {
  useGetAllCustomersQuery,
  useUpdateCustomerStatusMutation,
} = customerApi;