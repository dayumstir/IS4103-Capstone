import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { ICustomer, IInstalmentPlan } from "@repo/interfaces";
import { API_URL } from "../../config/apiConfig";

// Define the base URL for customer API interactions
export const customerApi = createApi({
  reducerPath: "customerApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/customer`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // Pass JWT token in header
      }
      return headers;
    },
  }),

  tagTypes: ["CustomerProfile", "InstalmentPlans"],

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

    // Get eligible instalment plans
    getInstalmentPlans: builder.query<IInstalmentPlan[], void>({
      query: () => "/instalment-plans",
      providesTags: ["InstalmentPlans"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useEditProfileMutation,
  useGetInstalmentPlansQuery,
} = customerApi;
