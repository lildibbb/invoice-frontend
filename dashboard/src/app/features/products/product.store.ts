import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  productsControllerFindAll,
  productsControllerFindOne,
  productsControllerCreate,
  productsControllerUpdate,
  productsControllerDelete,
  productsControllerGetClassificationCodes,
} from '../../core/api';

export interface ProductState {
  products: any[];
  selectedProduct: any | null;
  classificationCodes: any[];
  filters: { search: string };
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  classificationCodes: [],
  filters: { search: '' },
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,
};

export const ProductStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadProducts(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await productsControllerFindAll({
          query: {
            page: store.pagination().page,
            limit: store.pagination().limit,
            ...(store.filters().search && { search: store.filters().search }),
          },
        });
        const response = data as any;
        patchState(store, {
          products: response?.data ?? response ?? [],
          pagination: {
            ...store.pagination(),
            total: response?.meta?.total ?? response?.total ?? 0,
          },
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load products' });
      }
    },

    async loadProduct(uuid: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const { data } = await productsControllerFindOne({ path: { uuid } });
        patchState(store, { selectedProduct: data as any, isLoading: false });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load product' });
      }
    },

    async createProduct(body: any): Promise<any> {
      const { data, error } = await productsControllerCreate({ body });
      if (error) throw error;
      return data;
    },

    async updateProduct(uuid: string, body: any): Promise<any> {
      const { data, error } = await productsControllerUpdate({ path: { uuid }, body });
      if (error) throw error;
      return data;
    },

    async deleteProduct(uuid: string): Promise<void> {
      await productsControllerDelete({ path: { uuid } });
    },

    async loadClassificationCodes(): Promise<void> {
      const { data } = await productsControllerGetClassificationCodes();
      patchState(store, { classificationCodes: (data as any) ?? [] });
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
