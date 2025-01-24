import { Component, OnInit } from '@angular/core';
import { OperatorsService } from '../../Services/operators.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-operators-services',
  standalone: true,
  imports: [CommonModule, FormsModule,HasRoleDirective],
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
    pricesRange:[],
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

  assignPricesRangeToNewService() {
    this.newService.prices = this.selectedOperator.pricesRange.map((range: any) => {
      return {
        range_min: range.range_min,
        range_max: range.range_max,
        type_vehicle: range.type,
        price: 0  // Aquí puedes inicializar el precio en 0 o un valor por defecto
      };
    });
  }



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
      service.descripcion.toLowerCase().includes(this.filterText.toLowerCase()))
    ;
  }

  async onSubmit() {
    try {
      const response = await this.operatorsService.addServiceToOperator(this.operatorId, this.newService);
      console.log('Service added', response);
      toast.success('Service created successfully')
      this.fetchServices(this.operatorId);
      this.showAddModal = false;
    } catch (error) {
      console.error('Error adding service', error);
      toast.error('Error creating service')
    }
  }

  async onEditSubmit() {

    try {
      await this.operatorsService.updateService(this.operatorId, this.selectService._id ,this.selectService);
        console.log('Service update');
        toast.success('Service updated successfully');
        this.fetchServices(this.operatorId); // Actualizar la lista de servicios
        this.showEditModal= false;
        console.log(this.selectService);
    } catch (error) {
      console.error('Error updating service ', error);
      toast.error('Error updating service:');


    }
  }
  confirmDelete(id: string) {
    toast('Are you sure you want to delete this record?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
        await this.deleteService(id);
        }
      },
      cancel: {
        label:'Cancel',
        onClick: () => {
          toast.info('Delete cancelled');
        },
      },
      position: 'top-center',
    });
  }
  async deleteService(serviceId: string) {
    try {
      await this.operatorsService.deleteService(this.operatorId, serviceId);
      this.fetchServices(this.operatorId);
      toast.success('Service deleted successfully')
  } catch (error) {
      console.error('Error deleting service', error);
      toast.error('Error deleting service:');
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
    //this.assignPricesRangeToSelService()
    console.log(this.selectService)
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchServices(this.operatorId); // Actualizar la lista de servicios

  }

  openModal() {
    this.showAddModal = true;
    this.emptyService();
    this.assignPricesRangeToNewService();
    console.log('aqui el new service',this.assignPricesRangeToNewService())
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

}
