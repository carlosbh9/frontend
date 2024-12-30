import { CommonModule } from '@angular/common';
import { Component,Input ,input,Output,EventEmitter, signal,ViewChild,
  ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MasterQuoterModalComponent } from '../modals/master-quoter.modal/master-quoter.modal.component';
import { EditServiceModalComponent } from '../modals/edit-service-modal/edit-service-modal.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule,MasterQuoterModalComponent,EditServiceModalComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
 // @Output() servicesChange = new EventEmitter<any[]>();
  @Output() servicesChange = new EventEmitter<any>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  children_ages = input<number[]>()
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

//   onSubmitService(){
//     if (this.datosrecibidosService.date !== this.previousDateService) {
//       this.contDayServices++; // Incrementa el día solo si la fecha cambia
//       this.previousDateService = this.datosrecibidosService.date; // Actualiza la fecha previa
//     }
//     if(this.datosrecibidosService!){
//           this.datosrecibidosService.day=this.contDayServices
//           this.services.push(this.datosrecibidosService)
//           console.log('agregado correctamente',this.services)
//     }
//     this.emitServices()
//    // this.datosrecibidosService = null
  
// //  console.log('estas los precios',this.datosrecibidosService)
//   }

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
    this.emitServices();
  }

  deleteService(index: number){
    this.services.splice(index,1)
    this.emitServices()
  }

  onModalmqQuoterChange(temp: any){
   
    //this.newService.day = this.count++
    // this.services.push(...temp)
    //this.newService.date = temp.date
    const startDate = new Date(temp.date); // Fecha inicial recibida del servidor
    let currentDay: number = 0; // Variable para almacenar el día actual
    let newService = { day: 0, date: '', services: [] as any[] }; // Estructura de servicio por día

    // Recorrer los servicios de la respuesta del servidor
    temp.services.forEach((service: any) => {
        // Si el día cambia, agregamos el servicio anterior y comenzamos uno nuevo
        if (currentDay !== service.day) {
            // Si no es el primer día, guardamos el newService en 'services'
            if (newService.day !== 0) {
                this.services.push(newService);
            }

            // Calcular la fecha para el día actual usando la fecha base (startDate)
            newService = {
                day: service.day,
                date: this.convertDateToString(this.calculateDateForDay(service.day, startDate)), // Calcular la fecha para el día actual
                services: [service], // Iniciar con el primer servicio del día
            };
            currentDay = service.day; // Actualizar el día actual
        } else {
            // Si seguimos en el mismo día, agregamos el servicio al newService
            newService.services.push(service);
        }
    });

    // Al final, agregamos el último newService al array
    if (newService.day !== 0) {
        this.services.push(newService);
    }
   // this.newService.services.push(...temp.services)
    //this.services.push(this.newService)
    this.emtyService();
    this.emitServices()

    console.log('los ',temp)
    console.log('tabla',this.services)
  }
  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  getTableContainer(): ElementRef {
    return this.tableContainer;
  }
  
// Método para calcular la fecha correspondiente al día
calculateDateForDay(day: number, startDate: Date): Date {
  const newDate = new Date(startDate);
  newDate.setDate(startDate.getDate() + day); // Sumar los días (day, ya que day 0 es el primer día)
  return newDate; // Retorna el objeto Date
}

// Método para convertir la fecha de tipo Date a un string ISO "YYYY-MM-DD"
convertDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegurar que el mes tenga dos dígitos
  const day = String(date.getDate()).padStart(2, '0'); // Asegurar que el día tenga dos dígitos
  return `${year}-${month}-${day}`; // Retorna la fecha en formato "YYYY-MM-DD"
}
}
