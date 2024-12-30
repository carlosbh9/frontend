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
}


  
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
     this.selectedServices.services.push(...selectedDayServices);
    // let preciosCalculados =  await this.priceService.calculatePrice(this.selectedServices)
    // this.servicesChange.emit(preciosCalculados)

    dayCounter++;
  });

  

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
