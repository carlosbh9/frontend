import { CommonModule } from '@angular/common';
import { Component, OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoterService } from '../../Services/quoter.service';
import { FormHotelComponent } from '../form-hotel/form-hotel.component';
import { FormEntrancesComponent } from '../form-entrances/form-entrances.component';
import {FormExpeditionsComponent} from '../form-expeditions/form-expeditions.component'
import { FormGuidesComponent } from '../form-guides/form-guides.component';
import { FormRestaurantsComponent } from '../form-restaurants/form-restaurants.component';
import { FormOperatorsComponent } from '../form-operators/form-operators.component';
import { FlightsComponent } from '../flights/flights.component';
import { Quoter } from '../../interfaces/quoter.interface';
import {ActivatedRoute} from '@angular/router';
import { ExtOperatorComponent } from '../ext-operator/ext-operator.component';

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule
    ,FormsModule,FormHotelComponent,FormEntrancesComponent,
    FormExpeditionsComponent,FormGuidesComponent,FormRestaurantsComponent,
    FormOperatorsComponent,FlightsComponent,ExtOperatorComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements OnInit{
  quoterService = inject(QuoterService)
  route = inject(ActivatedRoute)

  totalPriceHotels: number[] = [];
  totalPriceServices: number[] = [];
  totalPricesFlights: number[]=[]
  showUpdate = false
  idQuoter: string = ''
  previousDateService=''
  selectedDate: string ='';
  selectedCity: string = '';
  selectedDateService: string ='';
  selectedCityService: string = '';
  cont = 0
  contDayServices  = 0


  newQuoter: Quoter = {
    guest:'',
    FileCode: '',
    travelDate:{
        start:'',
        end: ''
    },
    accomodations:'',
    totalNights: 0,
    number_paxs: [0],
    travel_agent:'',
    exchange_rate:'',
    services:[],
    hotels:[],
    flights:[]
  };

  emptyQuoter: Quoter = {
    guest: '',
    FileCode: '',
    travelDate: {
      start: '',
      end: ''
    },
    accomodations: '',
    totalNights: 0,
    number_paxs: [0],
    travel_agent: '',
    exchange_rate: '',
    services: [],
    hotels: [],
    flights: []
  }

  selectedCategory: string = '';

  datosrecibidosHotel: any={};
  datosrecibidosService: any ={}
  datosrecibidosFlights: any[] =[]


  ngOnInit(): void {
    //this.calculateTotalPrice();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if(id) {
        this.getQuoterbyId(id);
        this.showUpdate= true
        this.idQuoter=id
      }
    })
    this.datosrecibidosHotel = null
    this.datosrecibidosService = null

  }
   async getQuoterbyId(Id: string): Promise<void>{
    try {
      this.newQuoter = await this.quoterService.getQuoterById(Id);
      console.log('quoter cargado',this.newQuoter)
    } catch (error) {
      console.error('Error get operator by iddd ');
    }
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


  addItemService(datos:any){
    const uu = datos.prices[0]
    this.datosrecibidosService={
      date: datos.date,
      city: datos.city,
      name_service: datos.name_service,
      price_base: datos.price_pp,
      prices:datos.prices,
      notes: datos.notes
    }

    if(this.datosrecibidosService.prices.length<this.newQuoter.number_paxs.length){
      for(let i = this.datosrecibidosService.prices.length; i<this.newQuoter.number_paxs.length;i++){
        this.datosrecibidosService.prices[i]=0
      }
    }

  }
  onFlightsUpdate(flights: any[]) {
   // this.datosrecibidosFlights = flights;
    this.newQuoter.flights=flights
    console.log('Datos recibidos del componente hijo:',this.newQuoter.flights);
  }

  onTotalPricesChange(prices: number[]) {
    this.totalPricesFlights = prices; // Actualizar el arreglo de precios totales
    console.log('Total Prices desde el hijo:', this.totalPricesFlights);
  }

  onSubmitHotel(){
    if(this.datosrecibidosHotel!){
          this.newQuoter.hotels.push(this.datosrecibidosHotel)
    }
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
          console.log('agregado correctamente',this.newQuoter.services)
    }
   // this.datosrecibidosService = null
  
//  console.log('estas los precios',this.datosrecibidosService)
  }

  onSubmit(){
   
    this.quoterService.createQuoter(this.newQuoter).then(
      response => {
        console.log('Quoter added',response)
        this.newQuoter=this.emptyQuoter
        //this.fetchHotels();
      },
      error => {
        console.error('Error adding Quoter', error)
      }
    )
  }
  onUpdate(){
    this.quoterService.updateQuoter(this.idQuoter,this.newQuoter).then(
      response => {
        console.log('Quoter update',response)
        this.newQuoter=this.emptyQuoter
      },
      error => {
        console.error('Error editing Quoter', error)
      }
    )
  }

  getTotalPricesHotels(): number[] {
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
  getTotalPricesServices(): number[] {
    const totalPrices: number[] = [];

    this.newQuoter.services.forEach((service: { prices: number[] }) => { // Especificar el tipo de 'hotel'
      service.prices.forEach((price: number, index: number) => { // Especificar el tipo de 'price'
        if (totalPrices[index]) {
          totalPrices[index] += price; // Sumar al total existente
        } else {
          totalPrices[index] = price; // Inicializar el total
        }
      });
    });

    return totalPrices;
  }

    getTotalCosts(): number[] {
      const totalSum: number[] = [];
      const totalPricesHotels = this.getTotalPricesHotels();
      const totalPricesServices = this.getTotalPricesServices();
      // Determinar el mayor largo entre los dos arreglos
      const maxLength = Math.max(totalPricesHotels.length, totalPricesServices.length);

      // Recorrer ambos arreglos hasta el mayor largo
      for (let i = 0; i < maxLength; i++) {
        const precioHotel = totalPricesHotels[i] || 0; // Si no existe valor, toma 0
        const precioServicio = totalPricesServices[i] || 0; // Si no existe valor, toma 0
        totalSum[i] = precioHotel + precioServicio;
      }

      return totalSum;
    }

    getExternalTaxes(): number[] {
      const totalExternal: number[]=[];
      const totalCost = this.getTotalCosts();
      const maxLength = totalCost.length;
      for (let i = 0; i < maxLength; i++) {
        const temp = totalCost[i] || 0; // Si no existe valor, toma 0
        totalExternal[i] = temp * 0.15;
      }
      return totalExternal
    }

    getTotalCostExternal(): number[] {
      const totalCostExternal: number[]=[]
      const totalCost = this.getTotalCosts();
      const totalExternal = this.getExternalTaxes();
      const maxLength = totalCost.length;
      for (let i = 0; i < maxLength; i++) {
        const temp1 = totalCost[i] || 0;
        const temp2 = totalExternal[i] || 0;// Si no existe valor, toma 0
        totalCostExternal[i] = temp1 + temp2;
      }

      return totalCostExternal
    }



}
