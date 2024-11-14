
import { Component , OnInit} from '@angular/core';
import { GourmetService } from '../../Services/limagourmet/gourmet.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lima-gourmet',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './lima-gourmet.component.html',
  styleUrl: './lima-gourmet.component.css'
})
export class LimaGourmetComponent {
  gourmets: any[] = [];
  filteredGourmets: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal= false;
  filterYear : string = '2024'

  newGourmet = {
    code: '',
    activitie: null,
    price_pp: 0,
    price_for_one_person: 0,
    childRate: {
        from: 0,
        upTo: 0,
        price: 0
    },
    aprox_duration: '',
    closing_date: [{ date: null} ],
    year: ''
  };

  selectedGourmet = {
    _id: '',
    code: '',
    activitie: null,
    price_pp: 0,
    price_for_one_person: 0,
    childRate: {
        from: 0,
        upTo: 0,
        price: 0
    },
    aprox_duration: '',
    closing_date: [{ date: null}],
    year: ''
  };

  constructor(private limaGourmetService: GourmetService) { }

  ngOnInit(): void {
    this.fetchGourmet();
  }

  async fetchGourmet() {
    try {
      this.gourmets= await this.limaGourmetService.getAllLimagourmet();
      this.filteredGourmets = this.gourmets;
     // this.entrances = data;
      console.log(this.gourmets)
    } catch (error) {
      console.error('Error fetching Gourmets', error);
    }
  }
  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterGourmet();
    
  }

  filterGourmet() {
    this.filteredGourmets = this.gourmets.filter(gourmet =>
      gourmet.activitie.toLowerCase().includes(this.filterText.toLowerCase()) &&  (this.filterYear ? gourmet.year === this.filterYear : true)
    );
   
  }

  async deleteGourmet(id: string) {
    try {
      await this.limaGourmetService.deleteLimagourmet(id);
      this.fetchGourmet();
    } catch (error) {
      console.error('Error deleting gourmet', error);
    }
  }

  openEditModal(gourmet: any) {
    this.selectedGourmet = { ...gourmet }; // Clona la entrada seleccionada
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchGourmet();
  }


  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
   this.emptyEntrance();
  }

  emptyEntrance(): void {
    this.newGourmet = {
      code: '',
      activitie: null,
      price_pp: 0,
      price_for_one_person: 0,
      childRate: {
          from: 5,
          upTo: 12,
          price: 0
      },
      aprox_duration: '',
      closing_date: [{ date: null}],
      year: ''
    };
  }
  onSubmit() {
    this.limaGourmetService.createLimagourmet(this.newGourmet).then(
      response => {
        console.log('Gourmet added', response);
        this.fetchGourmet();
        this.showAddModal= false;
        this.emptyEntrance();
      },
      error => {
        console.error('Error adding gourmet', error);
        console.log('nuevo lima',this.newGourmet)
      }
    );
  }

  onEditSubmit() {
    this.limaGourmetService.updateLimagourmet(this.selectedGourmet._id, this.selectedGourmet).then(
      response => {
        console.log('Gourmet updated', response);
        this.fetchGourmet();
        this.showEditModal = false; // Cierra el modal después de enviar el formulario
      },
      error => {
        console.error('Error updating gourmet', error);
      }
    );
  }
  addClosingdateField() {
    this.newGourmet.closing_date.push({ date: null });
  }
  // Función para agregar un nuevo campo de closing date en el formulario de editar restaurant
  addEditClosingDateField() {
    this.selectedGourmet.closing_date.push({ date: null});
  }
  removeClosingdateField(index: number) {
    if (this.newGourmet.closing_date.length > 1) { // Prevent removing the only special date
      this.newGourmet.closing_date.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }

  }

  removeEditClosingdateField(index: number) {
    if (this.selectedGourmet.closing_date.length > 1) { // Prevent removing the only special date
      this.selectedGourmet.closing_date.splice(index, 1);
    } else {
      // Handle the case of removing the only price field (optional: clear values or display a message)
      console.warn('Cannot remove the only price field.');
    }

  }
}
