import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorsService } from '../../Services/operators.service';
import { toast } from 'ngx-sonner';
import { HasPermissionsDirective } from '../../Services/AuthService/has-permissions.directive';

@Component({
  selector: 'app-operators',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionsDirective],
  templateUrl: './operators.component.html',
  styleUrl: './operators.component.css'
})
export class OperatorsComponent implements OnInit {
  operators: any[] = [];
  filteredOperators: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;
  filterYear: string = '2025';

  newOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    pricesRange: [],
    observaciones: '',
    year: ''
  };

  selectedOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    pricesRange: [],
    observaciones: '',
    year: ''
  };

  constructor(private operatorsService: OperatorsService) {}

  ngOnInit(): void {
    this.fetchOperators();
  }

  private createOperatorServicePrice(range: any) {
    return {
      range_min: range.range_min,
      range_max: range.range_max,
      type_vehicle: range.type,
      price: 0
    };
  }

  private createOperatorService(pricesRange: any[]) {
    return {
      descripcion: '',
      prices: pricesRange.map((range: any) => this.createOperatorServicePrice(range)),
      observaciones: ''
    };
  }

  private syncOperatorServicePrices(services: any[], pricesRange: any[]) {
    return services.map((service: any) => {
      const existingPrices = Array.isArray(service.prices) ? service.prices : [];

      return {
        ...service,
        prices: pricesRange.map((range: any) => {
          const match = existingPrices.find((price: any) =>
            price.range_min === range.range_min &&
            price.range_max === range.range_max &&
            price.type_vehicle === range.type
          );

          return {
            range_min: range.range_min,
            range_max: range.range_max,
            type_vehicle: range.type,
            price: match?.price ?? 0
          };
        })
      };
    });
  }

  async fetchOperators() {
    try {
      this.operators = await this.operatorsService.getAllOperators();
      this.filteredOperators = this.operators;
    } catch (error) {
      console.error('Error fetching operators', error);
    }
  }

  filterOperators() {
    this.filteredOperators = this.operators.filter(operator =>
      operator.operador.toLowerCase().includes(this.filterText.toLowerCase()) &&
      (this.filterYear ? operator.year === this.filterYear : true)
    );
  }

  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.filterYear = String(selectElement.value);
    this.filterOperators();
  }

  confirmDelete(id: string) {
    toast('Are you sure you want to delete this record?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          await this.deleteOperator(id);
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          toast.info('Delete cancelled');
        },
      },
      position: 'top-center',
    });
  }

  async deleteOperator(id: string) {
    try {
      await this.operatorsService.deleteOperator(id);
      toast.success('Deleted successfully');
      this.fetchOperators();
    } catch (error) {
      console.error('Error deleting operator', error);
      toast.error('Error deleting operator');
    }
  }

  openEditModal(operator: any) {
    this.selectedOperator = { ...operator };
    this.selectedOperator.pricesRange = Array.isArray(operator.pricesRange)
      ? structuredClone(operator.pricesRange)
      : [];
    this.selectedOperator.servicios = Array.isArray(operator.servicios)
      ? structuredClone(operator.servicios)
      : [this.createOperatorService(this.selectedOperator.pricesRange)];
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchOperators();
  }

  openModal() {
    this.showAddModal = true;
    if (!this.newOperator.servicios.length) {
      this.newOperator.servicios = [this.createOperatorService(this.newOperator.pricesRange)];
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.emptyOperator();
  }

  emptyOperator(): void {
    this.newOperator = {
      operador: '',
      ciudad: '',
      name_service: '',
      servicios: [this.createOperatorService([])],
      pricesRange: [],
      observaciones: '',
      year: ''
    };
  }

  onSubmit() {
    this.operatorsService.addOperator(this.newOperator).then(
      response => {
        console.log('Operator added', response);
        toast.success('Operator created successfully');
        this.fetchOperators();
        this.showAddModal = false;
        this.emptyOperator();
      },
      error => {
        console.error('Error adding operator', error);
        toast.error('Error creating operator');
      }
    );
  }

  onEditSubmit() {
    this.operatorsService.updateOperator(this.selectedOperator._id, this.selectedOperator).then(
      response => {
        console.log('Operator updated', response);
        toast.success('Operator updated successfully');
        this.fetchOperators();
        this.showEditModal = false;
      },
      error => {
        console.error('Error updating operator', error);
        toast.error('Error updating operator');
      }
    );
  }

  addPriceField() {
    this.newOperator.pricesRange.push({ range_min: 0, range_max: 0, type: '' });
    this.newOperator.servicios = this.syncOperatorServicePrices(this.newOperator.servicios, this.newOperator.pricesRange);
  }

  removePriceField(index: number) {
    if (this.newOperator.pricesRange.length >= 1) {
      this.newOperator.pricesRange.splice(index, 1);
      this.newOperator.servicios = this.syncOperatorServicePrices(this.newOperator.servicios, this.newOperator.pricesRange);
      return;
    }

    toast.warning('Cannot remove the only price field.');
  }

  addEditPriceField() {
    this.selectedOperator.pricesRange.push({ range_min: 0, range_max: 0, type: '' });
    this.selectedOperator.servicios = this.syncOperatorServicePrices(this.selectedOperator.servicios, this.selectedOperator.pricesRange);
  }

  removeeditPriceField(index: number) {
    if (this.selectedOperator.pricesRange.length >= 1) {
      this.selectedOperator.pricesRange.splice(index, 1);
      this.selectedOperator.servicios = this.syncOperatorServicePrices(this.selectedOperator.servicios, this.selectedOperator.pricesRange);
      return;
    }

    toast.warning('Cannot remove the only price field.');
  }

  addOperatorService() {
    this.newOperator.servicios.push(this.createOperatorService(this.newOperator.pricesRange));
  }

  removeOperatorService(index: number) {
    if (this.newOperator.servicios.length > 1) {
      this.newOperator.servicios.splice(index, 1);
      return;
    }

    toast.warning('Cannot remove the only service.');
  }

  addEditOperatorService() {
    this.selectedOperator.servicios.push(this.createOperatorService(this.selectedOperator.pricesRange));
  }

  removeEditOperatorService(index: number) {
    if (this.selectedOperator.servicios.length > 1) {
      this.selectedOperator.servicios.splice(index, 1);
      return;
    }

    toast.warning('Cannot remove the only service.');
  }
}
