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

  selectedService: any = {};
  restaurants: any[]=[]
  restaurant: any = {}
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

  onServiceChange(event: any) {
    const selectedService = this.restaurants.find(service => service._id === this.selectedService);
      this.restaurant.name_service=selectedService.name
       this.restaurant.price_pp=selectedService.price_pp
  
      this.restaurant.notes=this.notes
      this.restaurant.date=this.selectedDate()
      this.restaurant.city=this.selectedCity()
      this.serviceItem.emit(this.restaurant)
     
    }
}
