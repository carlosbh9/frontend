import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  selectedDateService: string ='';
  selectedCityService: string = '';
  selectedCategory: string = '';


  
  onSubmitService(){
    if (this.datosrecibidosService.date !== this.previousDateService) {
      this.contDayServices++; // Incrementa el día solo si la fecha cambia
      this.previousDateService = this.datosrecibidosService.date; // Actualiza la fecha previa
    }
    if(this.datosrecibidosService!){
          this.datosrecibidosService.day=this.contDayServices
          this.newQuoter.services.push(this.datosrecibidosService)
          console.log('agregado correctamente',this.newQuoter.services)
    }
   // this.datosrecibidosService = null
  
//  console.log('estas los precios',this.datosrecibidosService)
  }
}
