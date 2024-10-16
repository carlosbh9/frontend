import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../Services/hotel.service';

@Component({
  selector: 'app-master-quoter',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './master-quoter.component.html',
  styleUrl: './master-quoter.component.css'
})
export class MasterQuoterComponent implements OnInit{
  
  hotelService = inject(HotelService)
  hotel_service: string = ''
  hotel_selectId: string =''
  hotelsOption: any[]= []
  hotelServices: any[] = [];
  tags: any[] = []; // Etiquetas seleccionadas
  options: any[] = [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'Python' },
    { id: 3, name: 'Java' },
    { id: 4, name: 'C#' },
    { id: 5, name: 'Ruby' }
  ]; // Opciones disponibles
  ngOnInit(): void {
    this.loadHotels();
  }

  async loadHotels() {
    try {
      this.hotelsOption = await this.hotelService.getAllHotels();
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

onServiceChange(event: any): void {
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
  }
}
