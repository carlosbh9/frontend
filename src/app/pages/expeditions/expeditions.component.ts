import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpeditionsService } from '../../Services/expeditions.service';

import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-expeditions',
  standalone: true,
  imports: [CommonModule,FormsModule ,HasRoleDirective],
  templateUrl: './expeditions.component.html',
  styleUrl: './expeditions.component.css'
})
export class ExpeditionsComponent implements OnInit{
  expeditions: any[] = [];
  filteredExpeditions: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal= false;
  filterYear : string = '2025'

  newExpedition: any = {
    name: '',
    price_pp: 0,
    remarks: '',
    year:''
  };

  selectedExpedition: any = {
    name: '',
    price_pp: 0,
    remarks: '',
    year:''
  };

  constructor(private expeditionService: ExpeditionsService) { }

  ngOnInit(): void {
    this.fetchExpeditions();
  }

  async fetchExpeditions() {
    try {
      this.expeditions= await this.expeditionService.getAllExpeditions();
      this.filteredExpeditions = this.expeditions;
      console.log(this.expeditions)
    } catch (error) {
      console.error('Error fetching expeditions', error);
    }
  }


  filterExpedition() {
    this.filteredExpeditions = this.expeditions.filter(expedition =>
      expedition.name.toLowerCase().includes(this.filterText.toLowerCase()) && (this.filterYear ? expedition.year === this.filterYear : true)
    );
  }

  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterExpedition();
    
  }

  confirmDelete(id: string) {
    toast('Are you sure you want to delete this record?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
        await this.deleteExpedition(id);
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
  async deleteExpedition(id: string) {
    try {
      await this.expeditionService.deleteExpedition(id);
      toast.success('Record deleted');
      this.fetchExpeditions();
    } catch (error) {
      console.error('Error deleting expedition', error);
      toast.error('Error deleting expedition');
    }
  }

  openEditModal(expedition: any) {
    this.selectedExpedition = { ...expedition }; // Clona la entrada seleccionada
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchExpeditions();
  }

  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
   this.emptyExpedition();
  }

  emptyExpedition(): void {
    this.newExpedition = {
      name: '',
      price_pp: 0,
      remarks: '',
      year:''
    };
  }
  onSubmit() {
    this.expeditionService.addExpedition(this.newExpedition).then(
      response => {
        console.log('Expedition added', response);
        toast.success('Your work has been saved');
        this.fetchExpeditions();
        this.showAddModal= false;
        this.emptyExpedition();
      },
      error => {
        console.error('Error adding expedition', error);
        toast.error('Error adding expedition');

      }
    );
  }

  onEditSubmit() {
    this.expeditionService.updateExpedition(this.selectedExpedition._id, this.selectedExpedition).then(
      response => {
        console.log('Expedition updated', response);
        toast.success('Expedition updated');
        this.fetchExpeditions();
        
        this.showEditModal = false; // Cierra el modal después de enviar el formulario
      },
      error => {
        console.error('Error updating expedition', error);
        toast.error('Error updating expedition');
      }
    );
  }
}
