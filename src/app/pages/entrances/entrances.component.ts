import { Component , OnInit} from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2'


@Component({
  selector: 'app-entrances',
  standalone: true,
  imports: [CommonModule,FormsModule , SweetAlert2Module],
  templateUrl: './entrances.component.html',
  styleUrl: './entrances.component.css'
})
export class EntrancesComponent implements OnInit{
  entrances: any[] = [];
  filteredEntrances: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal= false;
  filterYear : string = '2024'

  newEntrance = {
    description: '',
    price_pp: 0,
    childRate: {
      pp: 0,
      upTo: null
    },
    take_note: '',
    year:''
  };

  selectedEntrance = {
    _id: '',
    description: '',
    price_pp: 0,
    childRate: {
      pp: 0,
      upTo: null
    },
    take_note: '',
    year:''
  };

  constructor(private entrancesService: EntrancesService) { }

  ngOnInit(): void {
    this.fetchEntrances();
  }

  async fetchEntrances() {
    try {
      this.entrances= await this.entrancesService.getAllEntrances();
      this.filteredEntrances = this.entrances;
     // this.entrances = data;
      console.log(this.entrances)
    } catch (error) {
      console.error('Error fetching entrances', error);
    }
  }
  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterEntrances();
    
  }

  filterEntrances() {
    this.filteredEntrances = this.entrances.filter(entrance =>
      entrance.description.toLowerCase().includes(this.filterText.toLowerCase()) &&  (this.filterYear ? entrance.year === this.filterYear : true)
    );
   
  }

  async deleteEntrance(id: string) {
    try {
      await this.entrancesService.deleteEntrance(id);
      Swal.fire('Exsito','Registro borrado','success')
      this.fetchEntrances();
    } catch (error) {
      console.error('Error deleting entrance', error);
    }
  }

  openEditModal(entrance: any) {
    this.selectedEntrance = { ...entrance }; // Clona la entrada seleccionada
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchEntrances();
  }


  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
   this.emptyEntrance();
  }

  emptyEntrance(): void {
    this.newEntrance = {
      description: '',
      price_pp: 0,
      childRate: {
        pp: 0,
        upTo: null
      },
      take_note: '',
      year:''
    };
  }
  onSubmit() {
    this.entrancesService.createEntrance(this.newEntrance).then(
      response => {
        console.log('Entrance added', response);
        this.fetchEntrances();
        this.showAddModal= false;
        this.emptyEntrance();
      },
      error => {
        console.error('Error adding entrance', error);
      }
    );
  }

  onEditSubmit() {
    this.entrancesService.updateEntrance(this.selectedEntrance._id, this.selectedEntrance).then(
      response => {
        console.log('Entrance updated', response);
        this.fetchEntrances();
        this.showEditModal = false; // Cierra el modal después de enviar el formulario
      },
      error => {
        console.error('Error updating entrance', error);
      }
    );
  }
}
