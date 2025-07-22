import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'smartNumber'
})
export class SmartNumberPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value == null) return '0';
    if (value % 1 === 0) {
      // Cijeli broj, prikaži bez decimale
      return value.toString();
    } else {
      // Ima decimalu, zaokruži na 1 decimalu
      return value.toFixed(1);
    }
  }
}
