import { Component, OnInit } from '@angular/core';
import { OperatorsService } from '../../Services/operators.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operators-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operators-services.component.html',
  styleUrl: './operators-services.component.css'
})
export class OperatorsServicesComponent implements OnInit{

  services: any[] = [];
  filteredServices: any[] = [];
  operatorId: string = '';
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;

  selectedOperator: any = {
    operador: '',
    ciudad: '',
    name_service: '',
    servicios: [],
    observaciones: ''
  };
  newService: any = {
    descripcion: '',
    prices: [],
    observaciones: ''
  };

  selectService: any = {
    descripcion: '',
    prices: [],
    observaciones: ''
  };


  constructor (private operatorsService: OperatorsService,private route: ActivatedRoute){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.operatorId = id;
        this.fetchServices(id);
        this.getOperatorbyI(id);
        console.log(this.operatorId)
      }else {
        console.log('No id')
      }
    });

    console.log(this.operatorId)
  }

  async fetchServices(id: string) {
    try {
      this.services = await this.operatorsService.getServicesByOperator(id);
      this.filteredServices = this.services;
    } catch (error) {
      console.error('Error fetching services', error);
    }
  }

  filterServices() {
    this.filteredServices = this.services.filter(service =>
      service.description.toLowerCase().includes(this.filterText.toLowerCase()))
    ;
  }

  async onSubmit() {
    try {
      const response = await this.operatorsService.addServiceToOperator(this.operatorId, this.newService);
      console.log('Service added', response);
      this.fetchServices(this.operatorId);
      this.showAddModal = false;
    } catch (error) {
      console.error('Error adding service', error);
    }
  }

  async onEditSubmit() {

    try {
      await this.operatorsService.updateService(this.operatorId, this.selectService._id ,this.selectService);
        console.log('Service update');
        this.fetchServices(this.operatorId); // Actualizar la lista de servicios
        this.showEditModal= false;
        console.log(this.selectService);
    } catch (error) {
      console.error('Error updating service ', error);

    }
  }

  async deleteService(serviceId: string) {
    try {
      await this.operatorsService.deleteService(this.operatorId, serviceId);
      this.fetchServices(this.operatorId);
  } catch (error) {
      console.error('Error deleting service', error);
    }

  }


  async getOperatorbyI(operatorId: string) {
    try {
      this.selectedOperator = await this.operatorsService.getOperatorbyId(operatorId);
    } catch (error) {
      console.error('Error get operator by iddd ');
    }
  }

  openEditModal(operator: any) {
    this.selectService = { ...operator };
    this.showEditModal = true;
    console.log(this.selectService)
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchServices(this.operatorId); // Actualizar la lista de servicios

  }

  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.emptyService();
  }

  emptyService(): void {
    this.newService = {
      descripcion: '',
      prices: [],
      observaciones: ''
    };
  }

   // Función para agregar un nuevo campo de precio en el formulario de agregar servicio
 addPriceField() {
  this.newService.prices.push({ range_min: 0, range_max: 0, type_vehicle: '' });
}

// Función para agregar un nuevo campo de precio en el formulario de editar servicio
addEditPriceField() {
  this.selectService.prices.push({ range_min: 0, range_max: 0, type_vehicle: '' });
}
removePriceField(index: number) {

  if (this.newService.prices.length >= 1) { // Prevent removing the only price field
    this.newService.prices.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }

}

removeeditPriceField(index: number) {

  if (this.selectService.prices.length >= 1) { // Prevent removing the only price field
    this.selectService.prices.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }

}
}
