import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IInstalmentPlan } from "../../interfaces/instalmentPlanInterface";

export const instalmentPlanApi = createApi({
  reducerPath: "instalmentPlanApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["InstalmentPlanList"],
  endpoints: (builder) => ({
    // Get all instalment plans
    getInstalmentPlans: builder.query<IInstalmentPlan[], void>({
      query: () => "/instalmentPlan",
      providesTags: ["InstalmentPlanList"],
    }),

    // Create instalment plan
    createInstalmentPlan: builder.mutation<
      IInstalmentPlan,
      Omit<IInstalmentPlan, "instalment_plan_id">
    >({
      query: (instalmentPlan) => ({
        url: "/instalmentPlan",
        method: "POST",
        body: instalmentPlan,
      }),
      invalidatesTags: ["InstalmentPlanList"],
    }),

    // Update instalment plan
    updateInstalmentPlan: builder.mutation<IInstalmentPlan, IInstalmentPlan>({
      query: (instalmentPlan) => ({
        url: `/instalmentPlan/${instalmentPlan.instalment_plan_id}`,
        method: "PUT",
        body: instalmentPlan,
      }),
      invalidatesTags: ["InstalmentPlanList"],
    }),
  }),
});

export const {
  useGetInstalmentPlansQuery,
  useCreateInstalmentPlanMutation,
  useUpdateInstalmentPlanMutation,
} = instalmentPlanApi;
