import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

export const tokenSetupApi = createApi({
  reducerPath: "tokenSetupApi",
  tagTypes: ["Token"],
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
    getTokenAllApi: builder.query({
      query: (params) => ({ url: `/api-token`, method: "GET", params: params }),

      providesTags: ["Token"],
    }),

    postTokenApi: builder.mutation({
      query: (data) => ({
        url: `/api-token`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Token"],
    }),

    patchTokenStatusApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/archived-api-token/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Token"],
    }),

    updateTokenApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api-token/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Token"],
    }),
  }),
});

export const {
  useGetTokenAllApiQuery,
  usePostTokenApiMutation,
  usePatchTokenStatusApiMutation,
  useUpdateTokenApiMutation,
} = tokenSetupApi;
