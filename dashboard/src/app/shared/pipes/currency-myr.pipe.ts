import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyMyr',
  standalone: true,
})
export class CurrencyMyrPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') {
      return 'RM 0.00';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return 'RM 0.00';
    }

    return `RM ${this.formatter.format(num)}`;
  }
}
