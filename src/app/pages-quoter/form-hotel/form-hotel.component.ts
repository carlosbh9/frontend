import { Component, EventEmitter, OnInit, Input ,inject,input, output, model} from '@angular/core';
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
  priceLength = input.required<Number>();
  selectedDate = input.required<string>();
  selectedCity =  input.required<string>();

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

  addPrices(){
    this.quoterItem.price_prueba.push(this.quoterItem.price.price)
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
