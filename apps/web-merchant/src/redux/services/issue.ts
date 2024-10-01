// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { IIssue, IssueFilter } from "../../interfaces/models/issueInterface";

// Define a service using a base URL and expected endpoints
export const issueApi = createApi({
  reducerPath: "issueApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/issue",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createIssue: builder.mutation<IIssue, FormData>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body: body,
      }),
    }),
    getIssue: builder.query<IIssue, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
    getIssues: builder.mutation<IIssue[], IssueFilter>({
      query: (body) => ({
        url: "/list",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateIssueMutation,
  useGetIssueQuery,
  useGetIssuesMutation,
} = issueApi;
