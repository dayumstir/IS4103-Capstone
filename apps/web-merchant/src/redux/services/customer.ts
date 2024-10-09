// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import { ICustomer } from "../../interfaces/models/customerInterface";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";

// Define a service using a base URL and expected endpoints
export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: BaseQueryWithAuthCheck("http://localhost:3000/admin/customer"),
  endpoints: (builder) => ({
    getCustomer: builder.query<ICustomer, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetCustomerQuery } = customerApi;
