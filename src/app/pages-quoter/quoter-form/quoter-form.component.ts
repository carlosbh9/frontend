import { CommonModule } from '@angular/common';
import { Component, OnInit,inject,signal ,ViewChild, computed,QueryList,ViewChildren ,ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoterService } from '../../Services/quoter.service';
import { FlightsComponent } from '../flights/flights.component';
import { Quoter } from '../../interfaces/quoter.interface';
import {ActivatedRoute} from '@angular/router';
import { ExtOperatorComponent } from '../ext-operator/ext-operator.component';
import { ServicesComponent } from '../services/services.component';
import { HotelsComponent } from '../hotels/hotels.component';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfexportService } from '../../Services/pdfexport/pdfexport.service';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule
    ,FormsModule,FlightsComponent,ExtOperatorComponent,ServicesComponent,HotelsComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements  OnInit{
  quoterService = inject(QuoterService)
  route = inject(ActivatedRoute)
  pdfExportService = inject(PdfexportService)
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
 
  prueba = signal<number[]>([]);
  prueba2 = signal<number[]>([]);
  prueba3 = signal<number[]>([]);
  prueba4 = signal<number[]>([]);
  prueba5 = signal<number>(0);

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
      total_cost:[],
      external_utility:[],
      cost_external_taxes:[],
      total_cost_external:[],
      total_ext_operator: [], // Array vacío de números
      total_ext_cruises: [], // Array vacío de números
      total_flights: [], // Array vacío de números
      subtotal: [], // Array vacío de números
      cost_transfers: [], // Array vacío de números
      final_cost: [], // Array vacío de números
      price_pp: [], // Array vacío de números
      porcentajeTD:0
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
      total_cost:[],
      external_utility:[],
      cost_external_taxes:[],
      total_cost_external:[],
      total_ext_operator: [], // Array vacío de números
      total_ext_cruises: [], // Array vacío de números
      total_flights: [], // Array vacío de números
      subtotal: [], // Array vacío de números
      cost_transfers: [], // Array vacío de números
      final_cost: [], // Array vacío de números
      price_pp: [], // Array vacío de números
      porcentajeTD:0
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
        this.showUpdate= true;
        this.idQuoter=id;
    
      }
    })
    


    this.datosrecibidosHotel = null
    this.datosrecibidosService = null


  }
   async getQuoterbyId(Id: string): Promise<void>{
    try {
      this.newQuoter = await this.quoterService.getQuoterById(Id);
      
      console.log('quoter cargado',this.newQuoter)
      this.prueba.set(this.newQuoter.total_prices.total_hoteles)
      this.prueba2.set(this.newQuoter.total_prices.total_services)
      this.prueba3.set(this.newQuoter.total_prices.total_ext_operator)
      this.prueba4.set(this.newQuoter.total_prices.total_flights)


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
   onPorcentajeTDUpdate(porcentaje: number){
   
   // this.prueba5.set(porcentaje)
    this.newQuoter.total_prices.porcentajeTD= porcentaje
 }
   onPorcentajeTD(porcentaje: number){
 
     // this.prueba5.set(porcentaje)
      this.newQuoter.total_prices.porcentajeTD= porcentaje
   }

  onTotalPricesServicesChange(prices: number[]) {
  this.prueba2.set(prices)
    this.newQuoter.total_prices.total_services= prices

  }
  onTotalPricesHotelsChange(prices: number[]) {
  
   this.prueba.set(prices)
    this.newQuoter.total_prices.total_hoteles= prices
  }

  onTotalPricesOperatorsChange(prices: any[]){
    this.prueba3.set(prices)
    
    this.newQuoter.total_prices.total_ext_operator = prices
  }
  onTotalPricesFligtsChange(prices: number[]) {
    this.prueba4.set(prices)
  
     this.newQuoter.total_prices.total_flights= prices
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


  getTotalCosts = computed(() => { 
    const totalSum: number[] = [];
    const totalPricesHotels = this.prueba()
    //const totalPricesServices = this.totalPriceServices;
    const totalPricesServices = this.prueba2()
    // Determinar el mayor largo entre los dos arreglos
    const maxLength = Math.max(this.newQuoter.number_paxs.length);

    // Recorrer ambos arreglos hasta el mayor largo
    for (let i = 0; i < maxLength; i++) {
      const precioHotel = totalPricesHotels[i] || 0; // Si no existe valor, toma 0
      const precioServicio = totalPricesServices[i] || 0; // Si no existe valor, toma 0
      totalSum[i] = precioHotel + precioServicio;
    }
    this.newQuoter.total_prices.total_cost= totalSum
    return totalSum
  });

  getExternalTaxes = computed(() => {
    const totalExternal: number[]=[];
      const totalCost = this.getTotalCosts();
      const maxLength = Math.max(this.newQuoter.number_paxs.length);
      for (let i = 0; i < maxLength; i++) {
        const temp = totalCost[i] || 0; // Si no existe valor, toma 0
        totalExternal[i] = temp * 0.15;
      }
      this.newQuoter.total_prices.cost_external_taxes=totalExternal
      return totalExternal
  });

    getTotalCostExternal= computed(() => {
      const totalCostExternal: number[]=[]
      const totalCost = this.getTotalCosts();
      const totalExternal = this.getExternalTaxes();
      const maxLength = Math.max(this.newQuoter.number_paxs.length);
      for (let i = 0; i < maxLength; i++) {
        const temp1 = totalCost[i] || 0;
        const temp2 = totalExternal[i] || 0;// Si no existe valor, toma 0
        totalCostExternal[i] = temp1 + temp2;
      }
      this.newQuoter.total_prices.total_cost_external=totalCostExternal
      return totalCostExternal
    }
  )

  subTotal = computed(() => {
    
    const subtotal: number[] = [];
    
    // Forzar la evaluación de todas las señales para que sean dependencias
    const prueba3Values = this.prueba3();
    const prueba4Values = this.prueba4();
    const totalCostExternal = this.getTotalCostExternal();
    
    // Determinar la longitud máxima con las señales ya evaluadas
    const maxLength = Math.max(this.newQuoter.number_paxs.length);
   
    // Calcular los subtotales usando las señales evaluadas
    for (let i = 0; i < maxLength; i++) {
      const temp1 = totalCostExternal[i] || 0;
      const temp2 = prueba3Values[i] || 0;
      const temp3 = prueba4Values[i] || 0;
      subtotal[i] = temp1 + temp2 + temp3;
    }
    this.newQuoter.total_prices.subtotal = subtotal
  
    return subtotal;
  })

  costOfTransfers = computed(() => {
    const cost_transfers: number[]=[]
    const maxLength = Math.max(this.newQuoter.number_paxs.length);
    const subtotal = this.subTotal()

    for (let i = 0; i < maxLength; i++) {
      const temp1 = subtotal[i] || 0;
      cost_transfers[i] = temp1 *0.04 ;
    }
    this.newQuoter.total_prices.cost_transfers = cost_transfers
    return cost_transfers
  })
  final_cost = computed(() => {
    const final_cost: number[]=[]

    const subTotalValues = this.subTotal();
    const costOfTransfersValues = this.costOfTransfers();
    

    const maxLength = Math.max(this.newQuoter.number_paxs.length);
    for (let i = 0; i < maxLength; i++) {
       const temp1 = subTotalValues[i] || 0;
    const temp2 = costOfTransfersValues[i] || 0;
      final_cost[i] = temp1 +temp2;
    }
    this.newQuoter.total_prices.final_cost= final_cost
    return final_cost
  })
  price_per_person = computed(() => {
    const price_pp: number[]=[]
    const maxLength = Math.max(this.newQuoter.number_paxs.length);
    const finalCostValues = this.final_cost();
    for (let i = 0; i < maxLength; i++) {
      const temp1 = finalCostValues[i] || 0;
      const temp2 = this.newQuoter.number_paxs[i] || 0;
      price_pp[i] = temp1 /temp2;
    }
    this.newQuoter.total_prices.price_pp= price_pp
    return price_pp
  })

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

    async generatePDF() {
      const dataURL = await this.pdfExportService.convertImageToDataURL('/images/image.png');

      const docDefinition = this.pdfExportService.generatePdf(this.newQuoter,dataURL);
      this.pdfExportService.exportPdf(docDefinition);

    }
    @ViewChild(HotelsComponent) hotelsComponent!: HotelsComponent;
  
  //  async  generatePDF() {
  
  // // Ocultar la columna en el hijo
  // this.hotelsComponent.toggleColumnVisibility(true);

  // // Esperar para asegurar que el DOM se renderice completamente
  // await new Promise((resolve) => setTimeout(resolve, 200));

  // const pdf = new jsPDF();
  // const table = this.hotelsComponent.childTable.nativeElement;

  // // Generar el canvas
  // const canvas = await html2canvas(table, { scale: 1 });
  // const imgData = canvas.toDataURL('image/jpeg', 0.8);
  // pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);

  // // Restaurar visibilidad de la columna
  // this.hotelsComponent.toggleColumnVisibility(false);

  // // Guardar el PDF
  // pdf.save('tabla.pdf');
  //   }
}
