import { CommonModule } from '@angular/common';
import { Component, Output,EventEmitter ,Input, inject, HostListener,input, OnInit, output} from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, FormArray, FormsModule } from '@angular/forms';

import { EntrancesService } from '../../../Services/entrances.service'
import { ExpeditionsService } from '../../../Services/expeditions.service';
import { GuidesService } from '../../../Services/guides.service';
import { RestaurantService } from '../../../Services/restaurant.service';
import { OperatorsService } from '../../../Services/operators.service';
import { TransportService } from '../../../Services/transport.service';
import { TrainService } from '../../../Services/train.service';
import { MasterQuoterService } from '../../../Services/master-quoter.service';
import {CalculatepricesService}  from '../../../Services/controllerprices/calculateprices.service'
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2'
import { GourmetService } from '../../../Services/limagourmet/gourmet.service';
import { ExtrasService } from '../../../Services/serviceTarifario/extras.service';
import { ExperiencesService } from '../../../Services/experiences.service';
import { ServiceCalc } from '../../../interfaces/servicepricecalculation.interface';


@Component({
  selector: 'app-edit-service-modal',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule,SweetAlert2Module],
  templateUrl: './edit-service-modal.component.html',
  styleUrl: './edit-service-modal.component.css'
})
export class EditServiceModalComponent implements OnInit{
  entranceService = inject(EntrancesService)
  expeditionsService = inject(ExpeditionsService)
  guidesService = inject(GuidesService)
  restaurantService = inject(RestaurantService)
  operatorsService = inject(OperatorsService)
  transportService = inject(TransportService)
  trainService  = inject(TrainService)
  activitiesService = inject(ExperiencesService)
  gourmetService = inject(GourmetService)
  extraService = inject(ExtrasService)
  fb = inject(FormBuilder)

  masterQuoterService = inject(MasterQuoterService)
  mqService = inject(MasterQuoterService)
  tempPreviuw : any = {}
  priceService = inject(CalculatepricesService);
  @Output() closeModalEvent = new EventEmitter<void>();

  
  number_paxs = input<number[]>();
  children_ages = input<number[]>()
  @Input() dayData: any; 
  selectedYear: string =  '2025'
  searchTerm: string = ''; //mquoter
  filteredOptions: any[] = [];  //mquoter
  mqQuoters: any[] = []; //mquoter
  showOptions: boolean = false;  
  city: string = ''
  servicesOptions: any[]=[]
  editService: boolean= false
  originalItem: any = {};
  filteredDaysOptions: any[]= []
  checkboxes: boolean[][] = [];
  childrenAgesChecks : boolean[] = [];
  isDropdownOpen: boolean = false;
  isDropdownOpenChild: boolean = false;
  public form!: FormGroup;

  selectedDayIndex: any = {type: 'service',dayIndex: 0};
  subservicesOptions: any[]=[]
  selectCategoria: string =''
  selectedService: any = {}
  selectedSubService: any = {}
  tags: any[] = []; // Etiquetas seleccionadas
  options: any[] = []; // Etiquetas seleccionadas
  index: number = 0
  temp: number =0
  item = {
      services: [] as ServiceCalc[],
      date:'',
      number_paxs:[0],
      children_ages:[] as number[],
      city:''
    }

 emptyMasterQuoter = {
   name: null,
    days: null,
    destinations: null,
    day:[{
      city: null,
      name_services:null,
      services: [] as {
        city: string | null,
      type_service: string | null,
      name_service: string | null,
      service_id: string | null,
      service_type: string | null,
      operator_service_id: string | null,
      train_service_id: string | null,
    }[]
    }],

  };

