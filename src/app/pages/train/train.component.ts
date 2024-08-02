import { Component } from '@angular/core';
import { TrainService } from '../../Services/train.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-train',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './train.component.html',
  styleUrl: './train.component.css'
})
export class TrainComponent {

  constructor(private trainService: TrainService,private cdr: ChangeDetectorRef,private router: Router) {}
  trains: any[] = [];
  filteredTrains: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;

 newTrain: any = {
   company: '',
   services: [{
     serviceName: '',
     prices: [{
       season: 'Regular',
       adultPrice: 0,
       childPrice: 0
     }],
     observations: ''
   }]
 };

 selectedTrain: any = {
   company: '',
   services: [{
     serviceName: '',
     prices: [{
       season: 'Regular',
       adultPrice: 0,
       childPrice: 0
     }],
     observations: ''
   }]
 };


 ngOnInit() {
    this.fetchTrains();
  }

  async fetchTrains() {
    try {
      this.trains = await this.trainService.getAllTrains();
      this.filteredTrains = this.trains;
    } catch (error) {
      console.error('Error fetching guides', error);
    }
  }

  filterTrains() {
     this.filteredTrains =  this.trains.filter(train =>
      train.name_train.toLowerCase().includes(this.filterText.toLowerCase()) || train.type_train.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  async deleteTrain(id: string) {
    try {
      await this.trainService.deleteTrain(id);
      this.fetchTrains();
    } catch (error) {
      console.error('Error al eliminar el tren', error);
    }
  }

  openEditModal(train: any) {
    this.selectedTrain = { ...train };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.emptyTrain();
  }

  emptyTrain(): void {
    this.newTrain = {
      name_train: '',
      type_train: 'Regular',
      price_train: 0,
      observations: ''
    };
  }

  onSubmit() {
    this.trainService.addTrain(this.newTrain).then(
      response => {
        console.log('Tren añadido', response);
        this.fetchTrains();
        this.showAddModal = false;
        this.emptyTrain();
      },
      error => {
        console.error('Error al añadir el tren', error);
      }
    );
  }

  onEditSubmit() {
    this.trainService.updateTrain(this.selectedTrain._id, this.selectedTrain).then(
      response => {
        console.log('Tren actualizado', response);
        this.fetchTrains();
        this.showEditModal = false;
      },
      error => {
        console.error('Error al actualizar el tren', error);
      }
    );
  }



  async deleteGuide(id: string) {
    try {
      await this.trainService.deleteTrain(id);
      this.fetchTrains();
    } catch (error) {
      console.error('Error al eliminar el tren', error);
    }
  }

  viewServices(operator: any) {
    this.router.navigate([`/services`, operator._id]);
  }
}
