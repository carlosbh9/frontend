import { Component, inject, OnInit,input, output } from '@angular/core';
import { ExpeditionsService } from '../../Services/expeditions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-expeditions',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-expeditions.component.html',
  styleUrl: './form-expeditions.component.css'
})
export class FormExpeditionsComponent implements OnInit {

expeditionsService = inject(ExpeditionsService)

serviceItem = output<any>()
selectedCity = input<string>();
selectedDate = input<string>();
priceLength = input.required<number>();
previousDateService: string = '';
addedPricesCount: number = 0
contService = 0;
selectedService: any = {};
expeditions: any[]=[]
expedition: any = {
  prices:[],
  notes:''
  //price_base:0
}

notes: string = ''

async loadExpeditions (){
  try{
    this.expeditions = await this.expeditionsService.getAllExpeditions();
  }catch{
    console.error('Error fetching expeditions');
  }
}

ngOnInit(): void {
  this.loadExpeditions();
}

addPrices(){
  
  if (this.addedPricesCount < this.priceLength()) {
   // Agregamos el precio actual al final del arreglo
   this.expedition.prices[this.addedPricesCount] = this.expedition.price_pp;
   this.expedition.price_base=this.expedition.price_pp
  this.addedPricesCount++; // Incrementamos el contador

 } else {
   // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
   console.log("No se pueden agregar más precios, el arreglo está lleno.");
 }
}

onServiceChange(event: any) {
  const selectedService = this.expeditions.find(service => service._id === this.selectedService);
  if (this.selectedDate() !== this.previousDateService) {
    this.contService = 1; // Incrementa el día solo si la fecha cambia
    this.previousDateService = this.selectedDate()|| '' ; // Actualiza la fecha previa
  }
    this.expedition.name_service=selectedService.name
    this.expedition.price_pp=selectedService.price_pp
    //this.expedition.price_base=selectedService.price_pp
    this.expedition.day=this.contService
    this.expedition.notes=this.notes
    this.expedition.date=this.selectedDate()
    this.expedition.city=this.selectedCity()
    this.serviceItem.emit(this.expedition)
   
  }
  Services(event: any){
   // this.addedPricesCount=0
   // this.expedition.prices= new Array(this.priceLength()).fill(0);
    this.notes=''

   // this.expedition.price_base =  this.expedition.price_pp
  }
}