  ngOnInit(): void {
   // this.tempPreviuw = this.dayData
    this.checkboxes = this.dayData.number_paxs.map((groupSize: any) => Array(groupSize).fill(true));
    this.childrenAgesChecks = this.dayData.children_ages.map(() => true);


    this.loadmqServicesMQuoter();
    
  }
  closeModal() {
    console.log('data recuperdad',this.dayData,this.tempPreviuw)
    this.closeModalEvent.emit();
  }
  async onCategoriaChange(event: any){
    console.log('categoria: ',this.selectCategoria)

      switch(this.selectCategoria){
        case 'entrance': const entrances  = await this.entranceService.getAllEntrances();  
        this.servicesOptions = entrances.filter(item => item.year === this.selectedYear);
        break;
        case 'expeditions': const expeditions = await this.expeditionsService.getAllExpeditions();
        this.servicesOptions = expeditions.filter(item => item.year === this.selectedYear); break;

        case 'guides':  const guides = await this.guidesService.getAllGuides();
              this.servicesOptions = guides.filter(item => item.year === this.selectedYear); break;

        case 'restaurant': const restaurants =  await this.restaurantService.getAllRestaurants();
        this.servicesOptions = restaurants.filter(item => item.year === this.selectedYear); break;

        case 'transport': const transport = await this.transportService.getalltransport();
        this.servicesOptions = transport.filter(item => item.year === this.selectedYear); 
        break;

        case 'experience': const experience = await this.activitiesService.getAllExperiences();
        this.servicesOptions = experience.filter(item => item.year === this.selectedYear);  break;

        case 'gourmet' : const gourmet = await this.gourmetService.getAllLimagourmet();
        this.servicesOptions =  gourmet.filter(item => item.year === this.selectedYear);  break;

        case 'train': const train = await this.trainService.getAllTrains();
        this.servicesOptions = train.filter(item => item.year === this.selectedYear); break;

        case 'operator': const operator = await this.operatorsService.getAllOperators();
        this.servicesOptions =  operator.filter(item => item.year === this.selectedYear);
        break;

        case 'extra': const extra = await this.extraService.getAllExtras();
        this.servicesOptions =  extra.filter(item => item.year === this.selectedYear);
                
        break;
      }

  }

async onServiceChange(event: any){

    if(this.selectCategoria==='operator'){this.subservicesOptions = await this.operatorsService.getServicesByOperator(this.selectedService.service_id);}

    if(this.selectCategoria==='train'){this.subservicesOptions = await this.trainService.getServicesByTrainId(this.selectedService.service_id);}

}

getServiceValue(service: any) {
  if (this.selectCategoria === 'operator') {
    return {operator_service_id:service._id,name_service:service.descripcion} 
  } else if (this.selectCategoria === 'train') {
    return { train_service_id: service._id, name_service:  service.serviceName };
  }else {
    return {type_service: this.selectedDayIndex.type ,service_id: service._id,service_type: this.selectCategoria, name_service: service.description || service.name|| service.name_guide || service.operador || service.company || service.nombre || service.activitie};
}
}
onSubServiceChange(event: any){

  if (this.selectCategoria === 'operator') {
    this.selectedService.operator_service_id = this.selectedSubService.operator_service_id
  }else if(this.selectCategoria === 'train'){
     this.selectedService.train_service_id = this.selectedSubService.train_service_id
  }
  
 
 // this.selectedService.service_type= this.selectCategoria

  console.log('services seleccionado',this.selectedSubService,this.selectedService)
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
async loadmqServicesMQuoter() {
  try {
    this.mqQuoters = await this.mqService.getAllMasterQuoter();
    this.filteredOptions = this.mqQuoters; 
    
  } catch (error) {
    console.log('Error al cargar los Master Quoters', error);
  }
}
selectOptionMquoter(option: any): void {
  this.resetFileterOptions();
  this.showOptions = false;
  this.searchTerm = option.name;
  this.filteredDaysOptions = option.day; 
  console.log('el mas seleccionado',this.filteredDaysOptions)
}

onDelete(index: number){
  Swal.fire('Success','Record deleted','success')
  this.dayData.services.splice(index, 1); 
  console.log('data recuperdad delete',this.dayData,this.tempPreviuw)

}
   addItem(){
    this.item.services.push(this.selectedService);
    this.selectedService.city = this.city
    console.log('capturar los seleccionados',this.item,this.selectedService)
    this.pushPrices()
    this.emptyItem()
  }

 async pushPrices(){
    let item2 : any = {}
    this.item.date = this.dayData.date
  //  this.item.number_paxs = this.number_paxs() || [];
    this.item.number_paxs = this.dayData.number_paxs.map((_ : any, groupIndex : any) => this.getSelectedCountForGroup(groupIndex));
    this.item.children_ages = this.children_ages()?.filter((_: any, i: any) => this.childrenAgesChecks[i]) || [];
    this.dayData.number_paxs = this.item.number_paxs
    this.dayData.children_ages = this.item.children_ages 
    item2  = await this.priceService.calculatePrice(this.item)
    console.log('add a daydata',this.item)
    item2.services.forEach( (service: any) => {
      if (!service.city) {
        service.city = this.filteredDaysOptions[0].city 
      }
      
      this.dayData.services.push(service)
    })
  }
  addItembyMq(){

  this.filteredDaysOptions.forEach(option => {
    const selectedDayServices = option.services.filter((service : any, index: number) => service.selected);
    this.item.services.push(...selectedDayServices);
  });

  console.log('capturar los seleccionados',this.item.services)
  console.log('capturar los seleccionados2',this.selectedService)
  let item2 : any = {}
  this.pushPrices()
  this.resetFileterOptions();
  this.emptyItem();
}

resetFileterOptions() {
  this.filteredDaysOptions.forEach(option => {
    option.services.forEach((service: any) => {
      service.selected = false;
    });
  });

}
emptyItem(){
  this.item = {
    ...this.item, 
    services: [], 
    city: '',    
  };
}
onEdit(item: any, index: number) {
  this.originalItem[index] = { ...item };
  item.editService= true;
  console.log('editando item', item, index);

}

onClose(item: any, index: number){

this.dayData.services[index] = { ...this.originalItem[index] };
item.editService = false;
}
onSave(item: any){
item.editService= false
this.originalItem = {};
}


toggleCheckbox(groupIndex: number, checkboxIndex: number) {
  this.checkboxes[groupIndex][checkboxIndex] = !this.checkboxes[groupIndex][checkboxIndex];
  //console.log(this.checkboxes)
}
toggleCheckboxChild(index: number): void {
  this.childrenAgesChecks[index] = !this.childrenAgesChecks[index];
  console.log(this.childrenAgesChecks);
}
getSelectedCountForGroup(groupIndex: number): number {
  return this.checkboxes[groupIndex]?.filter(checkbox => checkbox).length || 0;
}
getSelectedCount(): number {
  return this.childrenAgesChecks.filter(chk => chk).length;
}
toggleDropdown() {
     this.isDropdownOpen = !this.isDropdownOpen;
 }
 toggleDropdownChild() {
  this.isDropdownOpenChild = !this.isDropdownOpenChild;
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
hideOptions() {
  this.showOptions = false;   
}
onBlur() {
  setTimeout(() => {
    this.showOptions = false;
  }, 200);  
}

}
