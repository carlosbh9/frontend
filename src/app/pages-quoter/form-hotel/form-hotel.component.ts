import { Component } from '@angular/core';
import { HotelService } from '../../Services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';

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
  roomTypes: any[] = [];
  selectedRoomType: string = '';
  selectedRoomTypePrices: any[]=[];

  
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
  onServiceChange(event: any): void {
    const selectedService = this.hotelServices.find(service => service._id === this.selectedService);
    if (selectedService) {
      this.roomTypes = selectedService.roomPrices;
    }
    console.log('este es el ',this.roomTypes)
  }
  onRoomTypeChange(event: any): void {
 this.selectedRoomTypePrices = this.roomTypes
    console.log('jajajaj 1',this.selectedRoomTypePrices)
   
  }

  
}
