import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  quotationsControllerFindAll,
  quotationsControllerFindOne,
  quotationsControllerCreate,
  quotationsControllerUpdate,
  quotationsControllerRemove,
  quotationsControllerSend,
  quotationsControllerAccept,
  quotationsControllerReject,
  quotationsControllerRevise,
  quotationsControllerConvertToInvoice,
} from '../../core/api';

export interface QuotationFilters {
  search: string;
  status: string | null;
}

export interface QuotationState {
  quotations: any[];
  selectedQuotation: any | null;
  filters: QuotationFilters;
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: QuotationState = {
  quotations: [],
  selectedQuotation: null,
  filters: { search: '', status: null },
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,
};

export const QuotationStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadQuotations(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { filters } = store;
        const status = filters().status?.toUpperCase() as any;
        const { data } = await quotationsControllerFindAll({
          query: {
            ...(status && { status }),
          },
        });
        const response = data as any;
        patchState(store, {
          quotations: response?.data ?? response ?? [],
          pagination: {
            ...store.pagination(),
            total: response?.meta?.total ?? response?.total ?? 0,
          },
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load quotations' });
      }
    },

    async loadQuotation(uuid: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const { data } = await quotationsControllerFindOne({ path: { uuid } });
        patchState(store, { selectedQuotation: data as any, isLoading: false });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load quotation' });
      }
    },

    async createQuotation(body: any): Promise<any> {
      const { data, error } = await quotationsControllerCreate({ body });
      if (error) throw error;
      return data;
    },

    async updateQuotation(uuid: string, body: any): Promise<any> {
      const { data, error } = await quotationsControllerUpdate({ path: { uuid }, body });
      if (error) throw error;
      return data;
    },

    async deleteQuotation(uuid: string): Promise<void> {
      await quotationsControllerRemove({ path: { uuid } });
    },

    async sendQuotation(uuid: string): Promise<void> {
      await quotationsControllerSend({ path: { uuid } });
    },

    async acceptQuotation(uuid: string): Promise<void> {
      await quotationsControllerAccept({ path: { uuid } });
    },

    async rejectQuotation(uuid: string): Promise<void> {
      await quotationsControllerReject({ path: { uuid } });
    },

    async reviseQuotation(uuid: string): Promise<void> {
      await quotationsControllerRevise({ path: { uuid } });
    },

    async convertToInvoice(uuid: string): Promise<any> {
      const { data } = await quotationsControllerConvertToInvoice({ path: { uuid } });
      return data;
    },

    setFilters(filters: Partial<QuotationFilters>): void {
      patchState(store, {
        filters: { ...store.filters(), ...filters },
        pagination: { ...store.pagination(), page: 1 },
      });
    },

    setPage(page: number): void {
      patchState(store, { pagination: { ...store.pagination(), page } });
    },
  })),
);
