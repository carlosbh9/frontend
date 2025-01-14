import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorsService } from '../../Services/operators.service';

import { RouterModule } from '@angular/router';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';

@Component({
  selector: 'app-operators',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule,HasRoleDirective],
  templateUrl: './operators.component.html',
  styleUrl: './operators.component.css'
})
export class OperatorsComponent implements OnInit {
  operators: any[] = [];
  filteredOperators: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;
  filterYear : string = '2025'

  newOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    pricesRange:[],
    observaciones: '',
    year:''
  };

  selectedOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    observaciones: '',
    year:''
  };


  constructor(private operatorsService: OperatorsService,private router: Router) {}

  ngOnInit(): void {
    this.fetchOperators();
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
      operator.operador.toLowerCase().includes(this.filterText.toLowerCase()) && (this.filterYear ? operator.year === this.filterYear : true)
    );
  }

  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterOperators();
    
  }
  async deleteOperator(id: string) {
    try {
      await this.operatorsService.deleteOperator(id);
      this.fetchOperators();
    } catch (error) {
      console.error('Error deleting operator', error);
    }
  }

  openEditModal(operator: any) {
    this.selectedOperator = { ...operator };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchOperators();
  }

  openModal() {
    this.showAddModal = true;
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
      servicios: [],
      observaciones: '',
      year:''
    };
  }

  onSubmit() {
    this.operatorsService.addOperator(this.newOperator).then(
      response => {
        console.log('Operator added', response);
        this.fetchOperators();
        this.showAddModal = false;
        this.emptyOperator();
      },
      error => {
        console.error('Error adding operator', error);
      }
    );
  }

  onEditSubmit() {
    this.operatorsService.updateOperator(this.selectedOperator._id, this.selectedOperator).then(
      response => {
        console.log('Operator updated', response);
        this.fetchOperators();
        this.showEditModal = false;
      },
      error => {
        console.error('Error updating operator', error);
      }
    );
  }

  viewServices(operator: any) {
    this.router.navigate([`dashboard/services-operators`, operator._id]);
    console.log('el operador enviado',operator)
  }



     // Función para agregar un nuevo campo de precio en el formulario de agregar servicio
 addPriceField() {
  this.newOperator.pricesRange.push({ range_min: 0, range_max: 0, type: '' });
}
removePriceField(index: number) {

  if (this.newOperator.pricesRange.length >= 1) { // Prevent removing the only price field
    this.newOperator.pricesRange.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }
}



// Función para agregar un nuevo campo de precio en el formulario de editar servicio
addEditPriceField() {
  this.selectedOperator.pricesRange.push({ range_min: 0, range_max: 0, type: '' });
}


removeeditPriceField(index: number) {

  if (this.selectedOperator.pricesRange.length >= 1) { // Prevent removing the only price field
    this.selectedOperator.pricesRange.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }

}
}