import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

type SellerStatus = {
  charges_enabled: boolean;
  details_submitted: boolean;
};

type CreatePIReq = { amount: number; buyer_email?: string };
type CreatePIRes = { clientSecret: string; paymentIntentId: string };

type Order = {
  id: number;
  payment_intent_id: string;
  amount: number;
  fee: number;
  currency: string;
  buyer_email?: string | null;
  status: string;
  created_at: string;
};

export const stripeApi = createApi({
  reducerPath: "stripeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Seller", "Orders", "StripeStatus"],
  endpoints: (build) => ({
    startOnboarding: build.mutation<
      {
        onboarding_url: string;
        stripe_account_id: string;
        charges_enabled: boolean;
        details_submitted: boolean;
        requirements_currently_due: string[];
      },
      { mode?: "onboarding" | "update" } | void
    >({
      query: (body = {}) => ({
        url: "connect/onboarding",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StripeStatus"],
    }),

    stripeStatus: build.query<
      {
        stripe_account_id: string | null;
        charges_enabled: boolean;
        payouts_enabled: boolean;
        details_submitted: boolean;
        requirements_currently_due: string[];
      },
      void
    >({
      query: () => ({ url: "me/stripe" }),
      providesTags: ["StripeStatus"],
    }),

    // (опционально) link для обновления данных в Stripe (если сделал такой бэкенд)
    createUpdateLink: build.mutation<{ onboarding_url: string }, void>({
      query: () => ({
        url: "connect/account-link/update",
        method: "POST",
        body: {},
      }),
    }),

    // 5) создать PaymentIntent (Connect destination + комиссия)
    createPaymentIntent: build.mutation<CreatePIRes, CreatePIReq>({
      query: (body) => ({ url: "payments/intents", method: "POST", body }),
      // после успешной оплаты можно ручками refetch-нуть orders
    }),

    // 6) список заказов текущего продавца
    listOrders: build.query<{ results: Order[]; count?: number }, void>({
      query: () => ({ url: "orders" }), // если на бэке требуется email в query — обнови на auth-based
      providesTags: ["Orders"],
    }),

    // 7) (опционально) refund
    refund: build.mutation<
      { id: string; status: string },
      { payment_intent_id: string; amount?: number }
    >({
      query: (body) => ({ url: "payments/refund", method: "POST", body }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useStripeStatusQuery,
  useStartOnboardingMutation,
  useCreateUpdateLinkMutation,
  useCreatePaymentIntentMutation,
  useListOrdersQuery,
  useRefundMutation,
} = stripeApi;
