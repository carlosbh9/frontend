import { CommonModule } from '@angular/common';
import { Component , Output , EventEmitter, inject, OnInit,input, Input, signal,ViewChild,ElementRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../Services/hotel.service';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css'
})
export class HotelsComponent implements OnInit{
  hotelService = inject(HotelService)
  @Output() hotelsChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  priceLength = input.required<number>();
  @Input() hotels: any[]= []
 // hotels: any[]= []
  hotelsOption: any[]= []
  originalItem: any = {};
  selectedHotel: string = '';
  selectedService: string = '';
  addedPricesCount: number = 0
  selectedRoomType: string = '';
  hotelServices: any[] = [];
  roomTypes: any[] = [];
  contHotel = 0 ;
  selectedPrice: number =0
  previousDateHotel: string = '';
  newHotel: any ={
    day:'',
    city:'',
    date:'',
    name_hotel:'',
    price_base:0,
    prices:[],
    accomodatios_category: '',
    notes:'',
    editHotel: false
  }

  emtyHotel(){
    this.newHotel ={
      day:'',
      date: this.newHotel.date || '',
      city:this.newHotel.city || '',
      name_hotel:'',
      price_base:0,
      prices:[],
      accomodatios_category: '',
      notes:'',
      editHotel: false
    }
  }
  async loadHotels() {
    try {
      this.hotelsOption = await this.hotelService.getAllHotels();
     // this.hotels = data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
    
  }

  ngOnInit(): void {
    this.loadHotels();
  }
    // Función para actualizar el tamaño del array price_prueba
    updatePricePruebaArray(length: number) {
      this.newHotel.prices = new Array(length).fill(0); // Inicializamos el array con valores predeterminados, por ejemplo, 0.
    }
    removePrice(index: number): void {
      // Eliminar el precio en el índice correspondiente
      this.newHotel.prices.splice(index, 1);
      this.addedPricesCount--;
    }
    addPrices(){
      if (this.addedPricesCount < this.priceLength()) {
       // Agregamos el precio actual al final del arreglo
       this.newHotel.prices[this.addedPricesCount] = this.selectedPrice;
       this.addedPricesCount++; // Incrementamos el contador
     } else {
       // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
       console.log("No se pueden agregar más precios, el arreglo está lleno.");
     }
     }

  onHotelChange(event: any): void {
      const selectedHotel = this.hotelsOption.find(hotel => hotel._id === this.selectedHotel)
      if(selectedHotel){
        this.hotelServices= selectedHotel.services
        this.newHotel.name_hotel= selectedHotel.name
      }
      
  }

  onServiceChange(event: any): void {
    const selectedService = this.hotelServices.find(service => service._id === this.selectedService);
  
      if (selectedService) {
        this.roomTypes = selectedService.roomPrices;
        this.newHotel.accomodatios_category= selectedService.name_service
        
      }
    
    this.addedPricesCount=0
    }
  

  onSubmitHotel(){
    this.newHotel.price_base = this.newHotel.prices[0]
    this.newHotel.day= this.contHotel
    this.hotels.push(this.newHotel);
    console.log('prbandoddd',this.hotels);
   
    this.emitHotels();
    this.emtyHotel();
  }

  onEdit(item: any, index: number) {
    this.originalItem[index] = { ...item };
    item.editHotel = true;
    console.log('editando item', item, index);
    this.emitHotels(); 
  
  }
  onClose(item: any, index: number){
      // Revertir el item al estado original
      this.hotels[index] = { ...this.originalItem[index] };
      item.editHotel = false;
      this.emitHotels(); 
  }
  onSave(item: any){
    item.editHotel= false
    this.originalItem = {};
    this.emitHotels(); 
  }
  onDelete(index: number){
    this.hotels.splice(index, 1); 
    this.emitHotels(); 
  }
  
  private emitHotels() {
    this.hotelsChange.emit(this.hotels);
    this.totalPricesChange.emit(this.getTotalPricesHotels())
  }

  getTotalPricesHotels(): number[] {
    const totalPrices: number[] = [];
    this.hotels.forEach((hotel: { prices: number[] }) => { // Especificar el tipo de 'hotel'
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

  onChangeDate(event: any){
    let lastObject = 0
    if(this.hotels.length < 0){
       lastObject = this.hotels[this.hotels.length - 1].day || 0;
    }


    if (this.newHotel.date !== this.previousDateHotel) {
 
      this.contHotel= lastObject+1
  //    this.contHotel++; // Incrementa el día solo si la fecha cambia
      this.previousDateHotel = this.newHotel.date; 
  }
}

moveFlightUp(index: number) {
  if (index > 0) {
    // Intercambiar la fila actual con la anterior
    const temp = this.hotels[index];
    this.hotels[index] = this.hotels[index - 1];
    this.hotels[index - 1] = temp;
  }
}

moveFlightDown(index: number) {
  if (index < this.hotels.length - 1) {
    // Intercambiar la fila actual con la siguiente
    const temp = this.hotels[index];
    this.hotels[index] = this.hotels[index + 1];
    this.hotels[index + 1] = temp;
  }
}

@ViewChild('childTable', { static: true }) childTable!: ElementRef;
hideColumns = false;
// getTableContainer(): ElementRef {
//   return this.tableContainer;
// }

toggleColumnVisibility(hide: boolean) {
  this.hideColumns = hide;
}
}
