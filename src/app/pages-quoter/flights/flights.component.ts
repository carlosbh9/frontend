import { CommonModule } from '@angular/common';
import { Component, input,OnInit,output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.css'
})
export class FlightsComponent implements OnInit {

  hotelItem = output<any>();
  priceLength = input.required<number>();
  editFlight: boolean = false;
  flights: any[] = [];
  citys: any[] = ["LIM","CUZ","LIM/CUZ","SV","MP","PUN"]
  newFlight: any = {
    date: '',
    route: '',
    price_conf: 0,
    prices:[],
    notes: ''
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
}

onEdit(item: any) {
  
  this.editFlight= true
}
onClose(){

}

}
