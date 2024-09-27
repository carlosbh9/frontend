import { Component, OnInit, Input ,inject,input, output, OnChanges} from '@angular/core';
import { HotelService } from '../../Services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { NonNullAssert } from '@angular/compiler';

@Component({
  selector: 'app-form-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-hotel.component.html',
  styleUrl: './form-hotel.component.css'
})
export class FormHotelComponent implements OnInit { 
  hotelService = inject(HotelService)
  hotelItem = output<any>();
  priceLength = input.required<number>();
  selectedDate = input.required<string>();
  selectedCity =  input.required<string>();
  addedPricesCount: number = 0
  selectedHotel: string = '';
  selectedService: string = '';

  selectedRoomType: string = '';
  hotels: any[] = [];
  hotelServices: any[] = [];
  roomTypes: any[] = [];
  
  selectedItem: any[]=[]
  selectedRoomTypePrices: any[]=[];
  selectedPrices: any[] = [];

  quoterItem: any = {
    day:'',
    city:'',
    date:'',
    name_hotel:'',
    accomodatios_category: '',
    price_prueba: [],
    price: {
      type:'',
      price:0
    },
    notes:''
  }; 
  
 
  
  async loadHotels() {
    try {
      this.hotels = await this.hotelService.getAllHotels();
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
    this.quoterItem.price_prueba = new Array(length).fill(0); // Inicializamos el array con valores predeterminados, por ejemplo, 0.
  }

  addPrices(){
    
   //this.quoterItem.price_prueba.splice(this.quoterItem.price.price)
   if (this.addedPricesCount < this.priceLength()) {
    // Agregamos el precio actual al final del arreglo
    this.quoterItem.price_prueba[this.addedPricesCount] = this.quoterItem.price.price;
    this.addedPricesCount++; // Incrementamos el contador
  } else {
    // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
    console.log("No se pueden agregar más precios, el arreglo está lleno.");
  }

  }
  onHotelChange(event: any): void {
      const selectedHotel = this.hotels.find(hotel => hotel._id === this.selectedHotel)
      if(selectedHotel){
        this.hotelServices= selectedHotel.services
      }
      this.quoterItem.name_hotel= selectedHotel.name
      //this.quoterItem.city=selectedHotel.location
      this.quoterItem.city=this.selectedCity()
      this.quoterItem.date=this.selectedDate()
      this.addedPricesCount=0
      this.quoterItem.price_prueba = new Array(this.priceLength()).fill(0);
 


  }

  onServiceChange(event: any): void {
  const selectedService = this.hotelServices.find(service => service._id === this.selectedService);

    if (selectedService) {
      this.roomTypes = selectedService.roomPrices;
      
    }
  
  this.quoterItem.accomodatios_category= selectedService.name_service
  }

onRoomTypeChange(event: any) {
   this.hotelItem.emit(this.quoterItem);
}
}
