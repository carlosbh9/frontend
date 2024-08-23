import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../Services/hotel.service';
import { FormHotelComponent } from '../form-hotel/form-hotel.component';

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule, FormsModule,FormHotelComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent {
 // selectedCategory = '';

  selectedCategory: string = '';
  selectedHotel: string = '';
  selectedService: string = '';
  price: number = 0;
  hotels: any[] = [];
  hotelServices: any[] = [];

  datosrecibidos: any[]=[];

  constructor(private hotelService: HotelService) {}
  
  
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

  addItemToQuote(datos: any): void {
    // Aquí agregarías la lógica para agregar el ítem a la tabla de cotización
    console.log(`Hotel: ${this.selectedHotel}, Service: ${this.selectedService}, Price: ${this.price}`);
    this.datosrecibidos= datos
    console.log(this.datosrecibidos)
  }
  

}
