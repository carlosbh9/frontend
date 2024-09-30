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

  //totalPriceHotels: number = 0;
  totalPriceHotels: number[] = [];
  totalPriceServices: number = 0;
  previousDateService=''
  selectedDate: string ='';
  selectedCity: string = '';
  selectedDateService: string ='';
  selectedCityService: string = '';
  cont = 0
  contDayServices  = 0
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
    if(this.newQuoter.hotels.length!=0){
      this.updatePricesSizeHotels(this.newQuoter.hotels,this.newQuoter.number_paxs.length+1)
    }
    if(this.newQuoter.services.length!=0){
      this.updatePricesSizeServices(this.newQuoter.services,this.newQuoter.number_paxs.length+1)
 
    }
    this.newQuoter.number_paxs.push(0);  // Agrega un nuevo input 
  }
  updatePricesSizeHotels(hotels: any[], newSize: number): any[] {
    return hotels.map(hotel => {
      const currentSize = hotel.prices.length;
      if (currentSize < newSize) {
        hotel.prices = [...hotel.prices, ...new Array(newSize - currentSize).fill(0)];
      }
      return hotel;
    });
  }
  updatePricesSizeServices(services: any[], newSize: number): any[] {
    return services.map(service => {
      const currentSize = service.prices.length;
     if (currentSize < newSize) {
        service.prices = [...service.prices, ...new Array(newSize - currentSize).fill(0)];
      }
      return service;
    });
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
        day: datos.day,
        city: datos.city,
        date:datos.date,
        name_hotel: datos.name_hotel,
        price_base:datos.price_prueba[0],
        prices: datos.price_prueba,
        accomodatios_category: datos.accomodatios_category,
        notes:datos.notes
      };
      if(this.datosrecibidosHotel.prices.length<this.newQuoter.number_paxs.length){
        for(let i = this.datosrecibidosHotel.prices.length; i<this.newQuoter.number_paxs.length;i++){
          this.datosrecibidosHotel.prices[i]=0
        }
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
    
      date: datos.date,
      city: datos.city,
      name_service: datos.name_service,
      price_base:datos.prices[0],
      prices:datos.prices,
      notes: datos.notes
    }
    if(this.datosrecibidosService.prices.length<this.newQuoter.number_paxs.length){
      for(let i = this.datosrecibidosService.prices.length; i<this.newQuoter.number_paxs.length;i++){
        this.datosrecibidosService.prices[i]=0
      }
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
    if (this.datosrecibidosService.date !== this.previousDateService) {
      this.contDayServices++; // Incrementa el día solo si la fecha cambia
      
      this.previousDateService = this.datosrecibidosService.date; // Actualiza la fecha previa
    }
    if(this.datosrecibidosService!){
          this.datosrecibidosService.day=this.contDayServices
          this.newQuoter.services.push(this.datosrecibidosService)  
    }
    
    this.updateTotalPriceServices();
    this.datosrecibidosService = null
    console.log('probando contador services',this.contDayServices)
    console.log('fecha previa',this.previousDateService)

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

  getTotalPrices(): number[] {
    const totalPrices: number[] = [];

    this.newQuoter.hotels.forEach((hotel: { prices: number[] }) => { // Especificar el tipo de 'hotel'
      hotel.prices.forEach((price: number, index: number) => { // Especificar el tipo de 'price'
        if (totalPrices[index]) {
          totalPrices[index] += price; // Sumar al total existente
        } else {
          totalPrices[index] = price; // Inicializar el total
        }
      });
    });

    return totalPrices;
  }
}
