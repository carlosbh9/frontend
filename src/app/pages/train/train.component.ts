import { Component, OnInit } from '@angular/core';
import { TrainService } from '../../Services/train.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';
import { toast } from 'ngx-sonner';


@Component({
  selector: 'app-train',
  standalone: true,
  imports: [CommonModule,FormsModule, HasRoleDirective],
  templateUrl: './train.component.html',
  styleUrl: './train.component.css'
})
export class TrainComponent implements OnInit {

  constructor(private trainService: TrainService,private cdr: ChangeDetectorRef,private router: Router) {}
  trains: any[] = [];
  filteredTrains: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;
  filterYear : string = '2025'
 newTrain: any = {
   company: '',
   services: [{
     serviceName: '',
     prices: [{
       season: 'Regular',
       adultPrice: 0,
       childPrice: 0,
       guidePrice: 0
     }],
     observations: '',
     year:''
   }]
 };

 selectedTrain: any = {
   company: '',
   services: [{
     serviceName: '',
     prices: [{
       season: 'Regular',
       adultPrice: 0,
       childPrice: 0,
       guidePrice: 0
     }],
     observations: '',
     year:''
   }]
 };


 ngOnInit(): void {
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
    this.filteredTrains = this.trains.filter(train =>
      train.company.toLowerCase().includes(this.filterText.toLowerCase()) && (this.filterYear ? train.year === this.filterYear : true)
    );
  }

  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterTrains();
  }

  openEditModal(train: any) {
    this.selectedTrain = { ...train };
    this.showEditModal = true;
    this.cdr.detectChanges();
    console.log(this.selectedTrain);

  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchTrains();
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
      company: '',
      services: [{
        serviceName: '',
        prices: {
          season: 'Regular',
          adultPrice: 0,
          childPrice: 0,
          guidePrice: 0
        },
        observations: '',
        year:''
      }]
    };
  }

  async onSubmit() {
    try {
      await this.trainService.addTrain(this.newTrain);
      this.fetchTrains();
      this.showAddModal = false;
       console.log('Tren añadido',this.newTrain);
       toast.success('Train created successfully')
      this.emptyTrain();
    } catch (error) {
      console.error('Error al añadir el tren', error);
      toast.error('Error creating Train')
    }
  }

  onEditSubmit() {
    this.trainService.updateTrain(this.selectedTrain._id, this.selectedTrain).then(
      response => {
        console.log('Tren actualizado', response);
        toast.success('Train updated successfully');
        this.fetchTrains();
        this.showEditModal = false;
      },
      error => {
        console.error('Error al actualizar el tren', error);
        toast.error('Error updating Train:');

      }
    );
  }


  confirmDelete(id: string) {
    toast('Are you sure you want to delete this record?', {
     
      action: {
        label: 'Confirm',
        onClick: async () => {
        await this.deleteTrain(id);
        }
      },
      cancel: {
        label:'Cancel',
        onClick: () => {
          toast.info('Delete cancelled');
        },
      },
      position: 'top-center',
   
    });
  }
  async deleteTrain(id: string) {
    try {
      await this.trainService.deleteTrain(id);
      toast.success('Train deleted successfully')
      this.fetchTrains();
    } catch (error) {
      console.error('Error al eliminar el tren', error);
      toast.error('Error deleting Train:');

    }
  }


  viewServices(operator: any) {
    this.router.navigate([`dashboard/services-train`, operator._id]);
  }
}
