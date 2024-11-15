// apps/web-admin/src/redux/services/adminService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IAdmin } from "@repo/interfaces";

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
    // Get own admin profile
    getProfile: builder.query<IAdmin, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),

    // Get admin profile by ID
    getProfileById: builder.query<IAdmin, string>({
      query: (admin_id) => ({
        url: `/profile/${admin_id}`,
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),

    // Edit admin profile
    updateProfile: builder.mutation<IAdmin, Partial<IAdmin>>({
      query: (updatedProfile) => ({
        url: "/profile",
        method: "PUT",
        body: updatedProfile,
      }),
      invalidatesTags: ["AdminProfile"],
    }),

    // Add new admin
    addAdmin: builder.mutation<IAdmin, Partial<IAdmin>>({
      query: (newAdmin) => ({
        url: "/add",
        method: "POST",
        body: newAdmin,
      }),
      invalidatesTags: ["AdminProfile"],
    }),

    // View all admins
    viewAllAdmin: builder.query<IAdmin[], void>({
      query: () => ({
        url: "/get-all",
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),

    // Update admin status (Activate/Deactivate)
    updateStatus: builder.mutation<string, { admin_id: string; admin_type: "DEACTIVATED" | "ACTIVATE" }>({
      query: ({ admin_id, admin_type }) => ({
        url: admin_type === "DEACTIVATED" ? "/deactivate-admin" : "/activate-admin",
        method: "PUT",
        body: admin_id,
      }),
      invalidatesTags: ["AdminProfile"],
    }),  
  }),
});

export const {
  useGetProfileQuery,
  useGetProfileByIdQuery,
  useUpdateProfileMutation,
  useAddAdminMutation,
  useViewAllAdminQuery,
  useUpdateStatusMutation,
} = adminApi;
