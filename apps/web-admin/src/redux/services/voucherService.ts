import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IVoucher } from "../../interfaces/voucherInterface";
import { IVoucherAssigned } from "../../interfaces/voucherAssignedInterface";

// Create an API slice for vouchers using RTK Query
export const voucherApi = createApi({
    reducerPath: "voucherApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000/voucher",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["VoucherList", "VoucherDetails", "VoucherAssigned"],
    endpoints: (builder) => ({
        // Create voucher
        createVoucher: builder.mutation<IVoucher, Omit<IVoucher, "voucher_id">>({
            query: (voucher) => ({
                url: "/create",
                method: "POST",
                body: voucher,
            }),
            invalidatesTags: ["VoucherList"],
        }),

        // Assign voucher to customer
        assignVoucher: builder.mutation<IVoucherAssigned, { customer_id: string; voucher_id: string }>({
            query: ({ customer_id, voucher_id }) => ({
                url: "/assign",
                method: "POST",
                body: { customer_id, voucher_id },
            }),
            invalidatesTags: ["VoucherAssigned"],
        }),

        // Deactivate voucher
        deactivateVoucher: builder.mutation<IVoucher, string>({
            query: (voucher_id) => ({
                url: `/deactivate/${voucher_id}`,
                method: "PUT",
            }),
            invalidatesTags: ["VoucherList", "VoucherAssigned", "VoucherDetails"],
        }),

        // Fetch all vouchers
        getVouchers: builder.query<IVoucher[], string | undefined>({
            query: (search = '') => {
                const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
                return {
                    url: `/${queryParams}`,
                    method: 'GET',
                };
            },
            providesTags: ["VoucherList"]
        }),

        // Fetch voucher details
        getVoucherDetails: builder.query<IVoucher, string>({
            query: (voucher_id) => ({
                url: `/${voucher_id}`,
            }),
            providesTags: (result, error, voucher_id) => [
                { type: "VoucherDetails", id: voucher_id },
            ],
        }),
    }),
});

export const {
    useCreateVoucherMutation,
    useAssignVoucherMutation,
    useDeactivateVoucherMutation,
    useGetVouchersQuery,
    useGetVoucherDetailsQuery,
  } = voucherApi;