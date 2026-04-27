import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  invoicesControllerFindAll,
  invoicesControllerFindOne,
  invoicesControllerCreate,
  invoicesControllerUpdate,
  invoicesControllerRemove,
  invoicesControllerFinalize,
  invoicesControllerSend,
  invoicesControllerVoid,
  invoicesControllerCloneInvoice,
  invoicesControllerBulkFinalize,
  invoicesControllerBulkSend,
  invoicesControllerExportInvoices,
  invoicesControllerGetAllowedTransitions,
  invoicesControllerGetAuditTrail,
  invoicesControllerSubmitEinvoice,
} from '../../core/api';

export type InvoiceStatus = 'DRAFT' | 'FINALIZED' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'INVALID' | 'SENT' | 'OVERDUE' | 'COMPLETED' | 'VOIDED' | 'CANCELLED';

export interface InvoiceFilters {
  invoiceNo: string;
  status: InvoiceStatus | null;
  fromDate: string | null;
  toDate: string | null;
}

export interface InvoiceState {
  invoices: any[];
  selectedInvoice: any | null;
  allowedTransitions: string[];
  auditTrail: any[];
  filters: InvoiceFilters;
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  selectedInvoice: null,
  allowedTransitions: [],
  auditTrail: [],
  filters: { invoiceNo: '', status: null, fromDate: null, toDate: null },
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,
};

export const InvoiceStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadInvoices(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const { filters, pagination } = store;
        const f = filters();
        const { data } = await invoicesControllerFindAll({
          query: {
            page: pagination().page,
            limit: pagination().limit,
            ...(f.invoiceNo ? { invoiceNo: f.invoiceNo } : {}),
            ...(f.status ? { status: f.status } : {}),
            ...(f.fromDate ? { fromDate: f.fromDate } : {}),
            ...(f.toDate ? { toDate: f.toDate } : {}),
          } as any,
        });
        const response = data as any;
        patchState(store, {
          invoices: response?.data ?? response ?? [],
          pagination: {
            ...store.pagination(),
            total: response?.meta?.total ?? response?.total ?? 0,
          },
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load invoices' });
      }
    },

    async loadInvoice(uuid: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const [invoiceRes, transitionsRes, auditRes] = await Promise.all([
          invoicesControllerFindOne({ path: { uuid } }),
          invoicesControllerGetAllowedTransitions({ path: { uuid } }),
          invoicesControllerGetAuditTrail({ path: { uuid } }),
        ]);
        patchState(store, {
          selectedInvoice: invoiceRes.data as any,
          allowedTransitions: (transitionsRes.data as any) ?? [],
          auditTrail: (auditRes.data as any) ?? [],
          isLoading: false,
        });
      } catch {
        patchState(store, { isLoading: false, error: 'Failed to load invoice' });
      }
    },

    async createInvoice(body: any): Promise<any> {
      const { data, error } = await invoicesControllerCreate({ body });
      if (error) throw error;
      return data;
    },

    async updateInvoice(uuid: string, body: any): Promise<any> {
      const { data, error } = await invoicesControllerUpdate({ path: { uuid }, body });
      if (error) throw error;
      return data;
    },

    async deleteInvoice(uuid: string): Promise<void> {
      await invoicesControllerRemove({ path: { uuid } });
    },

    async finalizeInvoice(uuid: string): Promise<void> {
      await invoicesControllerFinalize({ path: { uuid } });
    },

    async sendInvoice(uuid: string): Promise<void> {
      await invoicesControllerSend({ path: { uuid } });
    },

    async voidInvoice(uuid: string, reason: string): Promise<void> {
      await invoicesControllerVoid({ path: { uuid }, body: { reason } });
    },

    async cloneInvoice(uuid: string): Promise<any> {
      const { data } = await invoicesControllerCloneInvoice({ path: { uuid } });
      return data;
    },

    async bulkFinalize(uuids: string[]): Promise<any> {
      const { data } = await invoicesControllerBulkFinalize({ body: { uuids: uuids as any } });
      return data;
    },

    async bulkSend(uuids: string[]): Promise<any> {
      const { data } = await invoicesControllerBulkSend({ body: { uuids } });
      return data;
    },

    async submitEinvoice(uuid: string): Promise<void> {
      await invoicesControllerSubmitEinvoice({ path: { uuid } });
    },

    async exportInvoices(format: 'csv' | 'xlsx' = 'csv'): Promise<any> {
      const f = store.filters();
      const { data } = await invoicesControllerExportInvoices({
        query: {
          format,
          ...(f.status ? { status: f.status } : {}),
          ...(f.fromDate ? { fromDate: f.fromDate } : {}),
          ...(f.toDate ? { toDate: f.toDate } : {}),
        } as any,
      });
      return data;
    },

    setFilters(filters: Partial<InvoiceFilters>): void {
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
