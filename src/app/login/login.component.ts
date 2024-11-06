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
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrancesService } from '../Services/entrances.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  service = inject(EntrancesService)
  insertPosition: number =0
  flights: any[] = [];

  moveFlightUp(index: number) {
    if (index > 0) {
      // Intercambiar la fila actual con la anterior
      const temp = this.flights[index];
      this.flights[index] = this.flights[index - 1];
      this.flights[index - 1] = temp;
    }
  }
  
  moveFlightDown(index: number) {
    if (index < this.flights.length - 1) {
      // Intercambiar la fila actual con la siguiente
      const temp = this.flights[index];
      this.flights[index] = this.flights[index + 1];
      this.flights[index + 1] = temp;
    }
  }

  onEdit(i:number){

  }
  onDelete(i:number){}
  ngOnInit(): void {
    this.fetchEntrances();
  }

  async fetchEntrances() {
    try {
      this.flights= await this.service.getAllEntrances();
      
     // this.entrances = data;
      console.log(this.flights)
    } catch (error) {
      console.error('Error fetching entrances', error);
    }
  }
}
