import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../Services/hotel.service';
import { ServicesComponent } from '../services/services.component';
import { EntrancesService } from '../../Services/entrances.service'
import { ExpeditionsService } from '../../Services/expeditions.service';
import { GuidesService } from '../../Services/guides.service';
import { RestaurantService } from '../../Services/restaurant.service';
import { OperatorsService } from '../../Services/operators.service';

@Component({
  selector: 'app-master-quoter',
  standalone: true,
  imports: [CommonModule,FormsModule,ServicesComponent],
  templateUrl: './master-quoter.component.html',
  styleUrl: './master-quoter.component.css'
})
export class MasterQuoterComponent implements OnInit{
  
  hotelService = inject(HotelService)
  entranceService = inject(EntrancesService)
  expeditionsService = inject(ExpeditionsService)
  guidesService = inject(GuidesService)
  restaurantService = inject(RestaurantService)
  operatorsService = inject(OperatorsService)
  hotel_service: string = ''
  hotel_selectId: string =''
  hotelsOption: any[]= []

  servicesOptions: any[]=[]
  subservicesOptions: any[]=[]

  hotelServices: any[] = [];

  selectCategoria: string =''
  selectedService: string = ''
  selectedSubService: string = ''
  tags: any[] = []; // Etiquetas seleccionadas
  ngOnInit(): void {
    this.loadHotels();
    //this.loadServices()
  }

  async loadHotels() {
    try {
      this.hotelsOption = await this.hotelService.getAllHotels();
    //  this.servicesOptions = await this.entranceService.getAllEntrances();
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
    
  }

  
  toggleTag(event: Event): void {
    const tagSelect = event.target as HTMLSelectElement;
    const selectedId = Number(tagSelect.value); // Obtener el id seleccionado

    const selectedTag = this.hotelServices.find(option => option._id === this.hotel_service);

    if (selectedTag) {
      const index = this.tags.findIndex(tag => tag.id === selectedTag.id);
      if (index === -1) {
        this.tags.push(selectedTag); // Añadir etiqueta
      } else {
        this.tags.splice(index, 1); // Eliminar etiqueta
      }

      console.log('Etiquetas seleccionadas:', this.tags); // Mostrar en consola
    }
  }

  removeTag(tag: any): void {
    const index = this.tags.findIndex(t => t.hotels_service_id === tag.hotels_service_id);
    if (index !== -1) {
      this.tags.splice(index, 1); // Eliminar el tag
      console.log('Tags seleccionados:', this.tags); // Mostrar en consola las etiquetas restantes
    }
  }

  onHotelChange(event: any): void {
    const hotel_select = this.hotelsOption.find(hotel => hotel._id === this.hotel_selectId)
    if(hotel_select){
      this.hotelServices= hotel_select.services
     // this.newHotel.name_hotel= hotel_select.name
    }
    
}

onServiceChangeHotel(event: any): void {
  const serviceSelect = event.target as HTMLSelectElement;
  const selectedServiceId = serviceSelect.value; // Obtener el id del servicio seleccionado
  const name = this.hotelServices.find(service => service._id === selectedServiceId);

  // Crear un tag basado en el esquema proporcionado
  const selectedTag: any = {
    service_id: this.hotel_selectId,         // ID del hotel seleccionado
    service_type: 'hotel',                   // Tipo de servicio, en este caso 'hotel'
    hotels_service_id: selectedServiceId,
    name_service: name.name_service       // ID del servicio seleccionado
  };

  // Verificar si el tag ya está en el arreglo de tags
  const index = this.tags.findIndex(tag => tag.hotels_service_id === selectedTag.hotels_service_id);

  if (index === -1) {
    this.tags.push(selectedTag); // Añadir nuevo tag si no existe
  } else {
    this.tags.splice(index, 1); // Eliminar tag si ya existe
  }

  console.log('Tags seleccionados:', this.tags); // Mostrar en consola las etiquetas seleccionadas
  console.log('categoria: ',this.selectCategoria)
  console.log('options: ',this.servicesOptions)
  }

 async onCategoriaChange(event: any){
    
   
    console.log('categoria: ',this.selectCategoria)
    
      switch(this.selectCategoria){
        case 'Entrances': this.servicesOptions = await this.entranceService.getAllEntrances();  break;
        case 'Expeditions': this.servicesOptions = await this.expeditionsService.getAllExpeditions(); break;
        case 'Guides':  this.servicesOptions = await this.guidesService.getAllGuides(); break;
  
        case 'Restaurants': this.servicesOptions = await this.restaurantService.getAllRestaurants(); break;
  
        case 'Operators': this.servicesOptions = await this.operatorsService.getAllOperators(); 
         break;
  
        case 'Transporte': 
  
        case 'Experiencias':
      }
    
      console.log('options: ',this.servicesOptions);
  }
  async onServiceChange(event: any){
    console.log('id service: ',this.selectedService);
    if(this.selectedService!){this.subservicesOptions = await this.operatorsService.getServicesByOperator(this.selectedService);}
  }
prueba(event: any){
  
  console.log('id sub service: ',this.selectedSubService)
  console.log('subservicios de operadores y train',this.subservicesOptions)
}
}
