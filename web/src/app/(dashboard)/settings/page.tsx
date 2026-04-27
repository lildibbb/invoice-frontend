'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Building2, Phone, Landmark, MapPin } from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { StatCard } from '@/components/stat-card';
import { FormInput, FormCombobox } from '@/components/forms';
import { updateCompanySchema, type UpdateCompanyInput } from '@/lib/validators/company';
import { msicCodes, stateCodes, countryCodes } from '@/lib/constants/lhdn';
import { useCompanyStats, useUpdateCompany } from '@/lib/queries/settings';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatCurrency } from '@/lib/utils';

interface CompanyStatsResponse extends UpdateCompanyInput {
  totalInvoices?: number | null;
  totalRevenue?: number | null;
}

const defaultValues: UpdateCompanyInput = {
  name: '',
  tin: '',
  brn: '',
  msicCode: '',
  businessActivityDesc: '',
  sstRegistrationNumber: '',
  tourismTaxRegistration: '',
  phone: '',
  email: '',
  bankName: '',
  bankAccountNumber: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  state: '',
  country: '',
};

export default function CompanySettingsPage() {
  const context = useAuthStore((s) => s.context);
  const { data: stats, isLoading } = useCompanyStats() as ReturnType<typeof useCompanyStats> & { data: CompanyStatsResponse | undefined };
  const updateCompany = useUpdateCompany();

  const form = useForm<UpdateCompanyInput>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues,
  });

  useEffect(() => {
    if (stats) {
      form.reset({
        name: stats.name ?? '',
        tin: stats.tin ?? '',
        brn: stats.brn ?? '',
        msicCode: stats.msicCode ?? '',
        businessActivityDesc: stats.businessActivityDesc ?? '',
        sstRegistrationNumber: stats.sstRegistrationNumber ?? '',
        tourismTaxRegistration: stats.tourismTaxRegistration ?? '',
        phone: stats.phone ?? '',
        email: stats.email ?? '',
        bankName: stats.bankName ?? '',
        bankAccountNumber: stats.bankAccountNumber ?? '',
        addressLine1: stats.addressLine1 ?? '',
        addressLine2: stats.addressLine2 ?? '',
        postalCode: stats.postalCode ?? '',
        city: stats.city ?? '',
        state: stats.state ?? '',
        country: stats.country ?? '',
      });
    }
  }, [stats, form]);

  const onSubmit = async (values: UpdateCompanyInput) => {
    if (!context?.company?.uuid) return;
    try {
      await updateCompany.mutateAsync({ uuid: context.company.uuid, body: values });
      toast.success('Company settings saved');
    } catch {
      toast.error('Failed to save company settings');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Company Settings" />
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Company Settings" description="Manage your company profile and details" />

      {/* Company Stats */}
      {stats && (stats.totalInvoices != null || stats.totalRevenue != null) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.totalInvoices != null && (
            <StatCard title="Total Invoices" value={String(stats.totalInvoices)} accentColor="bg-blue-500" />
          )}
          {stats.totalRevenue != null && (
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} accentColor="bg-emerald-500" />
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormInput name="name" label="Company Name" maxLength={255} />
              <FormInput name="tin" label="TIN" maxLength={50} description="Tax Identification Number" />
              <FormInput name="brn" label="BRN" maxLength={50} description="Business Registration Number" />
              <FormCombobox
                name="msicCode"
                label="MSIC Code"
                items={msicCodes.map((c) => ({ value: c.Code, label: c.Description, description: c.Code }))}
                searchPlaceholder="Search MSIC code..."
              />
              <FormInput name="businessActivityDesc" label="Business Activity" maxLength={255} />
              <FormInput name="sstRegistrationNumber" label="SST Registration" maxLength={20} />
              <FormInput name="tourismTaxRegistration" label="Tourism Tax Registration" maxLength={20} />
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormInput name="phone" label="Phone" maxLength={20} />
              <FormInput name="email" label="Email" type="email" maxLength={255} />
            </CardContent>
          </Card>

          {/* Banking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Banking
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormInput name="bankName" label="Bank Name" maxLength={100} />
              <FormInput name="bankAccountNumber" label="Account Number" maxLength={150} />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormInput name="addressLine1" label="Address Line 1" maxLength={255} />
              <FormInput name="addressLine2" label="Address Line 2" maxLength={255} />
              <FormInput name="postalCode" label="Postal Code" maxLength={10} />
              <FormInput name="city" label="City" maxLength={100} />
              <FormCombobox
                name="state"
                label="State"
                items={stateCodes.map((s) => ({ value: s.State, label: s.State }))}
                searchPlaceholder="Search state..."
              />
              <FormCombobox
                name="country"
                label="Country"
                items={countryCodes.map((c) => ({ value: c.Code, label: `${c.Code} — ${c.Country}` }))}
                searchPlaceholder="Search country..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
    </RoleGuard>
  );
}
