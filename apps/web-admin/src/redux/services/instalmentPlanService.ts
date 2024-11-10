import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IInstalmentPlan } from "../../interfaces/instalmentPlanInterface";

export const instalmentPlanApi = createApi({
  reducerPath: "instalmentPlanApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/instalmentPlan",
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
      query: () => "/",
      providesTags: ["InstalmentPlanList"],
    }),

    // Create instalment plan
    createInstalmentPlan: builder.mutation<
      IInstalmentPlan,
      Omit<IInstalmentPlan, "instalment_plan_id">
    >({
      query: (instalmentPlan) => ({
        url: "/",
        method: "POST",
        body: instalmentPlan,
      }),
      invalidatesTags: ["InstalmentPlanList"],
    }),

    // Update instalment plan
    updateInstalmentPlan: builder.mutation<IInstalmentPlan, IInstalmentPlan>({
      query: (instalmentPlan) => ({
        url: `/${instalmentPlan.instalment_plan_id}`,
        method: "PUT",
        body: instalmentPlan,
      }),
      invalidatesTags: ["InstalmentPlanList"],
    }),

    // Delete instalment plan
    deleteInstalmentPlan: builder.mutation<void, string>({
      query: (instalment_plan_id) => ({
        url: `/${instalment_plan_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InstalmentPlanList"],
    }),
  }),
});

export const {
  useGetInstalmentPlansQuery,
  useCreateInstalmentPlanMutation,
  useUpdateInstalmentPlanMutation,
  useDeleteInstalmentPlanMutation,
} = instalmentPlanApi;
