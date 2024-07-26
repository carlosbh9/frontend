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
      }
    });
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

    this.operatorsService.addService(this.operatorId, this.newService).then(
      response => {
        console.log('Service added', response);
        this.fetchServices(this.operatorId); // Actualizar la lista de servicios
      },
      error => {
        console.error('Error adding service', error);
      }
    );
  }
  addService2() {
    // Implementar lógica para agregar un nuevo servicio
  }

  editService(service: any) {
    // Implementar lógica para editar un servicio existente
  }

  deleteService(serviceId: string) {
    // Implementar lógica para eliminar un servicio existente
  }


  async getOperatorbyI(operatorId: string) {
    try {
      this.selectedOperator = await this.operatorsService.getOperatorbyId(operatorId);
    } catch (error) {
      console.error('Error get operator by iddd ');
    }
  }

  openEditModal(restaurant: any) {
    this.selectService = { ...restaurant };
    this.showEditModal = true;
    console.log(this.selectService)
  }

  closeEditModal() {
    this.showEditModal = false;
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

   // Función para agregar un nuevo campo de precio en el formulario de agregar experiencia
 addPriceField() {
  this.newService.prices.push({ range_min: 0, range_max: 0, type_vehicle:null });
}

// Función para agregar un nuevo campo de precio en el formulario de editar experiencia
addEditPriceField() {
  this.selectService.prices.push({ groupSize: null, pricePerPerson: null });
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

  if (this.selectService.prices.length > 1) { // Prevent removing the only price field
    this.selectService.prices.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }

}
}