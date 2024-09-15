// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Define a service using a base URL and expected endpoints
export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
    // TODO: Change to env variable (base url)
    baseUrl: "http://localhost:3000/customer",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
export const { useProfileQuery, useEditProfileMutation } = customerApi;
