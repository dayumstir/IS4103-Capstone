// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/admin" }),
  endpoints: (builder) => ({
    profile: builder.query<string, string>({
      query: () => "/profile",
    }),
    editProfile: builder.mutation<string, string>({
      query: () => "/profile",
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useProfileQuery, useEditProfileMutation } = adminApi;