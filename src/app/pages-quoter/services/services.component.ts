import { CommonModule } from '@angular/common';
import { Component,Input ,input,Output,EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormEntrancesComponent } from '../form-entrances/form-entrances.component';
import {FormExpeditionsComponent} from '../form-expeditions/form-expeditions.component'
import { FormGuidesComponent } from '../form-guides/form-guides.component';
import { FormRestaurantsComponent } from '../form-restaurants/form-restaurants.component';
import { FormOperatorsComponent } from '../form-operators/form-operators.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule,FormEntrancesComponent,
    FormExpeditionsComponent,
    FormGuidesComponent,
    FormRestaurantsComponent,
    FormOperatorsComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  @Output() servicesChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  @Input() services: any[]=[]
  selectedDateService: string ='';
  selectedCityService: string = '';
  selectedCategory: string = '';
  datosrecibidosService: any ={}
  number_paxs = input.required<number>();
  contDayServices  = 0
  previousDateService=''

 // services: any[]=[]

  addItemService(datos:any){
    const uu = datos.prices[0]
    this.datosrecibidosService={
      date: datos.date,
      city: datos.city,
      name_service: datos.name_service,
      price_base: datos.price_pp,
      prices:datos.prices,
      notes: datos.notes
    }

    if(this.datosrecibidosService.prices.length<this.number_paxs()){
      for(let i = this.datosrecibidosService.prices.length; i<this.number_paxs();i++){
        this.datosrecibidosService.prices[i]=0
      }
    }

  }
  onSubmitService(){
    if (this.datosrecibidosService.date !== this.previousDateService) {
      this.contDayServices++; // Incrementa el día solo si la fecha cambia
      this.previousDateService = this.datosrecibidosService.date; // Actualiza la fecha previa
    }
    if(this.datosrecibidosService!){
          this.datosrecibidosService.day=this.contDayServices
          this.services.push(this.datosrecibidosService)
          console.log('agregado correctamente',this.services)
    }
    this.emitServices()
   // this.datosrecibidosService = null
  
//  console.log('estas los precios',this.datosrecibidosService)
  }

  getTotalPricesServices(): number[] {
    const totalPrices: number[] = [];
   
    this.services.forEach((service: { prices: number[] }) => { // Especificar el tipo de 'hotel'
      service.prices.forEach((price: number, index: number) => { // Especificar el tipo de 'price'
        if (totalPrices[index]) {
          totalPrices[index] += price; // Sumar al total existente
        } else {
          totalPrices[index] = price; // Inicializar el total
        }
      });
    });

    return totalPrices;
  }

  private emitServices() {
    this.servicesChange.emit(this.services);
    this.totalPricesChange.emit(this.getTotalPricesServices())
  }

}
