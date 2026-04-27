import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  approvalsControllerGetPending,
  approvalsControllerGetByInvoice,
  approvalsControllerRequestApproval,
  approvalsControllerReviewApproval,
} from '../../core/api';

export interface ApprovalState {
  pendingApprovals: any[];
  invoiceApprovals: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ApprovalState = {
  pendingApprovals: [],
  invoiceApprovals: [],
  isLoading: false,
  error: null,
};

export const ApprovalStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadPending(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await approvalsControllerGetPending();
        const payload = (data as any)?.data ?? data;
        patchState(store, {
          pendingApprovals: Array.isArray(payload) ? payload : [],
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load pending approvals' });
      }
    },

    async loadByInvoice(invoiceUuid: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { data } = await approvalsControllerGetByInvoice({
          path: { invoiceUuid },
        } as any);
        const payload = (data as any)?.data ?? data;
        patchState(store, {
          invoiceApprovals: Array.isArray(payload) ? payload : [],
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load approvals' });
      }
    },

    async requestApproval(body: {
      invoiceUuid: string;
      approverMembershipId: string;
      notes?: string;
    }): Promise<any> {
      const { data, error } = await approvalsControllerRequestApproval({ body } as any);
      if (error) throw error;
      return (data as any)?.data ?? data;
    },

    async reviewApproval(
      id: string,
      status: 'APPROVED' | 'REJECTED',
      notes?: string,
    ): Promise<any> {
      const { data, error } = await approvalsControllerReviewApproval({
        path: { id },
        body: { status, ...(notes ? { notes } : {}) },
      } as any);
      if (error) throw error;
      return (data as any)?.data ?? data;
    },
  })),
);
