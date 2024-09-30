import { CommonModule } from '@angular/common';
import { Component , inject, OnInit,input, output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  TransportService} from '../../Services/transport.service';

@Component({
  selector: 'app-form-transporte',
  standalone: true,
  imports: [],
  templateUrl: './form-transporte.component.html',
  styleUrl: './form-transporte.component.css'
})
export class FormTransporteComponent implements OnInit{
  transportService = inject(TransportService)
  serviceItem = output<any>()
  selectedCity = input<string>();
  selectedDate = input<string>();
  priceLength = input.required<number>();
  addedPricesCount: number = 0
  selectedService: any = {};

  transports: any[]=[]
  transport: any = {
    prices:[]
  }
  notes: string = ''

  async loadTransport (){
    try{
      this.transports = await this.transportService.getalltransport();
    }catch{
      console.error('Error fetching expeditions');
    }
  }

  ngOnInit(): void {
    this.loadTransport();
  }

addPrices(){
  if (this.addedPricesCount < this.priceLength()) {
   // Agregamos el precio actual al final del arreglo
   this.transport.prices[this.addedPricesCount] = this.transport.price_pp;
   this.addedPricesCount++; // Incrementamos el contador
 } else {
   // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
   console.log("No se pueden agregar más precios, el arreglo está lleno.");
 }
 }
}

