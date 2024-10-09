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
    tagTypes: ["Voucher"] as const,
    endpoints: (builder) => ({
        // Create voucher
        createVoucher: builder.mutation<IVoucher, Partial<IVoucher>>({
            query: (voucher) => ({
                url: "/create",
                method: "POST",
                body: voucher,
            }),
            invalidatesTags: [{ type: 'Voucher', id: 'LIST' }] // Invalidate the entire voucher list
        }),

        // Assign voucher to customer
        assignVoucher: builder.mutation<IVoucherAssigned, { email: string; voucher_id: string }>({
            query: ({ email, voucher_id }) => ({
                url: "/assign",
                method: "POST",
                body: { email, voucher_id },
            }),
            invalidatesTags: (_, __, arg) => [{ type: 'Voucher', id: arg.voucher_id }] // Invalidate the specific voucher by ID
        }),

        // Deactivate voucher
        deactivateVoucher: builder.mutation<IVoucher, string>({
            query: (voucher_id) => ({
                url: `/deactivate/${voucher_id}`,
                method: "PUT",
            }),
            invalidatesTags: (_, __, arg) => [{ type: 'Voucher', id: arg }] // Invalidate the specific voucher by ID
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
            providesTags: (result) =>
                result
                    ? [
                        { type: 'Voucher', id: 'LIST' }, // Tag for the entire list
                        ...result.map((voucher) => ({ type: 'Voucher', id: voucher.voucher_id } as const)), // Tag for each individual voucher
                    ]
                    : [{ type: 'Voucher', id: 'LIST' }] // If result is undefined, still provide the 'LIST' tag
        }),

        // Fetch voucher details
        getVoucherDetails: builder.query<IVoucher, string>({
            query: (voucher_id) => ({
                url: `/${voucher_id}`,
            }),
            providesTags: (_, __, arg) => [{ type: 'Voucher', id: arg }] // Provide a tag for the specific voucher by ID
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
  