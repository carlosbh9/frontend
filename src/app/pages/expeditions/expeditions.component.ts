import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpeditionsService } from '../../Services/expeditions.service';

@Component({
  selector: 'app-expeditions',
  standalone: true,
  imports: [CommonModule,FormsModule ],
  templateUrl: './expeditions.component.html',
  styleUrl: './expeditions.component.css'
})
export class ExpeditionsComponent implements OnInit{
  expeditions: any[] = [];
  filteredExpeditions: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal= false;

  newExpedition: any = {
    name: '',
    price_pp: 0,
    remarks: '',
  };

  selectedExpedition: any = {
    name: '',
    price_pp: 0,
    remarks: '',
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
      expedition.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  async deleteExpedition(id: string) {
    try {
      await this.expeditionService.deleteExpedition(id);
      this.fetchExpeditions();
    } catch (error) {
      console.error('Error deleting expedition', error);
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
    };
  }
  onSubmit() {
    this.expeditionService.addExpedition(this.newExpedition).then(
      response => {
        console.log('Expedition added', response);
        this.fetchExpeditions();
        this.showAddModal= false;
        this.emptyExpedition();
      },
      error => {
        console.error('Error adding expedition', error);
      }
    );
  }

  onEditSubmit() {
    this.expeditionService.updateExpedition(this.selectedExpedition._id, this.selectedExpedition).then(
      response => {
        console.log('Expedition updated', response);
        this.fetchExpeditions();
        
        this.showEditModal = false; // Cierra el modal después de enviar el formulario
      },
      error => {
        console.error('Error updating expedition', error);
      }
    );
  }
}
