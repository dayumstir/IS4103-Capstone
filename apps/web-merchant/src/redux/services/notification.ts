// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";
import { INotification } from "@repo/interfaces";

// Define a service using a base URL and expected endpoints
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: BaseQueryWithAuthCheck("/notification"),
  endpoints: (builder) => ({
    // Get merchant notifications
    getMerchantNotifications: builder.query<INotification[], string>({
      query: (searchTerm) => ({
        url: "/merchant",
        method: "GET",
        params: { search: searchTerm },
      }),
    }),

    // Get notification by id
    getNotification: builder.query<INotification, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetMerchantNotificationsQuery, useGetNotificationQuery } =
  notificationApi;