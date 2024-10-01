import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IIssue, IssueFilter } from "../../interfaces/issueInterface";
import { RootState } from "../store"; // Make sure this import path is correct

// Define a service using a base URL and expected endpoints
export const issueApi = createApi({
  reducerPath: "issueApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/issue",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["IssueList"],
  endpoints: (builder) => ({
    // Create Issue
    createIssue: builder.mutation<IIssue, FormData>({
      query: (newIssue) => {
        console.log("Issue creation body:", newIssue);
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
} = issueApi;
