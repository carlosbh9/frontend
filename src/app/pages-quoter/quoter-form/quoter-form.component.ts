import { CommonModule } from '@angular/common';
import { Component, OnInit,inject,signal } from '@angular/core';
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
import { ServicesComponent } from '../services/services.component';
import { HotelsComponent } from '../hotels/hotels.component';
import { MasterQuoterModalComponent } from '../modals/master-quoter.modal/master-quoter.modal.component';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule
    ,FormsModule,FormHotelComponent,FormEntrancesComponent,
    FormExpeditionsComponent,FormGuidesComponent,FormRestaurantsComponent,
    FormOperatorsComponent,FlightsComponent,ExtOperatorComponent,ServicesComponent,HotelsComponent,MasterQuoterModalComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements OnInit{
  quoterService = inject(QuoterService)
  route = inject(ActivatedRoute)
  modalOpen = signal(false);
  modalData = signal<any[]>([])
  totalPriceHotels: number[] = [];
  totalPriceServices: number[] = [];
  totalPricesFlights: number[]=[]
  totalPricesOperators: any[]=[]
  showUpdate = false
  idQuoter: string = ''
  previousDateService=''
  selectedDate: string ='';
  selectedCity: string = '';
  selectedDateService: string ='';
  selectedCityService: string = '';
  cont = 0
  contDayServices  = 0

  destinations: string[] =['PERU','BOLIVIA','ECUADOR','COLOMBIA','ARGENTINA','CHILE']

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
    flights:[],
    operators:[],
    total_prices:{
      total_hoteles: [], // Array vacío de números
      total_services: [], // Array vacío de números
      total_ext_operator: [], // Array vacío de números
      total_ext_cruises: [], // Array vacío de números
      total_flights: [], // Array vacío de números
      subtotal: [], // Array vacío de números
      cost_transfers: [], // Array vacío de números
      final_cost: [], // Array vacío de números
      price_pp: [] // Array vacío de números
    }
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
    flights: [],
    operators:[],
    total_prices:{
      total_hoteles: [], // Array vacío de números
      total_services: [], // Array vacío de números
      total_ext_operator: [], // Array vacío de números
      total_ext_cruises: [], // Array vacío de números
      total_flights: [], // Array vacío de números
      subtotal: [], // Array vacío de números
      cost_transfers: [], // Array vacío de números
      final_cost: [], // Array vacío de números
      price_pp: [] // Array vacío de números
    }
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
      console.log('se actualizo hoteles?',this.newQuoter.hotels)
    }
    if(this.newQuoter.services.length!=0){
      this.updatePricesSizeServices(this.newQuoter.services,this.newQuoter.number_paxs.length+1)

    }
    if(this.newQuoter.flights.length!=0){
      this.updatePricesSizeFlights(this.newQuoter.flights,this.newQuoter.number_paxs.length+1)
      console.log('comporando flights con 0',this.newQuoter.flights)
    }
    if(this.newQuoter.operators.length!=0){
      this.updatePricesSizeOperators(this.newQuoter.operators,this.newQuoter.number_paxs.length+1)
      console.log('comporando operadores con 0',this.newQuoter.operators)
    }
    this.newQuoter.number_paxs.push(0);
      // Agrega un nuevo input
  
      console.log('se cargo?',this.newQuoter)  }
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

  updatePricesSizeFlights(flights: any[], newSize: number): any[] {
    return flights.map(flight => {
      const currentSize = flight.prices.length;
     if (currentSize < newSize) {
      flight.prices = [...flight.prices, ...new Array(newSize - currentSize).fill(0)];
      }
      return flight;
    });
  }

  updatePricesSizeOperators(operators: any[], newSize: number): any[] {
    return operators.map(operator => {
      const currentSize = operator.prices.length;
     if (currentSize < newSize) {
      operator.prices = [...operator.prices, ...new Array(newSize - currentSize).fill(0)];
      }
      return operator;
    });
  }

  // onModalmqQuoterChange(temp: any){
    
  //   this.newQuoter.services.push(...temp)
  // }

  onFlightsUpdate(flights: any[]) {
   // this.datosrecibidosFlights = flights;
    this.newQuoter.flights=flights

  }

  onServicesUpdate(services: any[]) {
    // this.datosrecibidosFlights = flights;
     this.newQuoter.services=services

   }

   onOperatorsUpdate(operators: any[]) {
    // this.datosrecibidosFlights = flights;
     this.newQuoter.operators=operators
   
   }

   onHotelsUpdate(hotels: any[]){
    this.newQuoter.hotels=hotels
   
    
   }

  onTotalPricesFligtsChange(prices: number[]) {
   // this.totalPricesFlights = prices; // Actualizar el arreglo de precios totales
    this.newQuoter.total_prices.total_flights= prices
 //   this.updateTotalPrices() 
    
  }
  onTotalPricesServicesChange(prices: number[]) {
  //  this.totalPriceServices = prices; // Actualizar el arreglo de precios totales
    this.newQuoter.total_prices.total_services= prices
  //  this.updateTotalPrices() 
  }
  onTotalPricesHotelsChange(prices: number[]) {
   // this.totalPriceHotels = prices; // Actualizar el arreglo de precios totales
    this.newQuoter.total_prices.total_hoteles= prices
  //  this.updateTotalPrices() 
  }

  onTotalPricesOperatorsChange(prices: any[]){
    //this.totalPricesOperators = prices; // Actualizar el arreglo de precios totales
    this.newQuoter.total_prices.total_ext_operator = prices
   // this.updateTotalPrices() 

  
  }

  onSubmitHotel(){
    if(this.datosrecibidosHotel!){
          this.newQuoter.hotels.push(this.datosrecibidosHotel)
    }
    this.datosrecibidosHotel = null
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


    getTotalCosts(): number[] {
      const totalSum: number[] = [];
    //  const totalPricesHotels = this.totalPriceHotels;
      const totalPricesHotels = this.newQuoter.total_prices.total_hoteles
      //const totalPricesServices = this.totalPriceServices;
      const totalPricesServices = this.newQuoter.total_prices.total_services;
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

    updateTotalPrices() {
      // Actualizar los cálculos
      const totalCosts = this.getTotalCosts();
      const externalTaxes = this.getExternalTaxes();
      const totalCostsWithExternal = this.getTotalCostExternal();
    
      console.log('Total Costs:', totalCosts);
      console.log('External Taxes:', externalTaxes);
      console.log('Total Costs with External Taxes:', totalCostsWithExternal);
      
    
    }
    openModal() {
      this.modalOpen.set(true);
      this.modalData.set(this.newQuoter.number_paxs);
    }
  
    // Method to close modal
    closeModal() {
      this.modalOpen.set(false);
    }

    generatePDF() {
      const doc = new jsPDF();

    // Títulos
    doc.setFontSize(16);
    doc.text('Cotización de Viaje', 20, 20);
    doc.setFontSize(12);

    // Información General
    doc.text(`Invitado: ${this.newQuoter.guest}`, 20, 30);
    doc.text(`Código de Archivo: ${this.newQuoter.FileCode}`, 20, 40);
    doc.text(`Fecha de Viaje: ${this.newQuoter.travelDate.start} a ${this.newQuoter.travelDate.end}`, 20, 50);
    doc.text(`Alojamiento: ${this.newQuoter.accomodations}`, 20, 60);
    doc.text(`Total de Noches: ${this.newQuoter.totalNights}`, 20, 70);
    doc.text(`Número de Pasajeros: ${this.newQuoter.number_paxs.join(', ')}`, 20, 80);
    doc.text(`Agente de Viaje: ${this.newQuoter.travel_agent}`, 20, 90);
    doc.text(`Tasa de Cambio: ${this.newQuoter.exchange_rate}`, 20, 100);

    // Servicios
    let y = 120; // Posición inicial para servicios
    doc.text('Servicios:', 20, y);
    y += 10;
    this.drawTable(doc, this.newQuoter.services, 'Servicios', y);
    y += this.newQuoter.services.length * 10 + 20; // Ajustar posición después de la tabla

    // Hoteles
    doc.text('Hoteles:', 20, y);
    y += 10;
    this.drawTable(doc, this.newQuoter.hotels, 'Hoteles', y);
    y += this.newQuoter.hotels.length * 10 + 20;

    // Vuelos
    doc.text('Vuelos:', 20, y);
    y += 10;
    this.drawTable(doc, this.newQuoter.flights, 'Vuelos', y);
    y += this.newQuoter.flights.length * 10 + 20;

    // Operadores
    doc.text('Operadores:', 20, y);
    y += 10;
    this.drawTable(doc, this.newQuoter.operators, 'Operadores', y);

    // Guardar el PDF
    doc.save('cotizacion_viaje.pdf');
  }

  drawTable(doc: jsPDF, data: any[], title: string, startY: number) {
    const columnHeaders = {
      'Servicios': ['Día', 'Fecha', 'Nombre del Servicio', 'Precio Base'],
      'Hoteles': ['Nombre del Hotel', 'Precio Base'],
      'Vuelos': ['Ruta', 'Precio'],
      'Operadores': ['Nombre del Operador', 'País']
    };

    const headers = columnHeaders[title as keyof typeof columnHeaders];

    // Dibuja encabezados
    const headerY = startY;
    doc.setFontSize(10);
    headers.forEach((header, index) => {
      doc.text(header, 20 + index * 50, headerY);
    });

    // Dibuja líneas para la tabla
    doc.line(20, headerY + 2, 180, headerY + 2); // Línea bajo los encabezados

    // Dibuja filas
    data.forEach((item, index) => {
      const y = headerY + (index + 1) * 10 + 5; // Espacio entre filas
      if (title === 'Servicios') {
        doc.text(String(item.day), 20, y);
        doc.text(item.date, 70, y);
        doc.text(item.services[0].name_service, 120, y); // Asumiendo un solo servicio por día
        doc.text(String(item.services[0].price_base), 180, y);
      } else if (title === 'Hoteles') {
        doc.text(item.name_hotel, 20, y);
        doc.text(String(item.price_base), 180, y);
      } else if (title === 'Vuelos') {
        doc.text(item.route, 20, y);
        doc.text(String(item.price_conf), 180, y);
      } else if (title === 'Operadores') {
        doc.text(item.name_operator, 20, y);
        doc.text(item.country, 180, y);
      }
      // Línea de separación entre filas
      doc.line(20, y + 2, 180, y + 2);
    });
  }
    
}
