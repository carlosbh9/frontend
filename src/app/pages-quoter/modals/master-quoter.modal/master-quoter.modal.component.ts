import { CommonModule } from '@angular/common';
import { Component,Output, EventEmitter, inject, OnInit ,HostListener } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MasterQuoterService } from '../../../Services/master-quoter.service';
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
selectedServices: { [serviceId: string]: boolean } = {};

servicesList: any[] = []; // Aquí guardarás los de type_service 'services'
optionsList: any[] = []; // Aquí guardarás los de type_service 'options'

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
  this.filteredOptions = this.mqQuoters.filter(option =>
    option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}

// Seleccionar opción en Master Quoter
selectOption(option: any): void {
  this.selectedMasterQuoter = option;
  this.showOptions = false;
  this.searchTerm = option.name;
  this.filteredDaysOptions = option.day; // Filtrar días basados en la selección de Master Quoter
}

// Filtrar opciones en days
filterOptionsDays(): void {
  if (this.selectedMasterQuoter?.day) {
    this.filteredDaysOptions = this.selectedMasterQuoter.day.filter((day: { city?: string; name_services?: string }) =>
      (day.city && day.city.toLowerCase().includes(this.searchTermDays.toLowerCase())) ||
      (day.name_services && day.name_services.toLowerCase().includes(this.searchTermDays.toLowerCase()))
    );
  } else {
    this.filteredDaysOptions = [];
  }
}


// Seleccionar un día específico
selectOptionDay(dayOption: any): void {
  this.showOptionsDays = false;
  this.searchTermDays = `${dayOption.city} - ${dayOption.name_services}`;
  // this.servicesList = dayOption.services.filter((service: { type_service: string }) => service.type_service === 'services');
  // this.optionsList = dayOption.services.filter((service: { type_service: string }) => service.type_service === 'options');
  this.servicesList = dayOption.services.filter((service: any) => service.type_service === 'services');
  this.optionsList = dayOption.services.filter((service: any) => service.type_service === 'options');

  //Marca los `services` como seleccionados por defecto
  this.servicesList.forEach(service => {
    this.selectedServices[service.service_id] = true;
  });
  console.log('opcion seleccionada del dia',dayOption)
}

onDayOptionSelect(dayOption: any): void {
  // Filtra los servicios y los separa en `services` y `options`
  this.servicesList = dayOption.services.filter((service: any) => service.type_service === 'services');
  this.optionsList = dayOption.services.filter((service: any) => service.type_service === 'options');

  //Marca los `services` como seleccionados por defecto
  this.servicesList.forEach(service => {
    this.selectedServices[service.service_id] = true;
  });
}



// Método para ocultar las opciones
hideOptions() {
  this.showOptions = false; 
  this.showOptionsDays = false // Cambia el estado para ocultar las opciones
}

// Detectar clics fuera del input y la lista de opciones
@HostListener('document:click', ['$event'])
onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const inputElement = document.getElementById('searchInput'); // ID del input
  const dropdownElement = document.getElementById('optionsDropdown'); // ID del dropdown

  const inputElement2 = document.getElementById('searchInputDays'); // ID del input
  const dropdownElement2 = document.getElementById('optionsDropdownDay'); // ID del dropdown

  // Si el clic no es en el input o el dropdown, oculta las opciones
  if (inputElement && !inputElement.contains(target) && dropdownElement && !dropdownElement.contains(target)) {
    this.hideOptions();
  }

  if (inputElement2 && !inputElement2.contains(target) && dropdownElement2 && !dropdownElement2.contains(target)) {
    this.hideOptions();
  }
}

//  [ngModelOptions]="{standalone: true}"
}
