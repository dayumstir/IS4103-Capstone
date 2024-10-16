// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import { IAdmin } from "../../interfaces/models/adminInterface";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";

// Define a service using a base URL and expected endpoints
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: BaseQueryWithAuthCheck("/admin/profile"),
  endpoints: (builder) => ({
    getAdmin: builder.query<IAdmin, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAdminQuery } = adminApi;
