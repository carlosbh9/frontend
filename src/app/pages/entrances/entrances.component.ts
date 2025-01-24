import { Component ,inject, OnInit} from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';
import { toast} from 'ngx-sonner';


@Component({
  selector: 'app-entrances',
  standalone: true,
  imports: [CommonModule,FormsModule ,HasRoleDirective
  ],
  templateUrl: './entrances.component.html',
  styleUrl: './entrances.component.css',
  providers: []
})
export class EntrancesComponent implements OnInit{

  entrances: any[] = [];
  filteredEntrances: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal= false;
  filterYear : string = '2025'

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

  constructor(private entrancesService: EntrancesService
   ) { }

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
  confirmDelete(id: string) {
    toast('Are you sure you want to delete this record?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
        await this.deleteEntrance(id);
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

  async deleteEntrance(id: string) {
    try {
      await this.entrancesService.deleteEntrance(id);
      toast.success('Record deleted');
      this.fetchEntrances();
    } catch (error) {
      console.error('Error deleting entrance', error);
      toast.error('Unable to delete record');
    }
  }

  openEditModal(entrance: any) {
    this.selectedEntrance = { ...entrance }; 
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
        toast.success('Record create');
        this.fetchEntrances();
        this.showAddModal= false;
        this.emptyEntrance();
      },
      error => {
        console.error('Error adding entrance', error);
        toast.error('Error adding entrance');
      }
    );
  }

  onEditSubmit() {
    this.entrancesService.updateEntrance(this.selectedEntrance._id, this.selectedEntrance).then(
      response => {
        console.log('Entrance updated', response);
        toast.success('Record edit');
        this.fetchEntrances();
        this.showEditModal = false; // Cierra el modal después de enviar el formulario
      },
      error => {
        console.error('Error updating entrance', error);
      }
    );
  }
}
