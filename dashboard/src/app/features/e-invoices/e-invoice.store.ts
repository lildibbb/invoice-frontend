import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  eInvoiceSubmissionsControllerListSubmissions,
  eInvoiceSubmissionsControllerGetStatus,
  eInvoiceSubmissionsControllerRetry,
} from '../../core/api';

export interface EInvoiceState {
  submissions: any[];
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: EInvoiceState = {
  submissions: [],
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,
};

export const EInvoiceStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadSubmissions(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await eInvoiceSubmissionsControllerListSubmissions();
        const response = data as any;
        patchState(store, {
          submissions: response?.data ?? response ?? [],
          pagination: {
            ...store.pagination(),
            total: response?.meta?.total ?? response?.total ?? 0,
          },
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load submissions' });
      }
    },

    async getStatus(uuid: string): Promise<any> {
      const { data } = await eInvoiceSubmissionsControllerGetStatus({ path: { uuid } });
      return data;
    },

    async retrySubmission(uuid: string): Promise<void> {
      await eInvoiceSubmissionsControllerRetry({ path: { uuid } });
    },

    setPage(page: number): void {
      patchState(store, { pagination: { ...store.pagination(), page } });
    },
  })),
);
