import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAdmin } from "../../interfaces/adminInterface";

// Define a service using a base URL and expected endpoints
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
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

    // View all admins
    viewAllAdmin: builder.query<IAdmin, void>({
      query: () => ({
        url: "/get-all",
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),

    // Update admin status
    updateStatus: builder.mutation<
      String,
      { updatedAdminId: string; admin_type: string }
    >({
      query: ({ updatedAdminId, admin_type }) => {
        console.log("Updating admin ID:", updatedAdminId); // Log the updated admin ID
        if (admin_type == "DEACTIVATED") {
          return {
            url: "/deactivate-admin",
            method: "PUT",
            body: { admin_id: updatedAdminId },
          };
        } else if (admin_type == "ACTIVATE") {
        return {
          url: "/activate-admin",
          method: "PUT",
          body: { admin_id: updatedAdminId },
        };}
      },
      invalidatesTags: ["AdminProfile"],
    }),

    // Add new admin
    addAdmin: builder.mutation<IAdmin, Partial<IAdmin>>({
      query: (newAdmin) => ({
        url: "/add",
        method: "POST",
        body: newAdmin,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useViewProfileQuery,
  useUpdateProfileMutation,
  useViewAllAdminQuery,
  useUpdateStatusMutation,
  useAddAdminMutation,
} = adminApi;
