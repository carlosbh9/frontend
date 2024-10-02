export interface HotelService {
  name_hotel: string;
  type_hotel: string;
  price: number[];
  accomodatios_category: string;
  notes: string;
}

export interface Hotel {
  day: string;
  date: string;
  city: string;
  hotelservices: HotelService[];
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormHotelComponent } from '../pages-quoter/form-hotel/form-hotel.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule,FormHotelComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
 

  totalPriceHotels: number = 0;
  totalPriceServices: number = 0;

  selectedDate: string = '';
  selectedCity: string = '';
  previousDateHotel: string = '';
  selectedDateService: string = '';
  selectedCityService: string = '';
  contHotel = 1;
  contService = 1;

  newQuoter: any = {
    guest: '',
    FileCode: '',
    travelDate: {
      start: '',
      end: ''
    },
    acomodations: '',
    totalNights: '',
    number_paxs: [0],
    travel_agent: '',
    exchange_rate: '',
    services: [],
    hotels: [] // Este ahora contendrá un array con la nueva estructura
  };

  datosrecibidosHotel: any = {};
  datosrecibidosService: any = {};

  ngOnInit(): void {
    this.datosrecibidosHotel = null;
    this.datosrecibidosService = null;
  }

  addNumberPaxs() {
    if (this.newQuoter.hotels.length != 0) {
      this.updatePricesSizeHotels(this.newQuoter.hotels, this.newQuoter.number_paxs.length + 1);
    }
    this.newQuoter.number_paxs.push(0);
    console.log('Valores de number_paxs', this.newQuoter.number_paxs);
  }

  updatePricesSizeHotels(hotels: any[], newSize: number): any[] {
    return hotels.map(hotel => {
      const currentSize = hotel.hotelservices[0]?.price.length || 0; // Cambiado para reflejar la nueva estructura

      if (currentSize < newSize) {
        hotel.hotelservices[0].price = [...hotel.hotelservices[0].price, ...new Array(newSize - currentSize).fill(0)];
      }
      return hotel;
    });
  }

  onPriceChangeHotel(index: number, newPrice: number) {
    this.newQuoter.hotels[index].hotelservices[0].price = newPrice; // Ajustado para la nueva estructura
    this.updateTotalPriceHotels();
  }

  addItemToQuote(datos: any) {
    const hotelService = {
      name_hotel: datos.name_hotel,
      type_hotel: datos.type_hotel,
      price: datos.price_prueba,
      accomodatios_category: datos.accomodatios_category,
      notes: datos.notes
    };

    // Verifica si el hotel ya existe en el array
    const existingHotelIndex = this.newQuoter.hotels.findIndex((hotel: Hotel) => hotel.date === this.selectedDate && hotel.city === datos.city);
    
    if (existingHotelIndex !== -1) {
      // Si existe, solo se agregan los servicios al hotel existente
      this.newQuoter.hotels[existingHotelIndex].hotelservices.push(hotelService);
    } else {
      // Si no existe, crea un nuevo objeto de hotel con servicios
      this.datosrecibidosHotel = {
        day: this.contHotel,
        city: datos.city,
        date: this.selectedDate,
        hotelservices: [hotelService] // Cambiado para incluir el servicio
      };
      
      this.newQuoter.hotels.push(this.datosrecibidosHotel);
    }

    this.contHotel++;
  }

  updateTotalPriceHotels() {
    this.totalPriceHotels = this.newQuoter.hotels.reduce((acc: number, hotel: any) => {
      const hotelTotal = hotel.hotelservices.reduce((total: number, service: any) => {
        return total + service.price.reduce((sum: number, price: number) => sum + price, 0); // Suma de todos los precios de los servicios
      }, 0);
      return acc + hotelTotal;
    }, 0);
  }

  onSubmitHotel(){

    if(this.datosrecibidosHotel!){
          this.newQuoter.hotels.push(this.datosrecibidosHotel)
          
    }
    this.updateTotalPriceHotels();
    this.datosrecibidosHotel = null
  }
}
