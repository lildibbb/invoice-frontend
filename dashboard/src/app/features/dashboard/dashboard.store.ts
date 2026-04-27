import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import {
  analyticsControllerGetDashboard,
  analyticsControllerGetMonthlyRevenue,
  analyticsControllerGetAgingReport,
  analyticsControllerGetLhdnReport,
} from '../../core/api';

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  pendingAmount: number;
  overdueAmount: number;
  revenueGrowth: number;
  invoiceGrowth: number;
}

export interface DashboardState {
  stats: DashboardStats | null;
  monthlyRevenue: any[];
  agingReport: any;
  lhdnReport: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  monthlyRevenue: [],
  agingReport: null,
  lhdnReport: null,
  isLoading: false,
  error: null,
};

export const DashboardStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    async loadDashboard(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const [dashboardRes, revenueRes, agingRes, lhdnRes] = await Promise.all([
          analyticsControllerGetDashboard(),
          analyticsControllerGetMonthlyRevenue(),
          analyticsControllerGetAgingReport(),
          analyticsControllerGetLhdnReport(),
        ]);

        patchState(store, {
          stats: (dashboardRes.data as any)?.data ?? (dashboardRes.data as any) ?? null,
          monthlyRevenue: (revenueRes.data as any)?.data ?? (revenueRes.data as any) ?? [],
          agingReport: (agingRes.data as any)?.data ?? (agingRes.data as any) ?? null,
          lhdnReport: (lhdnRes.data as any)?.data ?? (lhdnRes.data as any) ?? null,
          isLoading: false,
        });
      } catch (err) {
        patchState(store, { isLoading: false, error: 'Failed to load dashboard data' });
      }
    },
  })),
);
