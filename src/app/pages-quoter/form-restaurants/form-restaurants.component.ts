import { Component ,output, input,inject} from '@angular/core';
import { RestaurantService } from '../../Services/restaurant.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-restaurants',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-restaurants.component.html',
  styleUrl: './form-restaurants.component.css'
})
export class FormRestaurantsComponent {

  restaurantService = inject(RestaurantService)
  serviceItem = output<any>()
  selectedCity = input<string>();
  selectedDate = input<string>();
  priceLength = input.required<number>();
  addedPricesCount: number = 0

  selectedService: any = {};
  restaurants: any[]=[]
  restaurant: any = {
    prices:[]
  }
  notes: string = ''

  async loadRestaurants (){
    try{
      this.restaurants = await this.restaurantService.getAllRestaurants();
    }catch{
      console.error('Error fetching expeditions');
    }
  }

  ngOnInit(): void {
    this.loadRestaurants();
  }
  addPrices(){
 
    if (this.addedPricesCount < this.priceLength()) {
     // Agregamos el precio actual al final del arreglo
     this.restaurant.prices[this.addedPricesCount] = this.restaurant.price_pp;
     this.addedPricesCount++; // Incrementamos el contador
   } else {
     // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
     console.log("No se pueden agregar más precios, el arreglo está lleno.");
   }
 
   }

  onServiceChange(event: any) {
    const selectedService = this.restaurants.find(service => service._id === this.selectedService);

    if(selectedService){

    }
      this.restaurant.name_service=selectedService.name
       this.restaurant.price_pp=selectedService.price_pp
  
      this.restaurant.notes=this.notes
      this.restaurant.date=this.selectedDate()
      this.restaurant.city=this.selectedCity()
      this.serviceItem.emit(this.restaurant)
     
    }

    Services(event: any){
    //this.restaurant.prices= new Array(this.priceLength()).fill(0);
    //this.addedPricesCount=0
    this.notes = ''
    }
}

