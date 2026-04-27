'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { InvoicePreview } from '@/components/invoice-preview';
import { ProductCombobox } from '@/components/product-combobox';
import { FormCombobox, FormDatePicker, FormTextarea } from '@/components/forms';
import { formatCurrency } from '@/lib/utils';
import {
  createQuotationSchema,
  type CreateQuotationInput,
} from '@/lib/validators/quotation';
import { useQuotation, useUpdateQuotation } from '@/lib/queries/quotations';
import { useCustomers } from '@/lib/queries/customers';
import { useProducts } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCompany } from '@/lib/queries/companies';

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;

  const { data: quotationData, isLoading: isLoadingQuotation } = useQuotation(uuid);
  const updateMutation = useUpdateQuotation();

  // Company data from auth store + full company details
  const authContext = useAuthStore((state) => state.context);
  const companyUuid = authContext?.company?.uuid ?? '';
  const { data: companyData } = useCompany(companyUuid);

  // Customers & products
  const { data: customersData } = useCustomers({ limit: 200 });
  const { data: productsData } = useProducts({ limit: 200 });

  const customersList = useMemo(() => {
    if (!customersData) return [];
    return Array.isArray(customersData) ? customersData : customersData?.data ?? [];
  }, [customersData]);

  const productsList = useMemo(() => {
    if (!productsData) return [];
    return Array.isArray(productsData) ? productsData : productsData?.data ?? [];
  }, [productsData]);

  const customerItems = useMemo(
    () =>
      customersList.map((c: any) => ({
        value: c.uuid,
        label: c.name + (c.company ? ` — ${c.company}` : ''),
      })),
    [customersList]
  );

  const productItems = useMemo(
    () =>
      productsList.map((p: any) => ({
        value: p.uuid ?? p.id?.toString() ?? '',
        label: `${p.sku ? `[${p.sku}] ` : ''}${p.name ?? p.description ?? ''} — RM ${Number(p.unitPrice ?? p.price ?? 0).toFixed(2)}`,
      })),
    [productsList]
  );

  const form = useForm<CreateQuotationInput>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      customerUuid: '',
      validUntil: '',
      notes: '',
      termsAndConditions: '',
      items: [
        { description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Populate form when quotation data loads
  useEffect(() => {
    if (!quotationData) return;
    const q = quotationData as any;
    reset({
      customerUuid: q.customer?.uuid ?? q.customerUuid ?? '',
      validUntil: q.validUntil
        ? new Date(q.validUntil).toISOString().split('T')[0]
        : '',
      notes: q.notes ?? '',
      termsAndConditions: q.termsAndConditions ?? q.terms ?? '',
      items:
        (q.items ?? q.lineItems ?? []).map((item: any) => ({
          description: item.description ?? '',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          taxRate: Number(item.taxRate) || 0,
          discount: Number(item.discount) || 0,
        })) || [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    });
  }, [quotationData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch all form values for live preview
  const watchedValues = useWatch({ control });

  // Selected customer for preview
  const selectedCustomer = useMemo(() => {
    if (!watchedValues.customerUuid) return undefined;
    return customersList.find((c: any) => c.uuid === watchedValues.customerUuid);
  }, [watchedValues.customerUuid, customersList]);

  // Company info for preview
  const company = useMemo(
    () => ({
      name: companyData?.name ?? authContext?.company?.name ?? 'Your Company',
      addressLine1: companyData?.addressLine1,
      addressLine2: companyData?.addressLine2,
      city: companyData?.city,
      state: companyData?.state,
      postalCode: companyData?.postalCode,
      country: companyData?.country,
      tin: companyData?.tin,
      brn: companyData?.brn,
      sstRegistrationNumber: companyData?.sstRegistrationNumber,
      phone: companyData?.phone,
      email: companyData?.email,
      bankName: companyData?.bankName,
      bankAccountNumber: companyData?.bankAccountNumber,
    }),
    [companyData, authContext]
  );

  // Line item totals for the form
  const lineItems = watchedValues.items ?? [];
  const { subtotal, taxTotal, grandTotal } = useMemo(() => {
    let sub = 0;
    let tax = 0;
    for (const item of lineItems) {
      const lineAmount = (item.quantity ?? 0) * (item.unitPrice ?? 0);
      const lineDiscount = item.discount ?? 0;
      const lineTax = (lineAmount - lineDiscount) * ((item.taxRate ?? 0) / 100);
      sub += lineAmount - lineDiscount;
      tax += lineTax;
    }
    return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
  }, [lineItems]);

  // Product selection handler — fill in line item fields
  const handleProductSelect = useCallback(
    (idx: number, productUuid: string) => {
      const product = productsList.find(
        (p: any) => (p.uuid ?? p.id?.toString()) === productUuid
      );
      if (product) {
        setValue(`items.${idx}.description`, product.name ?? product.description ?? '');
        if (product.price != null) setValue(`items.${idx}.unitPrice`, Number(product.price));
        if (product.taxRate != null) setValue(`items.${idx}.taxRate`, Number(product.taxRate));
      }
    },
    [productsList, setValue]
  );

  // Track product selections per line item
  const [lineProductSelections, setLineProductSelections] = useState<Record<number, string>>({});

  const onSubmit = useCallback(
    async (values: CreateQuotationInput) => {
      try {
        await updateMutation.mutateAsync({ uuid, body: values });
        toast.success('Quotation updated');
        router.push(`/quotations/${uuid}`);
      } catch {
        toast.error('Failed to update quotation');
      }
    },
    [updateMutation, uuid, router]
  );

  // Preview line items from watched values
  const previewLineItems = useMemo(
    () =>
      (watchedValues.items ?? []).map((item: any) => ({
        description: item.description ?? '',
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        taxRate: Number(item.taxRate) || 0,
        discount: Number(item.discount) || 0,
      })),
    [watchedValues.items]
  );

  // Check if quotation is editable (DRAFT only)
  const quotationStatus = ((quotationData as any)?.status ?? '').toUpperCase();
  const isEditable = !quotationData || quotationStatus === 'DRAFT';

  if (isLoadingQuotation) {
    return (
      <div>
        <PageHeader title="Edit Quotation" />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (quotationData && !isEditable) {
    return (
      <div>
        <PageHeader
          title="Edit Quotation"
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/quotations/${uuid}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              This quotation cannot be edited because its status is{' '}
              <strong>{quotationStatus}</strong>. Only draft quotations can be edited.
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/quotations/${uuid}`}>View Quotation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Quotation"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/quotations/${uuid}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleSubmit((values) => {
                onSubmit(values);
              })}
              disabled={isSubmitting || updateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || updateMutation.isPending}
            >
              {isSubmitting ? 'Saving...' : 'Save Quotation'}
            </Button>
          </div>
        }
      />

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Form */}
            <div className="w-[55%] overflow-y-auto pr-4 space-y-5 pb-8">
              {/* Customer Selection */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[15px]">Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormCombobox
                    name="customerUuid"
                    label="Select Customer"
                    items={customerItems}
                    placeholder="Search customers..."
                    searchPlaceholder="Type to search..."
                    emptyMessage="No customers found."
                  />
                  {selectedCustomer && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{selectedCustomer.name}</p>
                      {selectedCustomer.email && (
                        <p className="text-xs">{selectedCustomer.email}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quotation Details */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[15px]">Quotation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormDatePicker
                      name="validUntil"
                      label="Valid Until"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[15px]">Line Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, idx) => {
                    const item = lineItems[idx];
                    const lineAmount =
                      (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
                    const lineDiscount = Number(item?.discount) || 0;
                    const lineTax =
                      (lineAmount - lineDiscount) *
                      ((Number(item?.taxRate) || 0) / 100);
                    const lineTotal = lineAmount - lineDiscount + lineTax;

                    return (
                      <div
                        key={field.id}
                        className="rounded-lg bg-muted/30 p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Item {idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatCurrency(lineTotal)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500"
                              onClick={() => remove(idx)}
                              disabled={fields.length <= 1}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Product selector */}
                        {productItems.length > 0 && (
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Product
                            </label>
                            <ProductCombobox
                              items={productItems}
                              value={lineProductSelections[idx] ?? ''}
                              onSelect={(val) => {
                                setLineProductSelections((prev) => ({
                                  ...prev,
                                  [idx]: val,
                                }));
                                if (val) handleProductSelect(idx, val);
                              }}
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Description
                          </label>
                          <Input
                            {...register(`items.${idx}.description`)}
                            placeholder="Item description"
                          />
                          {errors.items?.[idx]?.description && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.items[idx].description?.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Qty
                            </label>
                            <Input
                              type="number"
                              min={1}
                              {...register(`items.${idx}.quantity`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Unit Price
                            </label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              {...register(`items.${idx}.unitPrice`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Tax %
                            </label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...register(`items.${idx}.taxRate`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Discount
                            </label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              {...register(`items.${idx}.discount`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {errors.items?.root && (
                    <p className="text-sm text-red-500">
                      {errors.items.root.message}
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        description: '',
                        quantity: 1,
                        unitPrice: 0,
                        taxRate: 0,
                        discount: 0,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Line Item
                  </Button>

                  <Separator />

                  {/* Totals */}
                  <div className="ml-auto max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(taxTotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes & Terms */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[15px]">Notes & Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormTextarea
                      name="notes"
                      label="Notes"
                      placeholder="Additional notes..."
                      rows={3}
                    />
                    <FormTextarea
                      name="termsAndConditions"
                      label="Terms & Conditions"
                      placeholder="e.g. Valid for 30 days"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Preview */}
            <div className="w-[45%] sticky top-0 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Live Preview</h3>
              </div>
              <InvoicePreview
                type="quotation"
                company={company}
                customer={
                  selectedCustomer
                    ? {
                        name: selectedCustomer.name,
                        addressLine1: selectedCustomer.addressLine1,
                        addressLine2: selectedCustomer.addressLine2,
                        city: selectedCustomer.city,
                        state: selectedCustomer.state,
                        postalCode: selectedCustomer.postalCode,
                        country: selectedCustomer.country,
                        tin: selectedCustomer.tin,
                        email: selectedCustomer.email,
                        phone: selectedCustomer.phone,
                      }
                    : undefined
                }
                dueDate={watchedValues.validUntil}
                lineItems={previewLineItems}
                notes={watchedValues.notes}
                terms={watchedValues.termsAndConditions}
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
