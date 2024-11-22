import { CommonModule } from '@angular/common';
import { Component, input,OnInit,Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.css'
})
export class FlightsComponent implements OnInit {

 // datosFlight = output<any[]>();
  paxs = input.required<number[]>();
  @Input() flights: any[] = [];
 // flights = input<any[]>();
  @Output() flightsChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  //editFlight: boolean = false;
  //flights: any[] = [];
  routes: { route: string, price: number }[] = [
    { route: 'LIM/CUZ', price: 210 },
    { route: 'CUZ/LIM', price: 210 },
    { route: 'LIM/PEM', price: 300 },
    { route: 'CUZ/PEM', price: 300 },
    { route: 'PEM/CUZ', price: 300 },
    { route: 'JUL/LIM', price: 300 },
    { route: 'CUZ/JUL', price: 300 },
    { route: 'CUZ/AQP', price: 210 },
    { route: 'AQP/LIM', price: 210 },
    { route: 'LIM/IQT', price: 210 },
    { route: 'IQT/LIM', price: 210 },
    { route: 'CUZ/UIO', price: 0 },
    { route: 'UIO/CUZ', price: 0 },
    { route: 'LIM/TRU', price: 210 },
    { route: 'TRU/LIM', price: 210 },
    { route: 'LIM/TYL', price: 210 },
    { route: 'TYL/LIM', price: 210 },
  ];
  selectedRoute: { route: string, price: number } = { route: '', price: 0 };

  originalItem: any = {};
  newFlight: any = {
    date: '',
    route: '',
    price_conf: 0,
    prices:[],
    notes: '',
    editFlight: false
  }

 

  ngOnInit(): void {
  

  }
emtyFlight(){
  return this.newFlight = {
    date: '',
    route: '',
    price_conf: 0,
    prices:[],
    notes: '',
    editFlight: false
  }
}
onSubmitFlight() {
  this.newFlight.price_conf = this.newFlight.prices[0]
 //   this.flights.push(this.newFlight);
 if (this.selectedRoute.route && this.selectedRoute.price > 0) {
  // Multiplicar el precio seleccionado por cada uno de los elementos de number_paxs
  const calculatedPrices = this.paxs().map(pax => this.selectedRoute.price * pax);
  
  // Crear el objeto newFlight con el array prices
  const flightToAdd = {
    ...this.newFlight,
    route: this.selectedRoute.route,
    price_conf: this.selectedRoute.price,
    prices: calculatedPrices
  };
  console.log(this.flights);
  this.flights.push(flightToAdd);
  this.emitFlights(); 
  this.emtyFlight();
}
}
    

onEdit(item: any, index: number) {
  this.originalItem[index] = { ...item };
  item.editFlight = true;
  console.log('editando item', item, index);
  this.emitFlights(); 

}
onClose(item: any, index: number){
    // Revertir el item al estado original
    this.flights[index] = { ...this.originalItem[index] };
    item.editFlight = false;
    this.emitFlights(); 
}
onSave(item: any){
  item.editFlight= false
  this.originalItem = {};
  this.emitFlights(); 
}
onDelete(index: number){
  this.flights.splice(index, 1); 
  this.emitFlights(); 
}

private emitFlights() {
  this.flightsChange.emit(this.flights);
  this.totalPricesChange.emit(this.getTotalPrices())
}
getTotalPrices(): number[] {
  const totalPrices: number[] = [];
  // Recorrer cada vuelo (flight) en la tabla
  this.flights.forEach((flight: { prices: number[] }) => {
    // Recorrer cada precio dentro del array 'prices' del vuelo
    flight.prices.forEach((price: number, index: number) => {
      // Si ya existe un valor en 'totalPrices' para ese índice, lo suma
      if (totalPrices[index]) {
        totalPrices[index] += price;
      } else {
        // Si no existe valor aún, lo inicializa con el precio actual
        totalPrices[index] = price;
      }
    });
  });

  return totalPrices;
}

}
