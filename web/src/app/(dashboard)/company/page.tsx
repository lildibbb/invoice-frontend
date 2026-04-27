'use client';

import { RoleGuard } from '@/components/role-guard';
import { MembershipRole, GlobalRole } from '@/lib/types/roles';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCompanyStats, useUpdateCompany } from '@/lib/queries/settings';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  FileText,
  Package,
  MapPin,
  Mail,
  Phone,
  Globe,
  Hash,
} from 'lucide-react';

export default function CompanyPage() {
  const context = useAuthStore((s) => s.context);
  const { data: stats, isLoading } = useCompanyStats();

  const company = context?.company;
  const companyData = stats as any;

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN]}>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Company"
          description="Your workspace details and overview"
        />

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-slate-400" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-64" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Building2} label="Name" value={company?.name ?? companyData?.name ?? '-'} />
                <InfoRow icon={Hash} label="Code" value={company?.code ?? companyData?.code ?? '-'} />
                <InfoRow icon={Hash} label="Registration No." value={companyData?.registrationNumber ?? companyData?.regNo ?? '-'} />
                <InfoRow icon={Hash} label="Tax ID (TIN)" value={companyData?.taxIdentificationNumber ?? companyData?.tin ?? '-'} />
                <InfoRow icon={Mail} label="Email" value={companyData?.email ?? '-'} />
                <InfoRow icon={Phone} label="Phone" value={companyData?.phone ?? companyData?.phoneNumber ?? '-'} />
                <InfoRow icon={MapPin} label="Address" value={companyData?.address ?? '-'} />
                <InfoRow icon={Globe} label="Website" value={companyData?.website ?? '-'} />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge variant={company?.isActive ? 'default' : 'destructive'}>
                    {company?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <InfoRow icon={Hash} label="Role" value={context?.role ?? '-'} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatBox
            icon={Users}
            label="Team Members"
            value={companyData?.memberCount ?? companyData?.totalMembers ?? '-'}
            isLoading={isLoading}
          />
          <StatBox
            icon={FileText}
            label="Total Invoices"
            value={companyData?.invoiceCount ?? companyData?.totalInvoices ?? '-'}
            isLoading={isLoading}
          />
          <StatBox
            icon={Package}
            label="Products"
            value={companyData?.productCount ?? companyData?.totalProducts ?? '-'}
            isLoading={isLoading}
          />
        </div>
      </div>
    </RoleGuard>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-[#0F172A]">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, isLoading }: { icon: any; label: string; value: any; isLoading: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-lg bg-[#3B82F6]/10 p-2.5">
          <Icon className="h-5 w-5 text-[#3B82F6]" />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-12 mt-0.5" />
          ) : (
            <p className="text-xl font-bold text-[#0F172A]">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
