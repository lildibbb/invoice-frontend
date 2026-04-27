'use client';

import { useMemo } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoicePreviewProps {
  company: {
    name: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    tin?: string;
    brn?: string;
    sstRegistrationNumber?: string;
    phone?: string;
    email?: string;
    bankName?: string;
    bankAccountNumber?: string;
  };
  customer?: {
    name: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    tin?: string;
    email?: string;
    phone?: string;
  };
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
    classificationCode?: string;
  }[];
  notes?: string;
  terms?: string;
  type?: 'invoice' | 'quotation';
}

function dash(val: string | undefined | null) {
  return val || '—';
}

function buildAddress(obj?: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) {
  if (!obj) return null;
  const parts: string[] = [];
  if (obj.addressLine1) parts.push(obj.addressLine1);
  if (obj.addressLine2) parts.push(obj.addressLine2);
  const cityLine = [obj.city, obj.state, obj.postalCode]
    .filter(Boolean)
    .join(', ');
  if (cityLine) parts.push(cityLine);
  if (obj.country) parts.push(obj.country);
  return parts.length > 0 ? parts : null;
}

export function InvoicePreview({
  company,
  customer,
  invoiceNumber,
  invoiceDate,
  dueDate,
  currency = 'MYR',
  lineItems,
  notes,
  terms,
  type = 'invoice',
}: InvoicePreviewProps) {
  const { subtotal, taxTotal, grandTotal, computed } = useMemo(() => {
    let sub = 0;
    let tax = 0;
    const computed = lineItems.map((item) => {
      const lineAmount = (item.quantity ?? 0) * (item.unitPrice ?? 0);
      const lineDiscount = item.discount ?? 0;
      const lineTotal = lineAmount - lineDiscount;
      const lineTax = lineTotal * ((item.taxRate ?? 0) / 100);
      sub += lineTotal;
      tax += lineTax;
      return { lineTotal, lineTax };
    });
    return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax, computed };
  }, [lineItems]);

  const companyAddress = buildAddress(company);
  const customerAddress = buildAddress(customer);
  const typeLabel = type === 'quotation' ? 'QUOTATION' : 'INVOICE';

  return (
    <div className="bg-white rounded-lg shadow-lg aspect-[1/1.414] w-full overflow-hidden flex flex-col">
      <div className="flex-1 p-6 text-slate-700 flex flex-col" style={{ fontSize: '11px' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-bold text-slate-900" style={{ fontSize: '14px' }}>
              {company.name}
            </p>
            {companyAddress?.map((line, i) => (
              <p key={i} className="text-slate-500">{line}</p>
            ))}
            <div className="mt-1 space-y-0.5 text-slate-500">
              {company.tin && <p>TIN: {company.tin}</p>}
              {company.brn && <p>BRN: {company.brn}</p>}
              {company.sstRegistrationNumber && (
                <p>SST: {company.sstRegistrationNumber}</p>
              )}
              {company.phone && <p>Tel: {company.phone}</p>}
              {company.email && <p>{company.email}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-blue-500" style={{ fontSize: '16px' }}>
              {dash(invoiceNumber)}
            </p>
            <p className="font-semibold text-slate-400 tracking-wider" style={{ fontSize: '12px' }}>
              {typeLabel}
            </p>
          </div>
        </div>

        <div className="border-t border-muted" />

        {/* Bill To + Details */}
        <div className="flex justify-between py-3">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Bill To
            </p>
            <p className="font-semibold text-slate-900">
              {customer?.name || '—'}
            </p>
            {customerAddress?.map((line, i) => (
              <p key={i} className="text-slate-500">{line}</p>
            ))}
            {customer?.tin && (
              <p className="text-slate-500">TIN: {customer.tin}</p>
            )}
            {customer?.email && (
              <p className="text-slate-500">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-slate-500">Tel: {customer.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Details
            </p>
            <div className="space-y-0.5">
              <p>
                <span className="text-slate-400">Date: </span>
                <span className="text-slate-700">{invoiceDate ? formatDate(invoiceDate) : '—'}</span>
              </p>
              <p>
                <span className="text-slate-400">Due: </span>
                <span className="text-slate-700">{dueDate ? formatDate(dueDate) : '—'}</span>
              </p>
              <p>
                <span className="text-slate-400">Currency: </span>
                <span className="text-slate-700">{currency}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-muted" />

        {/* Line Items Table */}
        <div className="flex-1 py-2 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-muted">
                <th className="text-left py-1.5 w-6">#</th>
                <th className="text-left py-1.5">Description</th>
                <th className="text-right py-1.5 w-10">Qty</th>
                <th className="text-right py-1.5 w-16">Price</th>
                <th className="text-right py-1.5 w-16">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                    No items added
                  </td>
                </tr>
              ) : (
                lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-muted">
                    <td className="py-1.5 text-slate-400">{idx + 1}</td>
                    <td className="py-1.5">
                      <p className="text-slate-700">{item.description || '—'}</p>
                      {item.classificationCode && (
                        <p className="text-[9px] text-slate-400">
                          Class: {item.classificationCode}
                        </p>
                      )}
                      {(item.discount ?? 0) > 0 && (
                        <p className="text-[9px] text-slate-400">
                          Disc: -{formatCurrency(item.discount, currency)}
                        </p>
                      )}
                      {(item.taxRate ?? 0) > 0 && (
                        <p className="text-[9px] text-slate-400">
                          Tax: {item.taxRate}%
                        </p>
                      )}
                    </td>
                    <td className="py-1.5 text-right text-slate-600">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-600">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="py-1.5 text-right font-medium text-slate-700">
                      {formatCurrency(computed[idx]?.lineTotal ?? 0, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-muted pt-2">
          <div className="flex justify-end">
            <div className="w-48 space-y-1" style={{ fontSize: '12px' }}>
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {taxTotal > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span>{formatCurrency(taxTotal, currency)}</span>
                </div>
              )}
              <div className="border-t border-muted pt-1 flex justify-between font-bold text-slate-900">
                <span className="text-blue-500">TOTAL</span>
                <span>{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {(company.bankName || company.bankAccountNumber) && (
          <>
            <div className="border-t border-muted mt-3 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Payment Information
              </p>
              {company.bankName && (
                <p className="text-slate-600">Bank: {company.bankName}</p>
              )}
              {company.bankAccountNumber && (
                <p className="text-slate-600">Account: {company.bankAccountNumber}</p>
              )}
            </div>
          </>
        )}

        {/* Notes & Terms */}
        {(notes || terms) && (
          <div className="border-t border-muted mt-3 pt-2 space-y-1">
            {notes && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Notes
                </p>
                <p className="text-slate-600 whitespace-pre-line">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Terms & Conditions
                </p>
                <p className="text-slate-600 whitespace-pre-line">{terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
