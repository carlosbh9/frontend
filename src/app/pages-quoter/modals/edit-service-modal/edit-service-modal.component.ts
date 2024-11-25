import { CommonModule } from '@angular/common';
import { Component, Output,EventEmitter ,Input, inject, input, OnInit} from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, FormArray, FormsModule } from '@angular/forms';

import { EntrancesService } from '../../../Services/entrances.service'
import { ExpeditionsService } from '../../../Services/expeditions.service';
import { GuidesService } from '../../../Services/guides.service';
import { RestaurantService } from '../../../Services/restaurant.service';
import { OperatorsService } from '../../../Services/operators.service';
import { MasterQuoterService } from '../../../Services/master-quoter.service';
import {CalculatepricesService}  from '../../../Services/controllerprices/calculateprices.service'

@Component({
  selector: 'app-edit-service-modal',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './edit-service-modal.component.html',
  styleUrl: './edit-service-modal.component.css'
})
export class EditServiceModalComponent implements OnInit{
  entranceService = inject(EntrancesService)
  expeditionsService = inject(ExpeditionsService)
  guidesService = inject(GuidesService)
  restaurantService = inject(RestaurantService)
  operatorsService = inject(OperatorsService)
  masterQuoterService = inject(MasterQuoterService)
  tempPreviuw : any = {}
 priceService = inject(CalculatepricesService);
  @Output() closeModalEvent = new EventEmitter<void>();
  number_paxs = input<number[]>();
  @Input() dayData: any; // Recibimos el día completo con servicios

  servicesOptions: any[]=[]


// Método para cerrar el modal (emite el evento)
closeModal() {
  this.dayData= this.tempPreviuw
  this.closeModalEvent.emit();
  
}
ngOnInit(): void {
  this.tempPreviuw = this.dayData
}
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
    services:[{
      name_service: '',
      operator_service_id: '',
      service_id: '',
      service_type:'', 
      type_service: ''
  }],
    date:'',
    number_paxs:[0],
    children_ages:[],
    city:''
  }
  masterQuoter = {
    name: null,
    days: null,
    destinations: null,
    day:[{
      city: null,
      name_services:null,
      services: [] as {
      type_service: string | null,
      name_service: string | null,
      service_id: string | null,
      service_type: string | null,
      operator_service_id: string | null,
      train_service_id: string | null,
    }[]
    }],

  };
 emptyMasterQuoter = {
    name: null,
    days: null,
    destinations: null,
    day:[{
      city: null,
      name_services:null,
      services: [] as {
      type_service: string | null,
      name_service: string | null,
      service_id: string | null,
      service_type: string | null,
      operator_service_id: string | null,
      train_service_id: string | null,
    }[]
    }],

  };

 async onCategoriaChange(event: any){
    console.log('categoria: ',this.selectCategoria)

      switch(this.selectCategoria){
        case 'entrance': this.servicesOptions = await this.entranceService.getAllEntrances();  break;
        case 'expeditions': this.servicesOptions = await this.expeditionsService.getAllExpeditions(); break;
        case 'guides':  this.servicesOptions = await this.guidesService.getAllGuides(); break;

        case 'restaurant': this.servicesOptions = await this.restaurantService.getAllRestaurants(); break;

        case 'operator': this.servicesOptions = await this.operatorsService.getAllOperators();
         break;

        case 'transport':

        case 'experience':
      }

  }

async onServiceChange(event: any){

    if(this.selectCategoria==='operator'){this.subservicesOptions = await this.operatorsService.getServicesByOperator(this.selectedService.service_id);}

    const index = this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.findIndex(tag => tag.service_id === this.selectedService.service_id);
   // this.masterQuoter.services[0].options=[]
    if(this.selectCategoria!='operator'){
      if (index === -1) {
          this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.push(this.selectedService);
        // Añadir nuevo tag si no existe
      } else {
        this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.splice(index, 1); // Eliminar tag si ya existe
      }
    }

   console.log('services seleccionado',this.selectedService)
}
onSubServiceChange(event: any){

  //this.selectedService.operator_service_id = this.selectedDayIndex.type
  //this.selectedSubService.service_id = this.selectedService.service_id
  this.selectedService.operator_service_id = this.selectedSubService.operator_service_id
 // this.selectedService.service_type= this.selectCategoria
 


  console.log('services seleccionado',this.selectedService)
}

onDelete(index: number){
  this.dayData.services.splice(index, 1); 
   
}

async addItem(){
  let item2 : any = {}
  this.item.services[0]=(this.selectedService); // Cambia ...this.selectedService por this.selectedService si es un objeto
  this.item.date = this.dayData.date

  this.item.number_paxs = this.number_paxs() || []; // Proporcionar un valor por defecto si es undefined

  
  item2  = await this.priceService.calculatePrice(this.item)
  

  this.dayData.services.push(item2.services[0])
}
}
