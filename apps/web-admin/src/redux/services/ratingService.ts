// apps/web-admin/src/redux/services/ratingService.ts
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
        
        // Get all ratings
        getRatings: builder.query<IRating[], string | undefined>({
            query: (search = '') => {
                const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
                return {
                    url: `/list${queryParams}`,
                    method: 'POST',
                };
            },
        }),

        // Get rating by ID
        getRating: builder.query<IRating, string>({
            query: (rating_id) => ({
                url: `/${rating_id}`,
                method: 'GET',
            }),
        }),
    }),
});

export const { useGetRatingsQuery, useGetRatingQuery } = ratingApi;
