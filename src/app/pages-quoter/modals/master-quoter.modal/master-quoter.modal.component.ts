import { CommonModule } from '@angular/common';
import { Component,Output, EventEmitter, inject, OnInit ,HostListener, input, output } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MasterQuoterService } from '../../../Services/master-quoter.service';
import {CalculatepricesService}  from '../../../Services/controllerprices/calculateprices.service'
@Component({
  selector: 'app-master-quoter',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './master-quoter.modal.component.html',
  styleUrl: './master-quoter.modal.component.css'
})
export class MasterQuoterModalComponent implements OnInit {
// Evento para emitir cuando se quiera cerrar el modal
@Output() closeModalEvent = new EventEmitter<void>();

servicesChange = output<any>()
priceService = inject(CalculatepricesService);
numberpaxs = input<number[]>();
childrenAges = input<number[]>();
mqService = inject(MasterQuoterService)
//mqQuoters: any[]=[]
// Método para cerrar el modal (emite el evento)
closeModal() {
  this.closeModalEvent.emit();
}

mqQuoters: any[] = [];
mqQuotersDays: any[]=[]
selectedMqQuoterOption: any = {};
selectedDayOption: any = []
searchTerm: string = '';  // Término de búsqueda
searchTermDays: string = '';  // Término de búsqueda
showOptions: boolean = false;  // Controla la visibilidad de las opciones
showOptionsDays: boolean = false;  // Controla la visibilidad de las opciones de dias
selectedMasterQuoter: any  = null;
filteredOptions: any[] = [];  // Opciones filtradas mq Quoters
filteredDaysOptions: any[]= []
//selectedServices: { [serviceId: string]: boolean } = {};
//selectedServices:  any [] = [];
servicesList: any[] = []; // Aquí guardarás los de type_service 'services'
optionsList: any[] = []; // Aquí guardarás los de type_service 'options'

selectedServices: any = {
  services: [],
  number_paxs: [],
  children_ages: [],
  date: '',
  city:''
};

preciosCalculados: any = {
  price: [],
  name:'',
  date:''
};

ngOnInit(): void {
  this.loadmqServices();
  console.log('dddd los paxs',this.numberpaxs())
}

async loadmqServices() {
  try {
    this.mqQuoters = await this.mqService.getAllMasterQuoter();
    this.filteredOptions = this.mqQuoters;  // Inicializa las opciones filtradas
  } catch (error) {
    console.log('Error al cargar los Master Quoters', error);
  }
}
 // Filtrar opciones en Master Quoter
 filterOptions(): void {
  // this.filteredOptions = this.mqQuoters.filter(option =>
  //   option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
  // );
  if (this.searchTerm.trim()) {
    this.filteredOptions = this.mqQuoters.filter(option => 
      option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  } else {
    this.filteredOptions = [];
  }
}

// Seleccionar opción en Master Quoter
selectOption(option: any): void {
  this.selectedMasterQuoter = option;
  this.showOptions = false;
  this.searchTerm = option.name;
  this.filteredDaysOptions = option.day; // Filtrar días basados en la selección de Master Quoter
  console.log('el mq seleccionado?',option)
}

// // Filtrar opciones en days
// filterOptionsDays(): void {
//   if (this.selectedMasterQuoter?.day) {
//     this.filteredDaysOptions = this.selectedMasterQuoter.day.filter((day: { city?: string; name_services?: string }) =>
//       (day.city && day.city.toLowerCase().includes(this.searchTermDays.toLowerCase())) ||
//       (day.name_services && day.name_services.toLowerCase().includes(this.searchTermDays.toLowerCase()))
//     );
//   } else {
//     this.filteredDaysOptions = [];
//   }
 
// }


// // Seleccionar un día específico
// selectOptionDay(dayOption: any): void {
//   this.selectedServices.city = dayOption.city
//   this.showOptionsDays = false;
//   this.searchTermDays = `${dayOption.city} - ${dayOption.name_services}`;
 
//   this.servicesList = dayOption.services.filter((service: any) => service.type_service === 'services');
//   this.optionsList = dayOption.services.filter((service: any) => service.type_service === 'options');

//   //Marca los `services` como seleccionados por defecto
//   this.servicesList.forEach(service => {
//     this.selectedServices[service.service_id] = true;
//   });
// }

// toggleService(service: any) {

//      // Crea una clave única basada en service_id y el id adicional
//      const uniqueKey = `${service.service_id}_${service.operator_service_id || service.train_service_id || ''}`;

//      const index = this.selectedServices.services.findIndex((s:any) => 
//        `${s.service_id}_${s.operator_service_id || s.train_service_id || ''}` === uniqueKey
//      );
 
//      if (index > -1) {
//        // Si ya está seleccionado, quitarlo
//        this.selectedServices.services.splice(index, 1);
//      } else {
//        // Si no está seleccionado, agregarlo
//        this.selectedServices.services.push(service);
//      }
  
// }

  // Función para gestionar el cambio del checkbox en la cabecera
  
  toggleAllServices(option: any): void {
    // Si el checkbox de la cabecera está seleccionado, seleccionamos todos los servicios de tipo 'services'
    if (option.selected) {
      option.services.forEach((service: any) => {
        if (service.type_service === 'services') {
          service.selected = true;
        }
      });
    } else {
      // Si el checkbox de la cabecera no está seleccionado, desmarcamos todos los servicios de tipo 'services'
      option.services.forEach((service: any) => {
        if (service.type_service === 'services') {
          service.selected = false;
        }
      });
    }
  }

async onAddMQuoter(){
  this.selectedServices.number_paxs=this.numberpaxs()
  this.selectedServices.children_ages= this.childrenAges()
  let dayCounter = 1; // Contador para los días
  // Recorrer todos los días (filteredDaysOptions)
  this.filteredDaysOptions.forEach(option => {
    // Filtrar los servicios seleccionados
    const selectedDayServices = option.services.filter((service : any, index: number) => service.selected);
    // Agregar el atributo 'city' de cada día a los servicios seleccionados
   selectedDayServices.forEach((service: any) => {
    service.city = option.city; 
    service.day = dayCounter;
  });

    // Agregar los servicios seleccionados al array
    // this.selectedServices.services.push(...selectedDayServices);
    // let preciosCalculados =  await this.priceService.calculatePrice(this.selectedServices)
    // this.servicesChange.emit(preciosCalculados)

    console.log('los servicios seleccionados por servicios',selectedDayServices)
    dayCounter++;
  });

  console.log('los servicios seleccionados 1',this.selectedServices)
  

  this.selectedServices.number_paxs=this.numberpaxs()
  this.selectedServices.children_ages= this.childrenAges()
  this.preciosCalculados = await this.priceService.calculatePrice(this.selectedServices)
  this.preciosCalculados.date = this.selectedServices.date
  this.servicesChange.emit(this.preciosCalculados)
  this.closeModal()
  
}


// Método para ocultar las opciones
hideOptions() {
  this.showOptions = false; 
  this.showOptionsDays = false // Cambia el estado para ocultar las opciones
}

@HostListener('document:click', ['$event'])
onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  // Verificar si el clic fue fuera del modal y dropdown
  const modalElement = document.getElementById('modalMq');  // ID del modal
  const inputElement = document.getElementById('searchInput');
  const dropdownElement = document.getElementById('optionsDropdown');

  // Si el clic no es en el modal, el input ni el dropdown, ocultamos las opciones
  if (modalElement && !modalElement.contains(target) && 
      inputElement && !inputElement.contains(target) && 
      dropdownElement && !dropdownElement.contains(target)) {
    this.hideOptions();
  }
}

onBlur() {
  setTimeout(() => {
    this.showOptions = false;
  }, 200);  // Permite un pequeño retraso para registrar el clic en las opciones
}

}
