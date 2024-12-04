import { CommonModule } from '@angular/common';
import { Component, output, OnChanges, SimpleChanges,Signal,WritableSignal ,Input,signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2'; // Asegúrate de que la ruta sea correcta


@Component({
  selector: 'app-ui-table',
  standalone: true,
  imports: [CommonModule,FormsModule,SweetAlert2Module],
  templateUrl: './ui-table.component.html',
  styleUrl: './ui-table.component.css'
})
export class UiTableComponent<T>{
  @Input() data: T[] = [];
  @Input() columns: { header: string; field: keyof T }[] = [];
  
  @Input() actions: { name: string; label: string; class: string }[] = []; // Botones de acción
  action = output<{ name: string; row: any }>(); // Emitir acción

  dropdownOpen = signal(false);
  selectedRow: T | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('Data updated:', this.data);
    }
  }



  emitAction(actionName: string, row: any) {
    this.action.emit({ name: actionName, row });
  }

  extractValue(row: T, column: { field: keyof T | string; extractor?: (row: T) => any }): any {
    // Si hay un extractor, usarlo
    if (column.extractor) {
      return column.extractor(row);
    }
  
    // Si `field` es una propiedad anidada (como 'childRate.pp')
    if (typeof column.field === 'string' && column.field.includes('.')) {
      const fields = column.field.split('.');
      let value: any = row;
  
      for (const key of fields) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          return undefined; // Si la propiedad no existe
        }
      }
      return value;
    }
  
    // Si `field` es una propiedad simple
    return row[column.field as keyof T];
  }

  getSwalOptions(actionName: string): SweetAlertOptions | undefined{
  if (actionName === 'delete') {
    return { title: 'Confirmation', text: 'Are you sure you want to delete this record?', showCancelButton: true };
  } else {
    return undefined;  // Devuelve un objeto vacío para otras acciones, evitando pasar `null`
  }
}
}
