'use client';

import { useQuery } from '@tanstack/react-query';
import {
  analyticsControllerGetDashboard,
  analyticsControllerGetMonthlyRevenue,
  analyticsControllerGetAgingReport,
  invoicesControllerFindAll,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await analyticsControllerGetDashboard();
      return unwrapResponse(data);
    },
  });
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: async () => {
      const { data } = await analyticsControllerGetMonthlyRevenue();
      return unwrapResponse(data);
    },
  });
}

export function useAgingReport() {
  return useQuery({
    queryKey: ['dashboard', 'aging'],
    queryFn: async () => {
      const { data } = await analyticsControllerGetAgingReport();
      return unwrapResponse(data);
    },
  });
}

export function useRecentInvoices() {
  return useQuery({
    queryKey: ['dashboard', 'recentInvoices'],
    queryFn: async () => {
      const { data } = await invoicesControllerFindAll({
        query: { limit: 5 } as any,
      });
      return unwrapResponse(data);
    },
  });
}
