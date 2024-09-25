import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAdmin } from "../../interfaces/adminInterface";

// Define a service using a base URL and expected endpoints
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    // TODO: Change to env variable (base url)
    baseUrl: "http://localhost:3000/admin",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AdminProfile"],
  endpoints: (builder) => ({
    // View Profile
    viewProfile: builder.query<IAdmin, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),

    // Update Profile
    updateProfile: builder.mutation<IAdmin, Partial<IAdmin>>({
      query: (updatedProfile) => ({
        url: "/profile",
        method: "PUT",
        body: updatedProfile,
      }),
      invalidatesTags: ["AdminProfile"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useViewProfileQuery, useUpdateProfileMutation } = adminApi;
