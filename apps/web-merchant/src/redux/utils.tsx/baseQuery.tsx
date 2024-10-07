import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const createBaseQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
};

const BaseQueryWithAuthCheck = (baseUrl: string) => {
  const baseQuery = createBaseQuery(baseUrl);

  return async (args: any, api: any, extraOptions: any) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      localStorage.removeItem("merchantId");
      localStorage.removeItem("email");
      localStorage.removeItem("token");
    }

    return result;
  };
};

export default BaseQueryWithAuthCheck;
