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
      console.log(token);
      if (token) {
        headers.set("authorization", `Bearer ${token}`);  // Pass JWT token in header
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // View Profile API Call
    getProfile: builder.query<ICustomer, void>({
      query: () => "/profile",  // API endpoint for fetching profile
    }),
    editProfile: builder.mutation<string, string>({
      query: (updateData) => ({
        url: "/profile",
        method: "PUT",
        body: updateData,
      }),
    }),
  }),
});

export const { useGetProfileQuery, useEditProfileMutation } = customerApi;
