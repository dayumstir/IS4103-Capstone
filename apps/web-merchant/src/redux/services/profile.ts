// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import { IMerchant } from "../../interfaces/models/merchantInterface";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";

// Define a service using a base URL and expected endpoints
export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: BaseQueryWithAuthCheck("http://localhost:3000/merchant/profile"),
  endpoints: (builder) => ({
    getProfile: builder.query<IMerchant, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
    editProfile: builder.mutation<IMerchant, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body: body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetProfileQuery, useEditProfileMutation } = profileApi;
