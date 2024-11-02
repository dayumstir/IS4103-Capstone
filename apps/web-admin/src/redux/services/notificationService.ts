import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  INotification,
  NotificationPriority,
} from "@repo/interfaces/notificationInterface";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/",
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Notification"],
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

    // Get all Notifications
    getAllNotifications: builder.query<INotification[], string | undefined>({
      query: (search = "") => {
        // Construct query parameters based on whether there is a search term
        const queryParams = search
          ? `?search=${encodeURIComponent(search)}`
          : "";
        return {
          url: `/admin/allNotifications${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["Notification"],
    }),

    // View Notification Details
    viewNotificationDetails: builder.query<INotification, string>({
      query: (notification_id) => ({
        url: `/admin/notification/${notification_id}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useViewNotificationDetailsQuery,
} = notificationApi;
