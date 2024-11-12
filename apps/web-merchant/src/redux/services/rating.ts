// apps/web-merchant/src/redux/services/rating.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IRating } from "@repo/interfaces";

// Create an API slice for ratings using RTK Query
export const ratingApi = createApi({
    reducerPath: "ratingApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000/rating",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    endpoints: (builder) => ({

        // Create rating
        createRating: builder.mutation<IRating, Partial<IRating>>({
            query: (body) => ({
                url: `/add`,
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useCreateRatingMutation } = ratingApi;
