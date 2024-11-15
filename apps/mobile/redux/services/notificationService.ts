// apps/mobile/redux/services/notificationService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/apiConfig";
import { RootState } from "../store";
import { INotification } from "@repo/interfaces";

// Define a service using a base URL and expected endpoints
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/notification`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["NotificationList"],
  endpoints: (builder) => ({
    // Create Notification
    createNotification: builder.mutation<
      INotification,
      Omit<INotification, "notification_id">
    >({
      query: (notification) => ({
        url: "/notification/add",
        method: "POST",
        body: notification,
      }),
      invalidatesTags: ["Notification"],
    }),
    // Get customer notifications
    getCustomerNotifications: builder.query<INotification[], string>({
      query: (searchTerm) => ({
        url: "/customer",
        method: "GET",
        params: { search: searchTerm },
      }),
      providesTags: ["NotificationList"],
    }),

    // Get notification by id
    getNotification: builder.query<INotification, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),

    // Update notification
    updateNotification: builder.mutation<INotification, Partial<INotification>>(
      {
        query: (notification) => ({
          url: `/${notification.notification_id}`,
          method: "PUT",
          body: notification,
        }),
        invalidatesTags: ["NotificationList"],
      },
    ),
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateNotificationMutation,
  useGetCustomerNotificationsQuery,
  useGetNotificationQuery,
  useUpdateNotificationMutation,
} = notificationApi;
