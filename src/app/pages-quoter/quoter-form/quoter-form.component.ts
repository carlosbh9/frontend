import { CommonModule } from '@angular/common';
import { Component, OnInit,Output, EventEmitter, inject } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { QuoterService } from '../../Services/quoter.service';
import { FormHotelComponent } from '../form-hotel/form-hotel.component';
import { FormEntrancesComponent } from '../form-entrances/form-entrances.component';
import {FormExpeditionsComponent} from '../form-expeditions/form-expeditions.component'
import { FormGuidesComponent } from '../form-guides/form-guides.component';
import { FormRestaurantsComponent } from '../form-restaurants/form-restaurants.component';
import { FormOperatorsComponent } from '../form-operators/form-operators.component';

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule, FormsModule,FormHotelComponent,FormEntrancesComponent,FormExpeditionsComponent,FormGuidesComponent,FormRestaurantsComponent,FormOperatorsComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements OnInit{
  quoterService = inject(QuoterService)

  totalPriceHotels: number = 0;
 // totalPriceHotels2: number[] = [];
  totalPriceServices: number = 0;

  selectedDate: string ='';
  selectedCity: string = '';
  previousDateHotel: string = ''; // Para almacenar el último valor de selectedDate
  previousDateService: string = ''; 
  selectedDateService: string ='';
  selectedCityService: string = '';
  contHotel = 1 ;
  contService = 1;
  cont = 0
  //quoter: any={}
  
  newQuoter: any = {
    guest:'',
    FileCode: '',
    travelDate:{
        start:'',
        end: ''
    },
    acomodations:'',
    totalNights: '',
    number_paxs: [0],
    trvale_agent:'',
    exchange_rate:'',
    services:[],
    hotels:[],
    flights:[]
  };

  selectedQuoter: any = {
    guest:'',
    FileCode: '',
    travelDate:{
        start:'',
        end: ''
    },
    acomodations:'',
    totalNights: '',
    number_paxs: 1,
    trvale_agent:'',
    exchange_rate:'',
    services:[],
    hotels:[],
    flights:[]
  };

  selectedCategory: string = '';
  //hotels: any[] = [];
 

  datosrecibidosHotel: any={};
  datosrecibidosService: any ={}


  
  ngOnInit(): void {
    //this.calculateTotalPrice();
    this.datosrecibidosHotel = null
this.datosrecibidosService = null

  }

  addNumberPaxs() {
    this.newQuoter.number_paxs.push(0);  // Agrega un nuevo input 
  console.log('Valores de number_paxs', this.newQuoter.number_paxs);
  console.log('precios',this.totalPriceHotels)
  }

  onPriceChangeHotel(index: number, newPrice: number) {
    this.newQuoter.hotels[index].price = newPrice;  // Asegúrate de que sea un número
    this.updateTotalPriceHotels();

  }
  onPriceChangeService(index: number, newPrice: number){
    this.newQuoter.services[index].price = newPrice;  // Asegúrate de que sea un número
    this.updateTotalPriceServices();
  }

  addItemToQuote(datos: any){
      this.datosrecibidosHotel ={
        day: this.contHotel,
        city: datos.city,
        date:datos.date,
        name_hotel: datos.name_hotel,
        type_hotel: datos.price.type, 
        price: datos.price_prueba,
        //prices:datos.price_prueba,
        accomodatios_category: datos.accomodatios_category,
        notes:datos.notes
      };
      if (this.selectedDate !== this.previousDateHotel) {
        this.contHotel++; // Incrementa el día solo si la fecha cambia
        this.previousDateHotel = this.selectedDate; // Actualiza la fecha previa
     }
  }
  updateTotalPriceHotels() {
    this.totalPriceHotels = this.newQuoter.hotels.reduce((acc: number, hotel: any) => acc + hotel.price, 0);
  }
  updateTotalPriceServices() {
    this.totalPriceServices = this.newQuoter.services.reduce((acc: number, service: any) => acc + service.price_pp, 0);
  }

  addItemService(datos:any){
    
    this.datosrecibidosService={
      day:this.contService,
      date: datos.date,
      city: datos.city,
      name_service: datos.name_service,
      price_pp:datos.price_pp,
      price:datos.price_pp,
      notes: datos.notes
    }
    if (this.selectedDateService !== this.previousDateService) {
      this.contService++; // Incrementa el día solo si la fecha cambia
      this.previousDateService = this.selectedDateService; // Actualiza la fecha previa
    }
  }

  
  onSubmitHotel(){

    if(this.datosrecibidosHotel!){
          this.newQuoter.hotels.push(this.datosrecibidosHotel)
          
    }
    this.updateTotalPriceHotels();
    this.datosrecibidosHotel = null
  }

  onSubmitService(){
    if(this.datosrecibidosService!){
          this.newQuoter.services.push(this.datosrecibidosService)
          
    }
    this.updateTotalPriceServices();
    this.datosrecibidosService = null
  }
  
  onSubmit2(){
    this.quoterService.addItemQuoter(this.newQuoter._id,this.newQuoter.hotels).then(
      response => {
        console.log('Quoter added',response)
        //this.fetchHotels();
      },
      error => {
        console.error('Error adding Quoter', error)
      }
    )

  }
}
