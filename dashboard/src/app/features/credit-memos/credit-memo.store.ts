import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  creditMemosControllerFindByInvoice,
  creditMemosControllerCreate,
  creditMemosControllerIssue,
  creditMemosControllerVoid,
} from '../../core/api';

export interface CreditMemoState {
  memos: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CreditMemoState = {
  memos: [],
  isLoading: false,
  error: null,
};

export const CreditMemoStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadByInvoice(invoiceUuid: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await creditMemosControllerFindByInvoice({
          path: { invoiceUuid },
        } as any);
        const payload = (data as any)?.data ?? data;
        patchState(store, {
          memos: Array.isArray(payload) ? payload : [],
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load credit memos' });
      }
    },

    async create(body: {
      invoiceUuid: string;
      amount: number;
      reason: string;
    }): Promise<any> {
      const { data, error } = await creditMemosControllerCreate({ body } as any);
      if (error) throw error;
      return (data as any)?.data ?? data;
    },

    async issue(id: string): Promise<any> {
      const { data, error } = await creditMemosControllerIssue({
        path: { id },
      } as any);
      if (error) throw error;
      return (data as any)?.data ?? data;
    },

    async voidMemo(id: string): Promise<any> {
      const { data, error } = await creditMemosControllerVoid({
        path: { id },
      } as any);
      if (error) throw error;
      return (data as any)?.data ?? data;
    },
  })),
);
