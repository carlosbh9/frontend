import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../Services/hotel.service';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';
@Component({
  selector: 'app-hotel-services',
  standalone: true,
  imports: [CommonModule, FormsModule,HasRoleDirective],
  templateUrl: './hotel-services.component.html',
  styleUrl: './hotel-services.component.css'
})
export class HotelServicesComponent implements OnInit {

services: any[] = [];
filteredServices: any[] = [];
hotelId: string = '';
filterText: string = '';
showAddModal: boolean = false;
showEditModal: boolean = false;

selectedHotel: any = {
  name: '',
  location: '',
  services: [],
  special_dates: [],
  informacion_general: []
};

newService: any = {
  name_service: '',
  roomPrices: [{
 
      type:'SWB',
      confidential:0,
      rack:0
    },{
      type:'DWB',
      confidential:0,
      rack:0
    },{
      type:'TRP',
      confidential:0,
      rack:0
    }]
}

selectedService: any = {
  name_service: '',
  roomPrices: []
}

constructor(private hotelService: HotelService, private route: ActivatedRoute) {}

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if(id){
      this.hotelId=id;
      this.fetchServices(id);
      this.getHotelId(id);
    }
  });
}

async fetchServices(id: string){
  try{
    this.services = await this.hotelService.getServicesByHotelId(id);
   this.filteredServices = this.services;
   console.log('services:',this.filteredServices);
  }catch(error){
    console.error('Error fetching services:', error);
  }
}


filterServices(){
  this.filteredServices = this.services.filter(service => service.name_service.toLowerCase().includes(this.filterText.toLowerCase()));
}
async onSubmit(){
  try{
    const response = await this.hotelService.addServiceToHotel(this.hotelId, this.newService);
    this.fetchServices(this.hotelId);
    console.log('Service created successfully:', response);
    this.showAddModal = false;
  }catch(error){
    console.error('Error creating service:', error);
  }
}

async onEditSubmit(){
  try {
    await this.hotelService.updateService(this.hotelId, this.selectedService._id, this.selectedService);
    this.fetchServices(this.hotelId);
    console.log('Service updated successfully:', this.selectedService);
    this.showEditModal = false;
  } catch (error) {
    console.error('Error updating service:', error);
  }
}

async deleteService(serviceId: string){
  try {
    await this.hotelService.deleteService(this.hotelId, serviceId);
    this.fetchServices(this.hotelId);
    console.log('Service deleted successfully:', serviceId);
  } catch (error) {
    console.error('Error deleting service:', error);
  }
}

async getHotelId(hotelId: string){
  try {
    this.selectedHotel = await this.hotelService.getHotelById(hotelId);
  } catch (error) {
    console.error('Error get hotel by id:', error);
  }
}

openEditModal(service: any){
  this.selectedService = {...service};
  this.showEditModal = true;
  console.log('servicio a editar',this.selectedService)
}

closeEditModal(){
  this.showEditModal = false;
  this.fetchServices(this.hotelId);
}
openAddModal(){
  this.showAddModal = true;
}

closeAddModal(){
  this.showAddModal = false;
  this.emptyService();
}

emptyService(){
  this.newService = {
    name_service: '',
    roomPrices: [{
 
      type:'SWB',
      confidential:0,
      rack:0
    },{
      type:'DWB',
      confidential:0,
      rack:0
    },{
      type:'TRP',
      confidential:0,
      rack:0
    }]
  }
}


}
