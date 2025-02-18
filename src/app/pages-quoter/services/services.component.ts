import { CommonModule } from '@angular/common';
import { Component,Input ,input,Output,EventEmitter, signal,ViewChild,
  ElementRef, 
  OnChanges,SimpleChanges,computed, effect,WritableSignal,
  OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MasterQuoterModalComponent } from '../modals/master-quoter.modal/master-quoter.modal.component';
import { EditServiceModalComponent } from '../modals/edit-service-modal/edit-service-modal.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule,MasterQuoterModalComponent,EditServiceModalComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent  {

  @Output() servicesChange = new EventEmitter<any>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  children_ages = input<number[]>()
  startDateQuoter = input.required<string>();
  modalOpen = signal(false);
  selectserviceEdit: any ={} 
  modalOpenEditService = signal(false);
  //@Input() services: any[]=[]
  services = input<any[]>([])

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
  number_paxs: [],
  children_ages:[],
  services: [] as any[],
};

  emtyService(){
    this.newService = {
        day: 1,
        date:'',
        number_paxs: [],
        children_ages:[],
        services: [] as any[]

    }
  }

  // sortedServices = computed(() =>
  //   [...this.services()].sort((a, b) => a.day - b.day)
  // );
  sortedServices = computed(() => {
    const servicesCopy = [...this.services()];
    if (!servicesCopy.length) return [];
    const lastElement = servicesCopy.find(service => service.isFixedLast);
    const filteredServices = lastElement
      ? servicesCopy.filter(service => !service.isFixedLast)
      : servicesCopy;

    filteredServices.sort((a, b) => a.day - b.day);
    if (lastElement) {
        // const maxDay = filteredServices[filteredServices.length - 1].day;
        // lastElement.day = maxDay + 1; 
        // return [...filteredServices, lastElement];
        if (filteredServices.length > 0) {
          const maxDay = filteredServices[filteredServices.length - 1].day;  // Asegura que no accedemos a un elemento undefined
          lastElement.day = maxDay + 1;
          return [...filteredServices, lastElement];
        } else {
          // Si no hay servicios filtrados, devuelve solo el elemento fijo
          return [lastElement];
        }
      }
    return filteredServices;
});

  private isEmitting = false; // Evitar bucles al emitir datos al padre

  constructor() {
    // Efecto para emitir servicios al padre cuando cambien los servicios ordenados
    effect(() => {
      if (!this.isEmitting) {
        const sorted = this.sortedServices();
        console.log('Servicios ordenados:', sorted);
        //this.emitServices(); // Emite los servicios ordenados y precios totales
      }
    });
  }


  getTotalPricesServices(): number[] {
    const totalPrices: number[] = [];
   
    this.sortedServices().forEach((day: { services: { prices: number[] }[] }) => {
      day.services.forEach((service: { prices: number[] }) => {
        service.prices.forEach((price: number, index: number) => {
          totalPrices[index] = (totalPrices[index] || 0) + price;
        });
      });
    });
    return totalPrices;
  }

  private emitServices() {
    this.isEmitting = true; 
    this.servicesChange.emit(this.sortedServices());
    //this.servicesChange.emit(this.services);
    this.totalPricesChange.emit(this.getTotalPricesServices())
    this.isEmitting = false; 
  }
  openModal() {
    if (!this.startDateQuoter()) {
      toast.warning('Travel dates are required');
    } else {
      this.modalOpen.set(true);
    }
  }
// Method to close modal
  closeModal() {

    this.modalOpen.set(false);
  }
  openMasterQuoter() {
    
    this.openModal()

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
    // const updatedServices = [...this.sortedServices()];
    // updatedServices.splice(index, 1);
    // this.servicesChange.emit(updatedServices); // Emite los cambios al padre

    this.sortedServices().splice(index,1)
    this.emitServices()
  }
  isLastElement(index: number): boolean {
    return index === this.sortedServices().length - 1;
  }

  onModalmqQuoterChange(temp: any){
    console.log('recibido de mq:', temp)
    const startDate = new Date(temp.date);
    let currentDay: number = 0; 
    let newService = { day: 0, date: '',number_paxs: temp.number_paxs, 
      children_ages: temp.children_ages ,isFixedLast: false, services: [] as any[] }; 
    // Esructura de servicio por día
    if(temp.day >= 1 ){
        this.sortedServices().push(temp);
        console.log('pushh a la tabla ', temp)
    }else {
    temp.services.forEach((service: any, index: number) => {
      if (currentDay !== service.day) {
          if (newService.day !== 0) {
              // Asigna 'isFixedLast: true' al último elemento antes de hacer push
              if (index === temp.services.length - 1) {
                  newService.isFixedLast = true;
              }
              this.sortedServices().push(newService);
          }
          
          newService = {
              day: service.day,
              date: this.convertDateToString(this.calculateDateForDay(service.day, startDate)),
              isFixedLast: false,
              services: [service],
              number_paxs: temp.number_paxs,
              children_ages: temp.children_ages,
          };
          
          // Actualizar el día actual
          currentDay = service.day;
      } else {
          // Si es el mismo día, agregar el servicio al objeto existente
          newService.services.push(service);
      }
  
      // Verifica si este es el último servicio en la lista y aún no se hizo push
      if (index === temp.services.length - 1 && newService.day !== 0) {
          newService.isFixedLast = true;
          this.sortedServices().push(newService);
      }
  });
    }
    this.emtyService();
    this.emitServices()
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
