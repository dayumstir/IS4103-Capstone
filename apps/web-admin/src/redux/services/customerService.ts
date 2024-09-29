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
    getAllCustomers: builder.query<ICustomer[], string | undefined>({
      query: (search = '') => {
        // Construct query parameters based on whether there is a search term
        const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
        return {
          url: `/allCustomers${queryParams}`,
          method: 'GET',
        };
      },
      providesTags: ['Customer']
    }),

    // View Customer Profile
    viewCustomerProfile: builder.query<ICustomer, string>({
      query: (customer_id) => ({
        url: `/customer/${customer_id}`,
        method: "GET",
      }),
      providesTags: ["Customer"],
    }),

    // Update Customer Status
    updateCustomerStatus: builder.mutation<ICustomer, ICustomer>({
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
  useViewCustomerProfileQuery,
  useUpdateCustomerStatusMutation,
} = customerApi;