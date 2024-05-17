import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const transferApi = createApi({
  reducerPath: "transferApi",
  tagTypes: ["Transfer"],

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VLADIMIR_BASE_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", `application/json`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getTransferApi: builder.query({
      query: (params) => `asset-transfer?per_page=${params.per_page}&page=${params.page}&search=${params.search}`,
      providesTags: ["Transfer"],
    }),

    getTransferAllApi: builder.query({
      query: () => `asset-transfer?pagination=none`,
      providesTags: ["Transfer"],
    }),

    postTransferApi: builder.mutation({
      query: (data) => ({
        url: `asset-transfer`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    deleteTransferApi: builder.mutation({
      query: (transfer_number) => ({
        url: `remove-transfer-item/${transfer_number}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    downloadAttachmentApi: builder.mutation({
      query: (transfer_number) => ({
        url: `transfer-attachment/${transfer_number}`,
      }),
    }),
  }),
});

export const {
  useGetTransferApiQuery,
  useLazyGetTransferAllApiQuery,
  useGetTransferAllApiQuery,
  usePostTransferApiMutation,
  useDeleteTransferApiMutation,
  useDownloadAttachmentApiMutation,
} = transferApi;
