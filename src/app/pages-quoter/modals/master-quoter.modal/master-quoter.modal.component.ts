import { CommonModule } from '@angular/common';
import { Component,Output, EventEmitter, inject, OnInit ,HostListener, input, output,signal, effect } from '@angular/core';
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
@Output() closeModalEvent = new EventEmitter<void>();

servicesChange = output<any>()
priceService = inject(CalculatepricesService);
numberpaxs = input<number[]>([]);
childrenAges = input<number[]>() ;
mqService = inject(MasterQuoterService)
startDateQuoter = input.required<string>();


mqQuoters: any[] = [];
mqQuotersDays: any[]=[]
selectedMqQuoterOption: any = {};
selectedDayOption: any = []
searchTerm: string = ''; 
searchTermDays: string = ''; 
showOptions: boolean = false;  
showOptionsDays: boolean = false; 
selectedMasterQuoter: any  = null;
filteredOptions: any[] = [];  
filteredDaysOptions: any[]= []

//selectedServices:  any [] = [];
servicesList: any[] = []; 
optionsList: any[] = []; 
isDropdownOpen: boolean = false;
isDropdownOpenChild: boolean = false;
checkboxes: boolean[][] = [];
selectedValues: number[] = [];

toggleCheckbox(groupIndex: number, checkboxIndex: number) {
  this.checkboxes[groupIndex][checkboxIndex] = !this.checkboxes[groupIndex][checkboxIndex];
}

getSelectedCountForGroup(groupIndex: number): number {
  return this.checkboxes[groupIndex]?.filter(checkbox => checkbox).length || 0;
}

toggleCheckboxChildrenAges(childAge: number, event: Event): void {
  const isChecked = (event.target as HTMLInputElement).checked;
  if (isChecked) {
    // Si está seleccionado, agregar la edad al arreglo
    this.selectedServices.children_ages.push(childAge);
  } else {
    // Si no está seleccionado, quitar la edad del arreglo
    const index = this.selectedServices.children_ages.indexOf(childAge);
    if (index !== -1) {
      this.selectedServices.children_ages.splice(index, 1);
    }
  }
  console.log('Selected ages:', this.selectedServices.children_ages);  // Imprimir el resultado para depuración

}

toggleDropdown() {
     this.isDropdownOpen = !this.isDropdownOpen;
 }

toggleDropdownChild() {
     this.isDropdownOpenChild = !this.isDropdownOpenChild;
 }

selectedServices: any = {
  services: [],
  number_paxs: [] as number[],
  children_ages: [],
  date: '',
  city:'',
  day:0,
};
closeModal() {
  this.closeModalEvent.emit();
}
preciosCalculados: any = {
  price: [],
  name:'',
  date:''
};

ngOnInit(): void {
  this.loadmqServices();
  this.checkboxes = this.numberpaxs().map(groupSize => Array(groupSize).fill(true));
}

async loadmqServices() {
  try {
    this.mqQuoters = await this.mqService.getAllMasterQuoter();
    this.filteredOptions = this.mqQuoters;  // Inicializa las opciones filtradas
  } catch (error) {
    console.log('Error al cargar los Master Quoters', error);
  }
}
 filterOptions(): void {
  if (this.searchTerm.trim()) {
    this.filteredOptions = this.mqQuoters.filter(option => 
      option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  } else {
    this.filteredOptions = [];
  }
}


selectOption(option: any): void {
  this.selectedMasterQuoter = option;
  this.showOptions = false;
  this.searchTerm = option.name;
  this.filteredDaysOptions = option.day; 
  console.log('el mas seleccionado',this.selectedMasterQuoter)
}

toggleAllServices(option: any): void {
    if (option.selected) {
      option.services.forEach((service: any) => {
        if (service.type_service === 'services') {
          service.selected = true;
        }
      });
    } else {
      option.services.forEach((service: any) => {
        if (service.type_service === 'services') {
          service.selected = false;
        }
      });
    }
}

async onAddMQuoter(){

  if (this.selectedMasterQuoter?.type === 'Templates') { 
    this.selectedServices.date = this.startDateQuoter()
  }
  
  //this.selectedServices.number_paxs=this.numberpaxs()
  this.selectedServices.number_paxs =  this.numberpaxs().map((_, groupIndex) => this.getSelectedCountForGroup(groupIndex));
 
  //this.selectedServices.children_ages= this.childrenAges()
  let dayCounter = 1; 
  this.filteredDaysOptions.forEach(option => {
    const selectedDayServices = option.services.filter((service : any, index: number) => service.selected);
  
   selectedDayServices.forEach((service: any) => {
    service.city = option.city; 
    service.day = dayCounter;
  });

    this.selectedServices.services.push(...selectedDayServices);
    dayCounter++;
  });
 
  console.log('se envio', this.selectedServices)
  this.preciosCalculados = await this.priceService.calculatePrice(this.selectedServices)
  this.preciosCalculados.date = this.selectedServices.date
  this.preciosCalculados.day = this.selectedServices.day 
  
  this.preciosCalculados.number_paxs = this.selectedServices.number_paxs
  this.preciosCalculados.children_ages = this.selectedServices.children_ages
  
  console.log('se emitio a services', this.preciosCalculados)
  this.servicesChange.emit(this.preciosCalculados)
  this.closeModal()
  
}

hideOptions() {
  this.showOptions = false; 
  this.showOptionsDays = false;   
 
}

@HostListener('document:click', ['$event'])
onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  const modalElement = document.getElementById('modalMq'); 
  const inputElement = document.getElementById('searchInput');
  const dropdownElement = document.getElementById('optionsDropdown');

  if (modalElement && !modalElement.contains(target) && 
      inputElement && !inputElement.contains(target) && 
      dropdownElement && !dropdownElement.contains(target)) {
    this.hideOptions();
  }
}

onBlur() {
  setTimeout(() => {
    this.showOptions = false;
  }, 200);  
}

}
