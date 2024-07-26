import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorsService } from '../../Services/operators.service';
@Component({
  selector: 'app-operators',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operators.component.html',
  styleUrl: './operators.component.css'
})
export class OperatorsComponent implements OnInit {
  operators: any[] = [];
  filteredOperators: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;

  newOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    observaciones: ''
  };

  selectedOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    observaciones: ''
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
      operator.operador.toLowerCase().includes(this.filterText.toLowerCase())
    );
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
      observaciones: ''
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
    this.router.navigate([`/services`, operator._id]);
  }
}