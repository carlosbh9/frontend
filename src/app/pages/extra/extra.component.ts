import { Component, inject,WritableSignal ,signal,Signal} from '@angular/core';
import { UiTableComponent } from '../sharecomponents/ui-table/ui-table.component';
import { EntrancesService } from '../../Services/entrances.service';
import { ExtrasService } from '../../Services/serviceTarifario/extras.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-extra',
  standalone: true,
  imports: [UiTableComponent,SweetAlert2Module,CommonModule,FormsModule],
  templateUrl: './extra.component.html',
  styleUrl: './extra.component.css'
})
export class ExtraComponent {
  extrasService = inject(ExtrasService)
  extras: any[] = [];
 filteredEntrances: any[] = [];
 showAddModal = false;
  showEditModal= false;
 columns = [
  { header: 'Name Service', field: 'name' },
  { header: 'Price per person or group price', field: 'price' },
  { header: 'Year', field: 'year' },
  { header: 'Notes', field: 'notes' },
];
actions = [
  { name: 'edit', label: 'Edit', class: 'bx bx-edit-alt text-blue-500' },
  { name: 'delete', label: 'Delete', class: 'bx bx-trash  text-red-500' }
]; // Configuración de botones
  data = signal<any[]>([])

  ngOnInit(): void {
    this.fetchExtras();
  }
  newExtra = {
    name:'',
    price: 0,
    priceperson: true,
    notes: '',
    year:''
  };
  selectedExtra = {
    _id: '',
    name:'',
    price: 0,
    priceperson: true,
    notes: '',
    year:''
  };
  async fetchExtras() {
    try {
      this.extras= await this.extrasService.getAllExtras();
      this.filteredEntrances = this.extras;
      this.data.set(this.extras)
      console.log('los datos cargados',this.extras)
    } catch (error) {
      console.error('Error fetching Extras', error);
    }
  }

  handleTableAction(event: { name: string; row: any }) {

    const { name, row } = event;
    switch(name){
      case 'edit': this.openEditModal(row); // Manejar la acción de edición
      break;
      case 'delete' : this.deleteEntrance(row._id); // Manejar la acción de eliminación
      break;
    }
  }
  onEditSubmit() {
    this.extrasService.updateExtra(this.selectedExtra._id, this.selectedExtra).then(
      response => {
        console.log('Extra updated', response);
    
        this.fetchExtras();
        this.showEditModal = false; // Cierra el modal después de enviar el formulario
      },
      error => {
        console.error('Error updating extra', error);
      }
    );
  }
  onSubmit() {
    console.log('Extra ', this.newExtra);

    this.extrasService.createExtra(this.newExtra).then(
      response => {
        console.log('Extra added', response);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500
      
        });
        this.fetchExtras();
        this.showAddModal= false;
        this.emptyExtra();
      },
      error => {
        console.error('Error adding extra', error);
      }
    );
  }
  async deleteEntrance(id: string) {
    try {
      await this.extrasService.deleteExtra(id);
      Swal.fire('Success', 'Record deleted', 'success');
      this.fetchExtras(); // Refrescar la tabla
    } catch (error) {
      console.error('Error deleting extra', error);
    }
  }
  openEditModal(extra: any) {
    console.log('editar esto',extra)
    this.selectedExtra = { ...extra }; // Clona la entrada seleccionada
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchExtras();
  }


  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
   this.emptyExtra();
  }
  emptyExtra(): void {
    this.newExtra = {
      name:'',
      price: 0,
      priceperson: true,
      notes: '',
      year:''
    };
  }
}
