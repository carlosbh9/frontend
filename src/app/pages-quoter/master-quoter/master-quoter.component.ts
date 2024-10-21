import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../Services/hotel.service';
import { ServicesComponent } from '../services/services.component';
import { EntrancesService } from '../../Services/entrances.service'
import { ExpeditionsService } from '../../Services/expeditions.service';
import { GuidesService } from '../../Services/guides.service';
import { RestaurantService } from '../../Services/restaurant.service';
import { OperatorsService } from '../../Services/operators.service';

@Component({
  selector: 'app-master-quoter',
  standalone: true,
  imports: [CommonModule,FormsModule,ServicesComponent],
  templateUrl: './master-quoter.component.html',
  styleUrl: './master-quoter.component.css'
})
export class MasterQuoterComponent implements OnInit{
  
  entranceService = inject(EntrancesService)
  expeditionsService = inject(ExpeditionsService)
  guidesService = inject(GuidesService)
  restaurantService = inject(RestaurantService)
  operatorsService = inject(OperatorsService)
  
  typeoptions: string =''
  selectedDayIndex: any = {type: 'service',dayIndex: 0};
  servicesOptions: any[]=[]
  subservicesOptions: any[]=[]
  selectCategoria: string =''
  selectedService: any = {}
  selectedTag: any ={}

  selectedSubService: any = {}
  tags: any[] = []; // Etiquetas seleccionadas
  options: any[] = []; // Etiquetas seleccionadas
  index: number = 0
  temp: number =0
  masterQuoter = {
    name: null,
    days: null,
    destinations: null,
    day:[{
    //  index: 0,
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
  // masterQuoter = {
  //   name: null,
  //   days: null,
  //   destinations: null,
  //   day:[],
  //   services: [] as {
  //     type_service: string | null,
  //     name_service: string | null,
  //     service_id: string | null,
  //     service_type: string | null,
  //     operator_service_id: string | null,
  //     train_service_id: string | null,
  //   }[]
  // };

  ngOnInit(): void {
   
  }




  removeTag(tag: any): void {
    const index = this.masterQuoter.day[this.index].services.findIndex(t => t.service_id === tag.service_id);
    if (index !== -1) {
      this.masterQuoter.day[this.index].services.splice(index, 1); // Eliminar el tag
      console.log('Tags seleccionados:', this.masterQuoter.day[this.index].services); // Mostrar en consola las etiquetas restantes
    }
  }



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
   
   console.log('services ',this.masterQuoter.day)
}
prueba(event: any){
  // this.selectedService.operator_service_id =this.selectedSubService.id 
  // this.selectedService.name_service=this.selectedSubService.name
  // Verificar si el tag ya está en el arreglo de tags
 // this.selectedSubService.type_service= this.typeoptions
  this.selectedSubService.type_service= this.selectedDayIndex.type
  this.selectedSubService.service_id = this.selectedService.service_id
  this.selectedSubService.service_type= this.selectCategoria
  const index = this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.findIndex(tag => tag.operator_service_id === this.selectedSubService.operator_service_id
  );

  console.log('index',index)
  if (index === -1) {
      this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.push(this.selectedSubService); 
  } else {
    this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.splice(index, 1); // Eliminar tag si ya existe
  }
  //console.log('services',this.selectedSubService.id)
  console.log('services 2',this.masterQuoter.day)
 
}

addDays(){
  this.index++
  this.masterQuoter.day.push({
 //   index: this.index,
    services: [] 
  })

  console.log('typeoptions',this.selectedDayIndex)
}
}
