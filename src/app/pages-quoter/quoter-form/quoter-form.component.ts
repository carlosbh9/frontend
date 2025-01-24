import { CommonModule } from '@angular/common';
import { Component, OnInit,inject,signal ,HostListener, computed} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoterService } from '../../Services/quoter.service';
import { FlightsComponent } from '../flights/flights.component';
import { Quoter } from '../../interfaces/quoter.interface';
import {ActivatedRoute} from '@angular/router';
import { ExtOperatorComponent } from '../ext-operator/ext-operator.component';
import { ServicesComponent } from '../services/services.component';
import { HotelsComponent } from '../hotels/hotels.component';

import { CalculatepricesService } from '../../Services/controllerprices/calculateprices.service';
import { PdfexportService } from '../../Services/pdfexport/pdfexport.service';
import { ExportExcelService } from '../../Services/exportExcel/export-excel.service';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CrucerosComponent } from '../cruceros/cruceros.component';
import { ContactService } from '../../Services/contact/contact.service';
import { toast } from 'ngx-sonner';


(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  providers: [], 
  imports: [CommonModule
    ,FormsModule,FlightsComponent,ExtOperatorComponent,ServicesComponent,HotelsComponent,CrucerosComponent
   ],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements  OnInit{
  quoterService = inject(QuoterService)
  contactService = inject(ContactService)
  route = inject(ActivatedRoute)
  create = inject(CalculatepricesService)
  pdfExportService = inject(PdfexportService)
  excelService = inject(ExportExcelService)

  constructor() {}
 
  dataDefault: any;
  modalOpen = signal(false);
  modalData = signal<any[]>([])
  contacts : any[]=[]
  filteredOptions: any[] = [];  // Opciones filtradas
  showOptions: boolean = false;  // Controla la visibilidad de las opciones
  showVersion: boolean = false
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
  prueba5 = signal<number[]>([]);
  prueba6 = signal<number[]>([]);

  destinations: string[] =['PERU','BOLIVIA','ECUADOR','COLOMBIA','ARGENTINA','CHILE']

  newQuoter: Quoter = {
    name_version:'version 1',
    guest:'',
    destinations:[],
    children_ages: [0],
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
    cruises: [],
    total_prices:{
      total_hoteles: [], // Array vacío de números
      total_services: [], // Array vacío de números
      total_cost:[],
      external_utility:[0],
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
    name_version:'version 1',
    guest: '',
    destinations:[],
    children_ages: [],
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
    cruises: [],
    total_prices:{
      total_hoteles: [], // Array vacío de números
      total_services: [], // Array vacío de números
      total_cost:[],
      external_utility:[0],
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
    
    this.loadContacts();
    this.route.paramMap.subscribe(params => {
      
      const id = params.get('id');
      if(id) {
        this.getQuoterbyId(id);
        this.showUpdate= true;
        this.idQuoter=id;
       
    
    
      }else {
        
      }
      
    })
    
    this.create.getData().subscribe(
      (data) => {
        this.dataDefault = data;  // Aquí asignas los datos al objeto `dataDefault`
        console.log('Datos recibidos:', this.dataDefault);  // Muestra el JSON en la consola
        this.create.calculatePrice(this.dataDefault).then(
          (response) => {
            console.log('Precios calculados:', response);  // Muestra los precios calculados
          },
          (error) => {
            console.error('Error calculando precios:', error);
          }
        );
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
    
    //console.log('precios calculados',nuevo)

    //this.newQuoter.services.push(nuevo)
    this.datosrecibidosHotel = null
    this.datosrecibidosService = null


  }
  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
  
    // Asegurarse de que destinations esté inicializado como array
    if (!Array.isArray(this.newQuoter.destinations)) {
      this.newQuoter.destinations = [];
    }
  
    if (checkbox.checked) {
      this.newQuoter.destinations.push(value);
    } else {
      const index = this.newQuoter.destinations.indexOf(value);
      if (index > -1) {
        this.newQuoter.destinations.splice(index, 1);
      }
    }
  
  }
  onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const updatedValues = [...this.prueba6()]; // Copiar el array actual
    updatedValues[index] = parseFloat(input.value); // Actualizar el valor en el índice correspondiente
    this.prueba6.set(updatedValues); // Actualizar la señal
  }
  
async loadContacts() {
  try {
    this.contacts = await this.contactService.getAllContacts();
    this.filteredOptions = this.contacts;  
  } catch (error) {
    console.log('Error al cargar los Master Quoters', error);
  }
}
 // Filtrar opciones en Master Quoter
 filterOptions(): void {
  this.filteredOptions = this.contacts.filter(option =>
    option.name.toLowerCase().includes(this.newQuoter.guest.toLowerCase())
  );
}
// Seleccionar opción de Contacts
selectOption(option: any): void {
  this.newQuoter.guest= option.name// Filtrar días basados en la selección de Master Quoter
  this.showOptions= false
}


   async getQuoterbyId(Id: string): Promise<void>{
    try {
      this.newQuoter = await this.quoterService.getQuoterById(Id);
   
      console.log('quoter cargado',this.newQuoter) 
      toast.success('Quoter loaded successfully'
      );
      this.prueba.set(this.newQuoter.total_prices.total_hoteles)
      this.prueba2.set(this.newQuoter.total_prices.total_services)
      this.prueba3.set(this.newQuoter.total_prices.total_ext_operator)
      this.prueba4.set(this.newQuoter.total_prices.total_flights)
      this.prueba6.set(this.newQuoter.total_prices.external_utility)


    } catch (error) {
      console.error('Error get operator by iddd ');
      toast.error( 'Error get operator by ID');
    }
  }
  addNumberPaxs() {
    this.newQuoter.number_paxs.push(0);

    }
  addChildrenAges() {
    if (!this.newQuoter.children_ages) {
        this.newQuoter.children_ages = [];
    }
    this.newQuoter.children_ages.push(0);
  }
    removeChildrenAges(indexToRemove: number): void {
      if (Array.isArray(this.newQuoter.children_ages) && indexToRemove >= 0 && indexToRemove < this.newQuoter.children_ages.length) {
          this.newQuoter.children_ages.splice(indexToRemove, 1); 
      }
  }
    removeNumberPaxs(indexToRemove: number): void {
      // Eliminar del array `number_paxs`
    // const  indexToRemove =  this.newQuoter.number_paxs.length;
      if (indexToRemove >= 0 && indexToRemove < this.newQuoter.number_paxs.length) {
        this.newQuoter.number_paxs.splice(indexToRemove, 1);
    
        // Eliminar del atributo `prices` en los diferentes arreglos
        ['hotels',  'flights', 'operators', 'cruises'].forEach((category) => {
          (this.newQuoter as any)[category].forEach((item: any) => {
            if (Array.isArray(item.prices) && item.prices.length > indexToRemove) {
              item.prices.splice(indexToRemove, 1);
            }
          });
        });

        if (this.newQuoter.services) {
          this.newQuoter.services.forEach((day) => {
              if (day.services) {
                  day.services.forEach((service : any) => {
                      if (service.prices && service.prices[indexToRemove] !== undefined) {
                          service.prices.splice(indexToRemove, 1);
                      }
                  });
              }
          });
      }
        // Eliminar de los totales en `total_prices`
        Object.keys(this.newQuoter.total_prices).forEach((key) => {
          const totalArray = (this.newQuoter.total_prices as any)[key];
          if (Array.isArray(totalArray) && totalArray.length > indexToRemove) {
            totalArray.splice(indexToRemove, 1);
          }
        });
      // Asegúrate de que `total_prices.total_services` se actualice correctamente
      if (this.newQuoter.total_prices.total_services.length > indexToRemove) {
      this.newQuoter.total_prices.total_services.splice(indexToRemove, 1);
      }
      }

    }
   
    updatePricesSizeHotels(hotels: any[], newSize: number): any[] {
      return hotels.map(hotel => {
        if (!hotel.prices) {
          hotel.prices = []; // Asegurar que el campo prices exista
        }
        hotel.prices = hotel.prices.slice(0, newSize); // Ajustar el tamaño del array
        return hotel;
      });
    }
    
    updatePricesSizeServices(services: any[], newSize: number): any[] {
      return services.map(service => {
        if (!service.prices) {
          service.prices = []; // Asegurar que el campo prices exista
        }
        service.prices = service.prices.slice(0, newSize); // Ajustar el tamaño del array
        return service;
      });
    }
    
    updatePricesSizeFlights(flights: any[], newSize: number): any[] {
      return flights.map(flight => {
        if (!flight.prices) {
          flight.prices = []; // Asegurar que el campo prices exista
        }
        flight.prices = flight.prices.slice(0, newSize); // Ajustar el tamaño del array
        return flight;
      });
    }
    
    updatePricesSizeOperators(operators: any[], newSize: number): any[] {
      return operators.map(operator => {
        if (!operator.prices) {
          operator.prices = []; // Asegurar que el campo prices exista
        }
        operator.prices = operator.prices.slice(0, newSize); // Ajustar el tamaño del array
        return operator;
      });
    }
    removePriceFromTotalPrices(index: number) {
      if (this.newQuoter.total_prices.total_cost && index < this.newQuoter.total_prices.total_cost.length) {
        this.newQuoter.total_prices.total_cost.splice(index, 1);
      }
      if (this.newQuoter.total_prices.external_utility && index < this.newQuoter.total_prices.external_utility.length) {
        this.newQuoter.total_prices.external_utility.splice(index, 1);
      }
      if (this.newQuoter.total_prices.cost_external_taxes && index < this.newQuoter.total_prices.cost_external_taxes.length) {
        this.newQuoter.total_prices.cost_external_taxes.splice(index, 1);
      }
      if (this.newQuoter.total_prices.total_cost_external && index < this.newQuoter.total_prices.total_cost_external.length) {
        this.newQuoter.total_prices.total_cost_external.splice(index, 1);
      }
    }


  onCruiseUpdate(cruises: any[]) {
    // this.datosrecibidosFlights = flights;
     this.newQuoter.cruises=cruises
 
   }
   onTotalPricesCruiseChange(prices: number[]) {
     this.prueba5.set(prices)
      this.newQuoter.total_prices.total_ext_cruises= prices
    }

    
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
    this.create.createQuoter(this.newQuoter).subscribe({
      next: (response) => {
        console.log('Quoter added', response);
        toast.success('Quoter added');
        this.closeModalVersion(); 
      }
    });
  }
 async onUpdate(){
    // this.quoterService.updateQuoter(this.idQuoter,this.newQuoter).then(
    //   response => {
    //     console.log('Quoter update',response)
    //     this.newQuoter=this.emptyQuoter
    //   },
    //   error => {
    //     console.error('Error editing Quoter', error)
    //   }
    // )
    try {
      const response = await this.quoterService.updateQuoter(this.idQuoter, this.newQuoter);
      console.log('Quoter updated:', response);
      this.newQuoter = this.emptyQuoter;
      toast.success('Quoter updated');
    } catch (error) {
      console.error('Error editing Quoter:', error);
      toast.error('Error editing Quoter');
    }
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
      const external_utility = this.prueba6()
      const maxLength = Math.max(this.newQuoter.number_paxs.length);
      for (let i = 0; i < maxLength; i++) {
        const temp = totalCost[i] || 0; // Si no existe valor, toma 0
        const temp1 = external_utility[i] || 0
        totalExternal[i] = (temp+temp1) * 0.15;
      }
      this.newQuoter.total_prices.cost_external_taxes=totalExternal
      this.newQuoter.total_prices.external_utility=  this.prueba6()

      console.log('prueba 6', this.prueba6(), this.newQuoter.total_prices.external_utility)
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
    const prueba5Values = this.prueba5();
    const totalCostExternal = this.getTotalCostExternal();
    
    // Determinar la longitud máxima con las señales ya evaluadas
    const maxLength = Math.max(this.newQuoter.number_paxs.length);
   
    // Calcular los subtotales usando las señales evaluadas
    for (let i = 0; i < maxLength; i++) {
      const temp1 = totalCostExternal[i] || 0;
      const temp2 = prueba3Values[i] || 0;
      const temp3 = prueba4Values[i] || 0;
      const temp4 = prueba5Values[i] || 0;
      subtotal[i] = temp1 + temp2 + temp3+temp4;
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
      // Validar que temp2 sea mayor que 0 antes de dividir
    if (temp2 > 0) {
      price_pp[i] = temp1 / temp2;
    } else {
      price_pp[i] = 0; // Valor por defecto si no es posible dividir
    }
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
    openModalVersion() {
      this.showVersion = true;
      
    }
  
    // Method to close modal
    closeModalVersion() {
      this.showVersion = false
    }

    async generatePDF() {
      try {
      const dataURL = await this.pdfExportService.convertImageToDataURL('/images/image.png');
      const docDefinition = this.pdfExportService.generatePdf(this.newQuoter,dataURL);
      this.pdfExportService.exportPdf(docDefinition);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error al exportar el PDF:', error);
      toast.error('Error exporting PDF');
    }
    }   

    generateExcel() {
      try {
        // Validar si hay datos para exportar
        if (!this.newQuoter) {
          toast.warning('There is no data to export');
          return;
        }
        this.excelService.downloadQuotationAsExcel(this.newQuoter, `${this.newQuoter.guest}`);
        toast.success('Excel exported successfully');
      } catch (error) {
        console.error('Error exporting Excel:', error);
        toast.error('A problem occurred while exporting Excel');
      }
    }   
  // Detectar clics fuera del input y la lista de opciones
@HostListener('document:click', ['$event'])
onClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const inputElement = document.getElementById('searchInput'); // ID del input
  const dropdownElement = document.getElementById('optionsDropdown'); // ID del dropdown

  // Si el clic no es en el input o el dropdown, oculta las opciones
  if (inputElement && !inputElement.contains(target) && dropdownElement && !dropdownElement.contains(target)) {
    this.showOptions= false;
  }
}
  }
