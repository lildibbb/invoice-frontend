import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  customersControllerFindAll,
  customersControllerFindOne,
  customersControllerCreate,
  customersControllerUpdate,
  customersControllerDelete,
  customersControllerRestore,
  customersControllerBulkUpload,
} from '../../core/api';

export interface CustomerState {
  customers: any[];
  selectedCustomer: any | null;
  filters: { search: string };
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  filters: { search: '' },
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,
};

export const CustomerStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadCustomers(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await customersControllerFindAll({
          query: {
            page: store.pagination().page,
            limit: store.pagination().limit,
            ...(store.filters().search && { search: store.filters().search }),
          },
        });
        const response = data as any;
        patchState(store, {
          customers: response?.data ?? response ?? [],
          pagination: {
            ...store.pagination(),
            total: response?.meta?.total ?? response?.total ?? 0,
          },
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load customers' });
      }
    },

    async loadCustomer(uuid: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const { data } = await customersControllerFindOne({ path: { uuid } });
        patchState(store, { selectedCustomer: data as any, isLoading: false });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load customer' });
      }
    },

    async createCustomer(body: any): Promise<any> {
      const { data, error } = await customersControllerCreate({ body });
      if (error) throw error;
      return data;
    },

    async updateCustomer(uuid: string, body: any): Promise<any> {
      const { data, error } = await customersControllerUpdate({ path: { uuid }, body });
      if (error) throw error;
      return data;
    },

    async deleteCustomer(uuid: string): Promise<void> {
      await customersControllerDelete({ path: { uuid } });
    },

    async restoreCustomer(uuid: string): Promise<void> {
      await customersControllerRestore({ path: { uuid } });
    },

    async bulkUpload(file: File): Promise<any> {
      const { data } = await customersControllerBulkUpload({ body: { file } });
      return data;
    },

    setSearch(search: string): void {
      patchState(store, {
        filters: { search },
        pagination: { ...store.pagination(), page: 1 },
      });
    },

    setPage(page: number): void {
      patchState(store, { pagination: { ...store.pagination(), page } });
    },
  })),
);
