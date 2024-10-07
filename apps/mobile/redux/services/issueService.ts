import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IIssue, IssueFilter, IssueStatus } from "@repo/interfaces";
import { RootState } from "../store"; // Make sure this import path is correct
import { API_URL } from "../../config/apiConfig";

// Define a service using a base URL and expected endpoints
export const issueApi = createApi({
  reducerPath: "issueApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/issue`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["IssueList", "IssueDetails"],

  endpoints: (builder) => ({
    // Create Issue
    createIssue: builder.mutation<IIssue, FormData>({
      query: (newIssue) => {
        return {
          url: "/",
          method: "POST",
          body: newIssue,
        };
      },
      invalidatesTags: ["IssueList"],
    }),

    // Get All Customer Issues
    getAllIssues: builder.query<IIssue[], { customer_id: string }>({
      query: ({ customer_id }) => ({
        url: "/list",
        method: "POST",
        body: { customer_id },
      }),
      providesTags: ["IssueList"],
    }),

    // Get All Issues with Filter
    getAllIssuesWithFilter: builder.mutation<IIssue[], IssueFilter>({
      query: (filter) => ({
        url: "/list",
        method: "POST",
        body: filter,
      }),
    }),

    // Get Issue by ID
    getIssueById: builder.query<IIssue, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["IssueDetails"],
    }),

    // Cancel Issue
    cancelIssue: builder.mutation<IIssue, { issue_id: string }>({
      query: ({ issue_id }) => ({
        url: `/${issue_id}`,
        method: "PUT",
        body: { status: IssueStatus.CANCELLED },
      }),
      invalidatesTags: ["IssueList", "IssueDetails"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateIssueMutation,
  useGetAllIssuesQuery,
  useGetAllIssuesWithFilterMutation,
  useGetIssueByIdQuery,
  useCancelIssueMutation,
} = issueApi;
