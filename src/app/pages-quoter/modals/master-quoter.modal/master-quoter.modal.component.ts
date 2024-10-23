import { CommonModule } from '@angular/common';
import { Component,Output, EventEmitter, inject, OnInit ,HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
filteredOptions: any[] = [];  // Opciones filtradas mq Quoters
filteredDaysOptions: any[]= []

//constructor(private mqService: MqService) {}

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

// Método para seleccionar una opción
selectOption(option: any) {
  this.selectedMqQuoterOption = option;
  this.mqQuotersDays = this.selectedMqQuoterOption.day
  this.searchTerm = option.name;  // Actualiza el input con la opción seleccionada
  this.showOptions = false;  // Oculta las opciones al seleccionar
  console.log('Objeto seleccionado:', option);
  console.log('dayoption :', this.searchTermDays);
}

// Método para seleccionar una opción
selectOptionDay(option: any) {
  this.selectedDayOption = option;
  this.searchTermDays = option.name_services;  // Actualiza el input con la opción seleccionada
  this.showOptionsDays = false;  // Oculta las opciones al seleccionar
  
  console.log('servicios :', this.selectedDayOption);
}

// Método para filtrar las opciones
filterOptions() {
  this.showOptions = true;  // Muestra las opciones al escribir en el input
  if (this.searchTerm) {
    this.filteredOptions = this.mqQuoters.filter(mq =>
      mq.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  } else {
    this.filteredOptions = this.mqQuoters;  // Si no hay término de búsqueda, mostrar todas las opciones
  }
}
// Método para filtrar las opciones
filterOptionsDays() {
  this.showOptionsDays = true;  // Muestra las opciones al escribir en el input
  if (this.searchTermDays) {
    this.filteredDaysOptions = this.mqQuotersDays.filter(mq =>
      mq.name_services.toLowerCase().includes(this.searchTermDays.toLowerCase())
    );
  } else {
    this.filteredDaysOptions = this.mqQuotersDays;  // Si no hay término de búsqueda, mostrar todas las opciones
  }

  console.log('holaaaa')
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
