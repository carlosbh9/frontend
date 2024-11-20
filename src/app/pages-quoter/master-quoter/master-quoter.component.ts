import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { HotelService } from '../../Services/hotel.service';
import { ServicesComponent } from '../services/services.component';
import { EntrancesService } from '../../Services/entrances.service'
import { ExpeditionsService } from '../../Services/expeditions.service';
import { GuidesService } from '../../Services/guides.service';
import { RestaurantService } from '../../Services/restaurant.service';
import { OperatorsService } from '../../Services/operators.service';
import { MasterQuoterService } from '../../Services/master-quoter.service';
import { TransportService } from '../../Services/transport.service';
import { ActivatedRoute } from '@angular/router';
import { TrainService } from '../../Services/train.service';
import { ExperiencesService } from '../../Services/experiences.service';
import { GourmetService } from '../../Services/limagourmet/gourmet.service';

@Component({
  selector: 'app-master-quoter',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './master-quoter.component.html',
  styleUrl: './master-quoter.component.css'
})
export class MasterQuoterComponent implements OnInit{

  entranceService = inject(EntrancesService)
  expeditionsService = inject(ExpeditionsService)
  guidesService = inject(GuidesService)
  restaurantService = inject(RestaurantService)
  operatorsService = inject(OperatorsService)
  transportService = inject(TransportService)
  trainService  = inject(TrainService)
  activitiesService = inject(ExperiencesService)
  gourmetService = inject(GourmetService)

  masterQuoterService = inject(MasterQuoterService)
  route = inject(ActivatedRoute)

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
  showUpdate = false
  idQuoter: string = ''
  categoria_temp: string= ''
  selectedYear: string =  '2025'

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


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if(id) {
        this.getQuoterbyId(id);
        this.showUpdate= true
        this.idQuoter=id
     
      }
    })
  }

  async getQuoterbyId(Id: string): Promise<void>{
    try {
      this.masterQuoter = await this.masterQuoterService.getMasterQuoterByIdNotReferences(Id);
      console.log('quoter cargado',this.masterQuoter)
    } catch (error) {
      console.error('Error get operator by iddd ');
    }
  }


  removeTag(tag: any): void {
  // Usamos selectedDayIndex.dayIndex en lugar de index directamente en todo el método
  const dayIndex = this.selectedDayIndex.dayIndex;
  // Validar si dayIndex es válido
  if (dayIndex == null || !this.masterQuoter.day[dayIndex]) {
    console.warn('Índice de día no válido');
    return;
  }
 // Buscar el índice del servicio en el día seleccionado
 const index = this.masterQuoter.day[dayIndex].services.findIndex(service =>
  // Priorizar cada tipo de ID en función de su presencia en `tag`
  (tag.operator_service_id && service.operator_service_id === tag.operator_service_id) ||
  (tag.train_service_id && service.train_service_id === tag.train_service_id) ||
  (!tag.operator_service_id && !tag.train_service_id && service.service_id === tag.service_id)
);

  console.log('Índice encontrado:', index);

  // Verificar si encontró el índice correctamente
  if (index !== -1) {
    this.masterQuoter.day[dayIndex].services.splice(index, 1); // Eliminar el tag
    console.log('Tags seleccionados después de eliminación:', this.masterQuoter.day[dayIndex].services); // Mostrar en consola las etiquetas restantes
  } else {
    console.warn('No se encontró el tag para eliminar');
  }
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

        case 'crucero':
          
                        this.selectedService.service_type= this.selectCategoria
                        
        break;

        case 'puerto': this.selectedService.name_service = this.categoria_temp
        break;
      }
      console.log('categoria: ',this.servicesOptions)

  }

async onServiceChange(event: any){
    console.log('hay id?',this.selectedService.service_id)
    if(this.selectCategoria==='operator'){this.subservicesOptions = await this.operatorsService.getServicesByOperator(this.selectedService.service_id);}

    if(this.selectCategoria==='train'){this.subservicesOptions = await this.trainService.getServicesByTrainId(this.selectedService.service_id);}


    if(this.selectCategoria !== 'operator' && this.selectCategoria !== 'train'){
 
          this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.push(this.selectedService);

    }

   console.log('services ',this.masterQuoter)
}
onSubServiceChange(event: any){

  this.selectedSubService.type_service= this.selectedDayIndex.type
  this.selectedSubService.service_id = this.selectedService.service_id
  this.selectedSubService.service_type= this.selectCategoria

  if(this.selectCategoria=== 'operator' || 'train'){
      this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.push(this.selectedSubService);
  }
}

// Función para calcular el valor de ngValue según la categoría
getServiceValue(service: any) {
  if (this.selectCategoria === 'operator') {
      return { operator_service_id: service._id, name_service: service.descripcion ,service_id: service._id };
  } else if (this.selectCategoria === 'train') {
      return { train_service_id: service._id, name_service:  service.serviceName,service_id: service._id };
  }else {
      return {type_service: this.selectedDayIndex.type ,service_id: service._id,service_type: this.selectCategoria, name_service: service.description || service.name|| service.name_guide || service.operador || service.company || service.nombre || service.activitie};
  }
}

addCruceroAndPuerto(){
  const fecha = (new Date()).getTime().toString(16); // Convierte el timestamp actual en hexadecimal
  const aleatorio = Math.random().toString(16).substring(2, 8); // Genera una cadena aleatoria de 6 caracteres
      
  this.selectedService.service_id = fecha+aleatorio
  this.selectedService.name_service= this.categoria_temp
  this.selectedService.type_service = this.selectedDayIndex.type
  this.masterQuoter.day[this.selectedDayIndex.dayIndex].services.push(this.selectedService);
 
  console.log('jjjjj', this.masterQuoter.day[this.selectedDayIndex.dayIndex].services)
 
}

addDays(){
  this.index++
  this.masterQuoter.day.push({
    city: null,
    name_services:null,
    services: []
  })


}



onSubmit(){

  this.masterQuoterService.createMasterQuoter(this.masterQuoter).then(
    response => {
      console.log('Mater Quoter added',response)
      this.masterQuoter = this.emptyMasterQuoter
      //this.fetchHotels();
    },
    error => {
      console.error('Error adding Master Quoter', error)
    }
  )
}
onUpdate(){
  this.masterQuoterService.updateMasterQuoter(this.idQuoter,this.masterQuoter).then(
    response => {
      console.log('Quoter update',response)
      this.masterQuoter=this.emptyMasterQuoter
    },
    error => {
      console.error('Error editing Quoter', error)
    }
  )
}
}
