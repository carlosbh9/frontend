import { Component, inject, OnInit,input, output } from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-form-entrances',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-entrances.component.html',
  styleUrl: './form-entrances.component.css'
})
export class FormEntrancesComponent implements OnInit {
  entranceService = inject(EntrancesService)
  serviceItem = output<any>()
  selectedCity = input<string>();
  selectedDate = input<string>();
  priceLength = input.required<number>();

  addedPricesCount: number = 0

  selectedService: any = {};
  selectedAge: Number =0
  notes: string =''
  entrances: any[]=[];
  entrance: any = {
    prices:[]
  }

  async loadEntrances (){
    try{
      this.entrances = await this.entranceService.getAllEntrances();
    }catch{
      console.error('Error fetching entrances');
    }
  }

  ngOnInit(): void {
    this.loadEntrances();
  }

  addPrices(){

    if (this.addedPricesCount < this.priceLength()) {
     // Agregamos el precio actual al final del arreglo
     this.entrance.prices[this.addedPricesCount] = this.entrance.price_pp;
     this.addedPricesCount++; // Incrementamos el contador
   } else {
     // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
     console.log("No se pueden agregar más precios, el arreglo está lleno.");
   }

   }

  onServiceChange(event: any): void {

    const selectedService = this.entrances.find(service => service._id === this.selectedService);
    this.entrance.name_service=selectedService.description

    if(this.selectedAge <= selectedService.childRate.upTo){
      this.entrance.price_pp=selectedService.childRate.pp
    }else{
     this.entrance.price_pp=selectedService.price_pp
    }

    this.entrance.notes=this.notes
    this.entrance.date=this.selectedDate()
    this.entrance.city=this.selectedCity()


    this.serviceItem.emit(this.entrance)
    console.log(this.entrance)
  }

Services(event: any){
//  this.entrance.prices= new Array(this.priceLength()).fill(0);
 // this.addedPricesCount=0
  this.entrance.notes=''
}
}
