import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  recurringInvoicesControllerFindAll,
  recurringInvoicesControllerCreate,
  recurringInvoicesControllerFindOne,
  recurringInvoicesControllerRemove,
  recurringInvoicesControllerPause,
  recurringInvoicesControllerResume,
  recurringInvoicesControllerCancel,
} from '../../core/api';

export interface RecurringState {
  plans: any[];
  selectedPlan: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecurringState = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  error: null,
};

export const RecurringStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadPlans(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await recurringInvoicesControllerFindAll();
        const response = data as any;
        patchState(store, {
          plans: (response as any)?.data ?? response ?? [],
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load recurring plans' });
      }
    },

    async loadPlan(uuid: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await recurringInvoicesControllerFindOne({ path: { uuid } });
        const response = data as any;
        patchState(store, {
          selectedPlan: (response as any)?.data ?? response,
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load plan' });
      }
    },

    async createPlan(body: any): Promise<any> {
      const { data, error } = await recurringInvoicesControllerCreate({ body });
      if (error) throw error;
      return data;
    },

    async deletePlan(uuid: string): Promise<void> {
      await recurringInvoicesControllerRemove({ path: { uuid } });
    },

    async pausePlan(uuid: string): Promise<void> {
      await recurringInvoicesControllerPause({ path: { uuid } });
    },

    async resumePlan(uuid: string): Promise<void> {
      await recurringInvoicesControllerResume({ path: { uuid } });
    },

    async cancelPlan(uuid: string): Promise<void> {
      await recurringInvoicesControllerCancel({ path: { uuid } });
    },
  })),
);
