import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IIssue } from "../../interfaces/issueInterface";

export const issueApi = createApi({
  reducerPath: 'issueApi',
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
  tagTypes: ['Issue'],
  endpoints: (builder) => ({
    // Get all Issues
    getAllIssues: builder.query<IIssue[], string | undefined>({
      query: (search = '') => {
        // Construct query parameters based on whether there is a search term
        const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
        return {
          url: `/allIssues${queryParams}`,
          method: 'GET',
        };
      },
      providesTags: ['Issue']
    }),

    // View Issue Details
    viewIssueDetails: builder.query<IIssue, string>({
      query: (issue_id) => ({
        url: `/issue/${issue_id}`,
        method: "GET",
      }),
      providesTags: ["Issue"],
    }),

    // Update Issue Outcome
    updateIssueOutcome: builder.mutation<IIssue, { issue_id: string; outcome: string }>({
      query: ({ issue_id, outcome }) => ({
        url: `issue/${issue_id}`,
        method: 'PUT',
        body: { outcome },
      }),
      invalidatesTags: ['Issue']
    }),
  }),
});

export const {
  useGetAllIssuesQuery,
  useViewIssueDetailsQuery,
  useUpdateIssueOutcomeMutation,
} = issueApi;