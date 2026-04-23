import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { CruiseItem } from '../../../../interfaces/quoter-models.interface';

type CruiseDraft = Omit<CruiseItem, 'price'> & {
  price: number | string;
};

@Component({
  selector: 'app-cruceros',
  standalone: true,
  imports: [FormsModule, CommonModule, SweetAlert2Module],
  templateUrl: './cruceros-v2.component.html',
  styleUrl: './cruceros-v2.component.css'
})
export class CrucerosV2Component {
  @Input() cruises: CruiseItem[] = [];
  @Output() cruisesChange = new EventEmitter<CruiseItem[]>();
  @Output() totalPricesChange = new EventEmitter<number>();

  cruisesOptions: string[] = ['AMAZON', 'OTHER'];
  operators: string[] = ['AQUA NERA', 'ARIA', 'DELFIN I', 'DELFIN II & III', 'RIVER & FOREST'];
  originalItem: Record<number, CruiseItem> = {};
  newCruise: CruiseDraft = this.emptyCruise();

  emptyCruise(): CruiseDraft {
    return {
      name: '',
      operator: '',
      price_base: 0,
      price: 0,
      notes: '',
      editCruise: false,
    };
  }

  onSubmitCruise() {
    const finalPrice = Number(this.newCruise.price) || 0;
    this.cruises.push({
      ...this.newCruise,
      price_base: finalPrice,
      price: finalPrice,
    });
    this.emitCruise();
    this.newCruise = this.emptyCruise();
  }

  onEdit(item: CruiseItem, index: number) {
    this.originalItem[index] = { ...item };
    item.editCruise = true;
    this.emitCruise();
  }

  onClose(item: CruiseItem, index: number) {
    this.cruises[index] = { ...this.originalItem[index] };
    item.editCruise = false;
    this.emitCruise();
  }

  onSave(item: CruiseItem) {
    item.editCruise = false;
    this.originalItem = {};
    this.emitCruise();
  }

  onDelete(index: number) {
    Swal.fire('Success', 'Record deleted', 'success');
    this.cruises.splice(index, 1);
    this.emitCruise();
  }

  private emitCruise() {
    this.cruisesChange.emit(this.cruises);
    this.totalPricesChange.emit(this.getTotalPrices());
  }

  getTotalPrices(): number {
    return this.cruises.reduce((total, cruise) => total + (Number(cruise.price) || 0), 0);
  }
}
