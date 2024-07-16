import { Component , OnInit} from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';


@Component({
  selector: 'app-entrances',
  standalone: true,
  imports: [CommonModule,FormsModule ],
  templateUrl: './entrances.component.html',
  styleUrl: './entrances.component.css'
})
export class EntrancesComponent implements OnInit{
  entrances: any[] = [];
  filteredEntrances: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal= false;

  newEntrance = {
    description: '',
    price_pp: null,
    childRate: {
      pp: null,
      upTo: null
    },
    take_note: ''
  };

  selectedEntrance = {
    _id: '',
    description: '',
    price_pp: null,
    childRate: {
      pp: null,
      upTo: null
    },
    take_note: ''
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


  filterEntrances() {
    this.filteredEntrances = this.entrances.filter(entrance =>
      entrance.description.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  async deleteEntrance(id: string) {
    try {
      await this.entrancesService.deleteEntrance(id);
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
  }

  editEntrance(id: string) {
    const entrance = this.filteredEntrances.find(e => e._id === id);
    if (entrance) {
      this.openEditModal(entrance);
    }
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
      price_pp: null,
      childRate: {
        pp: null,
        upTo: null
      },
      take_note: ''
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
