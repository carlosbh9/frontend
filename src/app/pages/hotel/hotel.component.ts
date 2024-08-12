import { Component, OnInit } from '@angular/core';
import { HotelService } from '../../Services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './hotel.component.html',
  styleUrl: './hotel.component.css'
})
export class HotelComponent implements OnInit {

  constructor(private hotelService: HotelService,private router:Router) {}
  hotels: any[] = [];
  filteredHotels: any[] = [];
  filterText: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;

  newHotel: any = {
    name: '',
    location: '',
    services: [{
      name_service: '',
      tipo_habitaciones: [{
        tipo_servicio: '',
        tipo_habitacion: '',
        price: 0
      }]
    }],
    special_dates: [{
      date: '',
      price: 0
    }],
    informacion_general: []
  };
  
  selectedHotel: any = {
    name: '',
    location: '',
    services: [{
      name_service: '',
      tipo_habitaciones: [{
        tipo_servicio: '',
        tipo_habitacion: '',
        price: 0
      }]
    }],
    special_dates: [],
    informacion_general: []
  };
  

  ngOnInit(): void {
    this.fetchHotels();
  
  }

  async fetchHotels() {
    try {
      this.hotels = await this.hotelService.getAllHotels();
      this.filteredHotels = this.hotels;
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  }

  filterHotels() {
    this.filteredHotels = this.hotels.filter(hotel => hotel.name.toLowerCase().includes(this.filterText.toLowerCase()));
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.fetchHotels();
  }
  openEditModal(hotel: any) {
    this.selectedHotel = {...hotel};
    this.selectedHotel.informacion_general = hotel.informacion_general instanceof Map
      ? Array.from(hotel.informacion_general as Map<string, any>).map(([key, value]) => ({ key, value }))
      : Object.entries(hotel.informacion_general || {}).map(([key, value]) => ({ key, value }));

    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchHotels();
  }
  emptyHotel() {
    this.newHotel = {
    name: '',
    location: '',
    services: [{
      name_service: '',
      tipo_habitaciones: [{
        tipo_servicio: '',
        tipo_habitacion: '',
        price: 0
      }]
    }],
    special_dates: [{
      date: '',
      price: 0
    }],
    informacion_general: []
    };
  }
  async onSubmit() {
    try {
      let infoGeneral: { [key: string]: string } = {};
      
      if (Array.isArray(this.newHotel.informacion_general)) {
        // Si es un array, lo convertimos a objeto
        this.newHotel.informacion_general.forEach((item: { key: string; value: string }) => {
          if (item.key && item.value) {
            infoGeneral[item.key] = item.value;
          }
        });
      } else if (typeof this.newHotel.informacion_general === 'object') {
        // Si ya es un objeto, lo usamos directamente
        infoGeneral = { ...this.newHotel.informacion_general };
      }
  
      // Crear una copia del newHotel con la informacion_general actualizada
      const hotelToSubmit = {
        ...this.newHotel,
        informacion_general: infoGeneral
      };
  
      await this.hotelService.addHotel(hotelToSubmit);
      this.closeAddModal();
      console.log('Hotel añadido exitosamente');
      console.log(hotelToSubmit);
      this.emptyHotel();
      this.fetchHotels(); // Actualizar la lista de hoteles
    } catch (error) {
      console.error('Error al añadir hotel:', error);
      
    }
  }

  
  onEditSubmit() {
  // Convertir informacion_general de vuelta a un Map antes de enviar
  const hotelToUpdate = {...this.selectedHotel};
  hotelToUpdate.informacion_general = new Map(
    this.selectedHotel.informacion_general.map(
      (item: { key: string; value: any }) => [item.key, item.value] as [string, any]
    )
  );
    this.hotelService.updateHotel(hotelToUpdate._id, hotelToUpdate).then(
      response => {
        console.log('Hotel updated successfully',response);
        this.fetchHotels();
        this.closeEditModal();
      }
    ).catch(error => {
      console.error('Error updating hotel:', error);
    });
  }

  async deleteHotel(id: string) {
    try {
      await this.hotelService.deleteHotel(id);
      this.fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  }

  addSpecialdateField() {
    this.newHotel.special_dates.push({ date: null, price: null });
  }
  // Función para agregar un nuevo campo de Special date en el formulario de editar restaurant
  addEditSpecialDateField() {
    this.selectedHotel.special_dates.push({ date: null, price: null });

  }
  removeSpecialdateField(index: number) {
    if (this.newHotel.special_dates.length >= 1) { // Prevent removing the only special date
      this.newHotel.special_dates.splice(index, 1);
    } else {
      console.warn('Cannot remove the only price field.');
    }

  }

  removeEditSpecialdateField(index: number) {
    if (this.selectedHotel.special_dates.length >= 1) { // Prevent removing the only special date
      this.selectedHotel.special_dates.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }
  
  }

  
  addInfoField() {
    this.newHotel.informacion_general.push({ key: '', value: '' });
  }

  removeInfoField(index: number) {
    if (this.newHotel.informacion_general.length >= 1) { 
      this.newHotel.informacion_general.splice(index, 1);
    } else {
      console.warn('Cannot remove the only price field.');
    }
  }

  addEditInfoField() {
    this.selectedHotel.informacion_general.push({ key: '', value: '' });
  }

  removeEditInfoField(index: number) {
    if (this.selectedHotel.informacion_general.length >= 1) { // Prevent removing the only special date
      this.selectedHotel.informacion_general.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }
  }


  viewServices(hotel: any) {
    this.router.navigate([`services-hotel`, hotel._id])
  }
}
