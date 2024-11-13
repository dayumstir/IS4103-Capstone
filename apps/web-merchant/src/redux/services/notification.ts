// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";
import { INotification } from "@repo/interfaces";

// Define a service using a base URL and expected endpoints
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: BaseQueryWithAuthCheck("/notification"),
  tagTypes: ["NotificationList"],
  endpoints: (builder) => ({
    // Get merchant notifications
    getMerchantNotifications: builder.query<INotification[], string>({
      query: (searchTerm) => ({
        url: "/merchant",
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
    updateNotification: builder.mutation<INotification, INotification>({
      query: (notification) => ({
        url: `/${notification.notification_id}`,
        method: "PUT",
        body: notification,
      }),
      invalidatesTags: ["NotificationList"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetMerchantNotificationsQuery,
  useGetNotificationQuery,
  useUpdateNotificationMutation,
} = notificationApi;
