// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  IIssue,
  IssueFilter,
  IssueStatus,
} from "../../interfaces/models/issueInterface";

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
    cancelIssue: builder.mutation<IIssue, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "PUT",
        body: { status: IssueStatus.CANCELLED },
      }),
    }),
    searchIssues: builder.mutation<
      IIssue[],
      { search: string; merchant_id: string }
    >({
      query: ({ search, merchant_id }) => {
        const queryString = search
          ? `?search=${encodeURIComponent(search)}`
          : "";
        return {
          url: `/list${queryString}`,
          method: "POST",
          body: { merchant_id: merchant_id },
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateIssueMutation,
  useGetIssueQuery,
  useGetIssuesMutation,
  useCancelIssueMutation,
  useSearchIssuesMutation,
} = issueApi;
