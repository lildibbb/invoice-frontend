export enum LhdnIdType {
  NRIC = 'NRIC',
  PASSPORT = 'PASSPORT',
  BRN = 'BRN',
  ARMY = 'ARMY',
}

export interface CodeEntry {
  Code: string;
  Description: string;
}

export interface PaymentCodeEntry {
  Code: string;
  'Payment Method': string;
}

export interface StateCodeEntry {
  Code: string;
  State: string;
}

export interface CountryCodeEntry {
  Code: string;
  Country: string;
}

export interface MsicCodeEntry {
  Code: string;
  Description: string;
  'MSIC Category Reference': string;
}

export interface UnitMeasureCodeEntry {
  Code: string;
  Name: string;
}
