import { Component } from '@angular/core';
import { HotelService } from '../../Services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-hotel.component.html',
  styleUrl: './form-hotel.component.css'
})
export class FormHotelComponent {
  selectedCategory: string = '';
  selectedHotel: string = '';
  selectedService: string = '';
  price: number = 0;
  hotels: any[] = [];
  hotelServices: any[] = [];
  constructor(private hotelService: HotelService) {}
  
  async loadHotels2() {
    try {
      this.hotels = await this.hotelService.getAllHotels();
     // this.hotels = data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  }
  
  ngOnInit(): void {
    this.loadHotels();
  }

  onCategoryChange(event: any): void {
    if (this.selectedCategory === 'Hoteles') {
      this.loadHotels();
    }
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().then((data: any[]) => {
      this.hotels = data;
    });
  }

  onHotelChange(event: any): void {
 
    const selectedHotel = this.hotels.find(hotel => hotel._id === this.selectedHotel);
    if (selectedHotel) {
      this.hotelServices = selectedHotel.services;
    }
  }

  addItemToQuote(): void {
    // Aquí agregarías la lógica para agregar el ítem a la tabla de cotización
    console.log(`Hotel: ${this.selectedHotel}, Service: ${this.selectedService}, Price: ${this.price}`);
  }
}
