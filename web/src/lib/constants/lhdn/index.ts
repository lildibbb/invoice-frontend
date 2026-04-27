import classificationCodesData from './classification-codes.json';
import taxTypesData from './tax-types.json';
import paymentCodesData from './payment-codes.json';
import msicCodesData from './msic-codes.json';
import stateCodesData from './state-codes.json';
import countryCodesData from './country-codes.json';
import unitMeasureCodesData from './unit-measure-codes.json';
import einvoiceTypesData from './einvoice-types.json';
import type {
  CodeEntry,
  PaymentCodeEntry,
  StateCodeEntry,
  CountryCodeEntry,
  MsicCodeEntry,
  UnitMeasureCodeEntry,
} from '@/lib/types/lhdn';

// Typed arrays
export const classificationCodes = classificationCodesData as CodeEntry[];
export const taxTypes = taxTypesData as CodeEntry[];
export const paymentCodes = paymentCodesData as PaymentCodeEntry[];
export const msicCodes = msicCodesData as MsicCodeEntry[];
export const stateCodes = stateCodesData as StateCodeEntry[];
export const countryCodes = countryCodesData as CountryCodeEntry[];
export const unitMeasureCodes = unitMeasureCodesData as UnitMeasureCodeEntry[];
export const einvoiceTypes = einvoiceTypesData as CodeEntry[];

// Lookup Maps for O(1) validation
export const classificationCodeMap = new Map(classificationCodes.map(c => [c.Code, c.Description]));
export const taxTypeMap = new Map(taxTypes.map(c => [c.Code, c.Description]));
export const paymentCodeMap = new Map(paymentCodes.map(c => [c.Code, c['Payment Method']]));
export const msicCodeMap = new Map(msicCodes.map(c => [c.Code, c.Description]));
export const stateCodeMap = new Map(stateCodes.map(c => [c.Code, c.State]));
export const countryCodeMap = new Map(countryCodes.map(c => [c.Code, c.Country]));
export const unitMeasureCodeMap = new Map(unitMeasureCodes.map(c => [c.Code, c.Name]));
export const einvoiceTypeMap = new Map(einvoiceTypes.map(c => [c.Code, c.Description]));

// Validation helper
export function isValidCode(code: string, map: Map<string, string>): boolean {
  return map.has(code);
}

// Search helper - searches across specified fields
export function searchCodes<T>(
  query: string,
  codes: T[],
  fields: (keyof T)[]
): T[] {
  if (!query.trim()) return codes;
  const q = query.toLowerCase().trim();
  return codes.filter(entry =>
    fields.some(field => {
      const value = entry[field];
      return typeof value === 'string' && value.toLowerCase().includes(q);
    })
  );
}

// Convenience search functions for common use cases
export function searchClassificationCodes(query: string) {
  return searchCodes(query, classificationCodes, ['Code', 'Description']);
}
export function searchMsicCodes(query: string) {
  return searchCodes(query, msicCodes, ['Code', 'Description']);
}
export function searchCountryCodes(query: string) {
  return searchCodes(query, countryCodes, ['Code', 'Country']);
}
export function searchStateCodes(query: string) {
  return searchCodes(query, stateCodes, ['Code', 'State']);
}
export function searchUnitMeasureCodes(query: string) {
  return searchCodes(query, unitMeasureCodes, ['Code', 'Name']);
}
export function searchPaymentCodes(query: string) {
  return searchCodes(query, paymentCodes, ['Code', 'Payment Method']);
}
