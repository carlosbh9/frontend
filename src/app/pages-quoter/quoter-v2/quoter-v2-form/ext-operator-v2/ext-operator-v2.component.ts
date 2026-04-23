import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorItem } from '../../../../interfaces/quoter-models.interface';

type OperatorDraft = Omit<OperatorItem, 'price'> & {
  price: number | string;
};

@Component({
  selector: 'app-ext-operator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ext-operator-v2.component.html',
  styleUrl: './ext-operator-v2.component.css'
})
export class ExtOperatorV2Component implements OnInit {
  porcentajeTd = input.required<number>();
  porcentajeChange = output<number>();
  @Input() operators: OperatorItem[] = [];
  @Output() operatorsChange = new EventEmitter<OperatorItem[]>();
  @Output() totalPricesChange = new EventEmitter<number>();

  countries: string[] = ['ARGENTINA', 'BOLIVIA', 'BRAZIL', 'COLOMBIA', 'CHILE', 'ECUADOR'];
  operatorsList: string[] = ['Sayhueque', 'Uncover Colombia', 'Unic', 'Southbound', 'Pure Brazil', 'Surtrek'];
  originalItem: Record<number, OperatorItem> = {};
  newExternalOpe: OperatorDraft = this.emptyOperator();
  porcentajeTD = signal<number>(0);

  ngOnInit(): void {}

  constructor() {
    effect(() => {
      this.porcentajeTD.set(Number(this.porcentajeTd()) || 0);
      this.totalPricesChange.emit(this.getTotalCostExternal());
    });
  }

  onInputPorcentaje(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const nextValue = Number(inputElement.value) || 0;
    this.porcentajeTD.set(nextValue);
    this.porcentajeChange.emit(nextValue);
    this.totalPricesChange.emit(this.getTotalCostExternal());
  }

  emptyOperator(): OperatorDraft {
    return {
      country: '',
      name_operator: '',
      price: 0,
      notes: '',
      editOperator: false,
    };
  }

  onSubmitOperator() {
    this.operators.push({
      ...this.newExternalOpe,
      price: Number(this.newExternalOpe.price) || 0,
    });
    this.newExternalOpe = this.emptyOperator();
    this.emitOperator();
  }

  onEdit(item: OperatorItem, index: number) {
    this.originalItem[index] = { ...item };
    item.editOperator = true;
    this.emitOperator();
  }

  onClose(item: OperatorItem, index: number) {
    this.operators[index] = { ...this.originalItem[index] };
    item.editOperator = false;
    this.emitOperator();
  }

  onSave(item: OperatorItem) {
    item.editOperator = false;
    this.originalItem = {};
    this.emitOperator();
  }

  onDelete(index: number) {
    this.operators.splice(index, 1);
    this.emitOperator();
  }

  private emitOperator() {
    this.operatorsChange.emit(this.operators);
    this.totalPricesChange.emit(this.getTotalCostExternal());
  }

  getOperatorBaseTotal(): number {
    return this.operators.reduce((total, operator) => total + (Number(operator.price) || 0), 0);
  }

  getExternalUtilityPrice(): number {
    return this.getOperatorBaseTotal() * (this.porcentajeTD() / 100);
  }

  getExternalTaxesPrice(): number {
    const totalBeforeTaxes = this.getOperatorBaseTotal() + this.getExternalUtilityPrice();
    return totalBeforeTaxes < 5000 ? totalBeforeTaxes * 0.05 : totalBeforeTaxes * 0.03;
  }

  getTotalCostExternal(): number {
    return this.getOperatorBaseTotal() + this.getExternalUtilityPrice() + this.getExternalTaxesPrice();
  }
}
