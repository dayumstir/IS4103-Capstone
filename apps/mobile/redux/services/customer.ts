import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { ICustomer } from "../../interfaces/customerInterface";

// Define the base URL for customer API interactions
export const customerApi = createApi({
  reducerPath: "customerApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/customer",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // Pass JWT token in header
      }
      return headers;
    },
  }),

  tagTypes: ["CustomerProfile"],

  endpoints: (builder) => ({
    // View profile API call
    getProfile: builder.query<ICustomer, void>({
      query: () => "/profile", // API endpoint for fetching profile
      providesTags: ["CustomerProfile"],
    }),

    // Edit profile API call
    editProfile: builder.mutation<ICustomer, Partial<ICustomer>>({
      query: (body) => ({
        url: "/profile",
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["CustomerProfile"],
    }),
  }),
});

export const { useGetProfileQuery, useEditProfileMutation } = customerApi;
