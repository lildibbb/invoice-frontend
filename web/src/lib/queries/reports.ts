'use client';

import { useQuery } from '@tanstack/react-query';
import {
  analyticsControllerGetDashboard,
  analyticsControllerGetMonthlyRevenue,
  analyticsControllerGetLhdnReport,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export function useAnalytics() {
  return useQuery({
    queryKey: ['reports', 'analytics'],
    queryFn: async () => {
      const response = await analyticsControllerGetDashboard();
      return unwrapResponse(response);
    },
  });
}

export function useRevenueReport() {
  return useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: async () => {
      const response = await analyticsControllerGetMonthlyRevenue();
      return unwrapResponse(response);
    },
  });
}

export function useLhdnReport(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['reports', 'lhdn', params],
    queryFn: async () => {
      const response = await analyticsControllerGetLhdnReport({
        query: params,
      });
      return unwrapResponse(response);
    },
  });
}
