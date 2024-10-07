import { CommonModule } from '@angular/common';
import { Component, input,OnInit,output, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.css'
})
export class FlightsComponent implements OnInit {

  datosFlight = output<any[]>();
  priceLength = input.required<number>();
  @Output() flightsChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  //editFlight: boolean = false;
  flights: any[] = [];
  citys: any[] = ["LIM","CUZ","LIM/CUZ","SV","MP","PUN"]
  originalItem: any = {};
  newFlight: any = {
    date: '',
    route: '',
    price_conf: 0,
    prices:[],
    notes: '',
    editFlight: false
  }

  SelectedFlight: any = {
    date: '',
    route: '',
    price_conf: 0,
    prices:[],
    notes: ''
  }

  ngOnInit(): void {

  }
emtyFlight(){
  return this.newFlight = {
    date: '',
    route: '',
    price_conf: 0,
    prices:[],
    notes: ''
  }
}
onSubmitFlight() {
  this.newFlight.price_conf = this.newFlight.prices[0]
    this.flights.push(this.newFlight);
    console.log(this.flights);
    this.emtyFlight();
    this.emitFlights(); 
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
