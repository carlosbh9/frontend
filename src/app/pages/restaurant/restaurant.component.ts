import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../Services/restaurant.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent implements OnInit{

 restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;
  filterYear : string = '2024'

  newRestaurant: any = {
    name: '',
    price_pp: 0,
    child_rate: [{ price_pp: 0, upTo: null }],
    price_guide_pp: 0,
    special_dates: [{ date: null, price_add: null }],
    closing_date: [{ date: null, price_add: null }],
    schedules: '',
    location: '',
    take_notes: '',
    nearby_places: '',
    politica_canc: '',
    contac_phone: '',
    observaciones: '',
    year:''
  };

  selectedRestaurant: any = {
    name: '',
    price_pp: null,
    child_rate: [{ price_pp: 0, upTo: null }],
    price_guide_pp: 0,
    special_dates: [{ date: null, price_add: null }],
    closing_date: [{ date: null, price_add: null }],
    schedules: '',
    location: '',
    take_notes: '',
    nearby_places: '',
    politica_canc: '',
    contac_phone: '',
    observaciones: '',
    year:''
  };

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  async fetchRestaurants() {
    try {
      this.restaurants = await this.restaurantService.getAllRestaurants();
      this.filteredRestaurants = this.restaurants;
      console.log(this.restaurants)
    } catch (error) {
      console.error('Error fetching restaurants', error);
    }
  }

  filterRestaurant() {
    this.filteredRestaurants = this.restaurants.filter(restaurant =>(
      restaurant.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(this.filterText.toLowerCase())) && (this.filterYear ? restaurant.year === this.filterYear : true)
    );
  }

  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterRestaurant();
    
  }

  async deleteRestaurant(id: string) {
    try {
      await this.restaurantService.deleteRestaurant(id);
      this.fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant', error);
    }
  }

  addSpecialdateField() {
    this.newRestaurant.special_dates.push({ date: null, price_add: null });
  }
  // Función para agregar un nuevo campo de Special date en el formulario de editar restaurant
  addEditSpecialDateField() {
    this.selectedRestaurant.special_dates.push({ date: null, price_add: null });

  }
  removeSpecialdateField(index: number) {
    if (this.newRestaurant.special_dates.length >= 1) { // Prevent removing the only special date
      this.newRestaurant.special_dates.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }

  }

 
  removeEditSpecialdateField(index: number) {
    if (this.selectedRestaurant.special_dates.length >= 1) { // Prevent removing the only special date
      this.selectedRestaurant.special_dates.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }
  
  }



  addClosingdateField() {
    this.newRestaurant.closing_date.push({ date: null, price_add: null });
  }
  // Función para agregar un nuevo campo de closing date en el formulario de editar restaurant
  addEditClosingDateField() {
    this.selectedRestaurant.closing_date.push({ date: null, price_add: null });
  }
  removeClosingdateField(index: number) {
    if (this.newRestaurant.closing_date.length >= 1) { // Prevent removing the only special date
      this.newRestaurant.closing_date.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }

  }

  removeEditClosingdateField(index: number) {
    if (this.selectedRestaurant.closing_date.length >= 1) { // Prevent removing the only special date
      this.selectedRestaurant.closing_date.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }

  }

  openEditModal(restaurant: any) {
    this.selectedRestaurant = { ...restaurant };
    this.showEditModal = true;
    console.log(this.selectedRestaurant)
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.emptyRestaurant();
  }

  emptyRestaurant(): void {
    this.newRestaurant = {
      name: '',
      price_pp: null,
      child_rate: [{ price_pp: 0, upTo: null }],
      price_guide_pp: 0,
      special_dates: [{ date: null, price_add: null }],
      closing_date: [{ date: null, price_add: null }],
      schedules: '',
      location: '',
      take_notes: '',
      nearby_places: '',
      politica_canc: '',
      contac_phone: '',
      observaciones: '',
      year:''
    };
  }

  onSubmit() {
    this.restaurantService.addRestaurant(this.newRestaurant).then(
      response => {
        console.log('Restaurant added', response);
        this.fetchRestaurants();
        this.showAddModal = false;
        this.emptyRestaurant();
        console.log(this.newRestaurant)
      },
      error => {
        console.error('Error adding restaurant', error);
      }
    );
  }

  onEditSubmit() {
    this.restaurantService.updateRestaurant(this.selectedRestaurant._id, this.selectedRestaurant).then(
      response => {
        console.log('Restaurant updated', response);
        this.fetchRestaurants();
        this.showEditModal = false;
        console.log(this.selectedRestaurant)
      },
      error => {
        console.error('Error updating restaurant', error);
      }
    );
  }
}
