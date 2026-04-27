import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  paymentsControllerGetPayments,
  paymentsControllerRecordPayment,
  paymentsControllerGetBalance,
  paymentsControllerDeletePayment,
} from '../../core/api';

export interface PaymentState {
  payments: any[];
  balance: any | null;
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  balance: null,
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,
};

export const PaymentStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadPayments(invoiceUuid: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await paymentsControllerGetPayments({
          path: { uuid: invoiceUuid },
        } as any);
        const payload = (data as any)?.data ?? data;
        patchState(store, {
          payments: Array.isArray(payload) ? payload : payload?.data ?? [],
          pagination: {
            ...store.pagination(),
            total: payload?.meta?.total ?? payload?.total ?? 0,
          },
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load payments' });
      }
    },

    async recordPayment(invoiceUuid: string, body: any): Promise<any> {
      const { data, error } = await paymentsControllerRecordPayment({
        path: { uuid: invoiceUuid },
        body,
      } as any);
      if (error) throw error;
      return (data as any)?.data ?? data;
    },

    async getBalance(invoiceUuid: string): Promise<void> {
      try {
        const { data } = await paymentsControllerGetBalance({
          path: { uuid: invoiceUuid },
        } as any);
        patchState(store, { balance: (data as any)?.data ?? data });
      } catch {
        // silently fail
      }
    },

    async deletePayment(invoiceUuid: string, paymentUuid: string): Promise<void> {
      await paymentsControllerDeletePayment({
        path: { invoiceUuid, paymentUuid },
      } as any);
    },

    setPage(page: number): void {
      patchState(store, { pagination: { ...store.pagination(), page } });
    },
  })),
);
