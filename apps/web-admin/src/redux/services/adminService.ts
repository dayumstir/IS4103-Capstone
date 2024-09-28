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

    viewAllAdmin: builder.query<IAdmin, void>({
      query: () => ({
        url: "/get-all",
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),

    updateStatus: builder.mutation<String, { updatedAdminId: string; admin_type: string }>({
      query: ({ updatedAdminId, admin_type })  => {
        console.log("Updating admin ID:", updatedAdminId); // Log the updated admin ID
        if(admin_type=="DEACTIVATE"){
        return {
          url: "/deactivate-admin",
          method: "PUT",
          body: { admin_id : updatedAdminId 
          },
        };
      }
        return {
          url: "/activate-admin",
          method: "PUT",
          body: { admin_id : updatedAdminId 
          },
        };
      },
      invalidatesTags: ["AdminProfile"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useViewProfileQuery, useUpdateProfileMutation, useViewAllAdminQuery, useUpdateStatusMutation } = adminApi;
