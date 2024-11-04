import { CommonModule } from '@angular/common';
import { Component,Input ,input,Output,EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormEntrancesComponent } from '../form-entrances/form-entrances.component';
import {FormExpeditionsComponent} from '../form-expeditions/form-expeditions.component'
import { FormGuidesComponent } from '../form-guides/form-guides.component';
import { FormRestaurantsComponent } from '../form-restaurants/form-restaurants.component';
import { FormOperatorsComponent } from '../form-operators/form-operators.component';
import { MasterQuoterModalComponent } from '../modals/master-quoter.modal/master-quoter.modal.component';
import { EditServiceModalComponent } from '../modals/edit-service-modal/edit-service-modal.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule,FormEntrancesComponent,
    FormExpeditionsComponent,
    FormGuidesComponent,
    FormRestaurantsComponent,
    FormOperatorsComponent,MasterQuoterModalComponent,EditServiceModalComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
 // @Output() servicesChange = new EventEmitter<any[]>();
  @Output() servicesChange = new EventEmitter<any>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  modalOpen = signal(false);
  selectserviceEdit: any ={} 
  modalOpenEditService = signal(false);
  @Input() services: any[]=[]
  selectedDateService: string ='';
  selectedCityService: string = '';
  selectedCategory: string = '';
  datosrecibidosService: any ={}
  number_paxs = input.required<number[]>();
  count:number = 1
  contDayServices  = 0
  previousDateService=''
  showmodalMasterQuoter = false
 // services: any[]=[]
 // Ejemplo de datos para un nuevo servicio
 newService = {
  day: 1,
  date:'',
  services: [] as any[],

};

  emtyService(){
    this.newService = {
        day: 1,
        date:'',
        services: [] as any[]

    }
  }

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

    if(this.datosrecibidosService.prices.length<this.number_paxs().length){
      for(let i = this.datosrecibidosService.prices.length; i<this.number_paxs().length;i++){
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

  // getTotalPricesServices(): number[] {
  //   const totalPrices: number[] = [];
   
  //   this.services.forEach((service: { prices: number[] }) => { // Especificar el tipo de 'hotel'
  //     service.prices.forEach((price: number, index: number) => { // Especificar el tipo de 'price'
  //       if (totalPrices[index]) {
  //         totalPrices[index] += price; // Sumar al total existente
  //       } else {
  //         totalPrices[index] = price; // Inicializar el total
  //       }
  //     });
  //   });

  //   return totalPrices;
  // }
  getTotalPricesServices(): number[] {
    const totalPrices: number[] = [];
    
    // Itera sobre cada día
    this.services.forEach((day: { services: { prices: number[] }[] }) => {
      // Itera sobre cada servicio dentro del día
      day.services.forEach((service: { prices: number[] }) => {
        service.prices.forEach((price: number, index: number) => {
          if (totalPrices[index]) {
            totalPrices[index] += price; // Sumar al total existente en la posición index
          } else {
            totalPrices[index] = price; // Inicializar el total en la posición index
          }
        });
      });
    });
  
    return totalPrices;
  }

  private emitServices() {
   // this.servicesChange.emit(this.services);
    this.servicesChange.emit(this.services);
    this.totalPricesChange.emit(this.getTotalPricesServices())
  }
  openModal() {
    this.modalOpen.set(true);
  }
// Method to close modal
  closeModal() {
    this.modalOpen.set(false);
  }

  openModalEdit(dayService:any) {
    this.selectserviceEdit=dayService
    this.modalOpenEditService.set(true);
    console.log('dia seleccionado', this.selectserviceEdit)
  }
// Method to close modal
  closeModalEdit() {
    this.modalOpenEditService.set(false);
  }

  onModalmqQuoterChange(temp: any){
   
    this.newService.day = this.count++
    // this.services.push(...temp)
    this.newService.date = temp.date
    this.newService.services.push(...temp.services)
    this.services.push(this.newService)
    this.emtyService();
    this.emitServices()

    console.log('los ',temp)
    console.log('tabla',this.services)
  }
}
