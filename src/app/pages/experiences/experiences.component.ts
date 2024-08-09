import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExperiencesService } from '../../Services/experiences.service';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [CommonModule,FormsModule ],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.css'
})
export class ExperiencesComponent implements OnInit {
  experiences: any[] = [];
  filteredExperiences: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;

  newExperience: any = {
    name: '',
    category: '',
    prices: [{ groupSize: null, pricePerPerson: null }],
    childRate: {
      pp: null,
      upTo: null,
      minimumAge: null
    },
    guide_price: 0,
    approximateDuration: '',
    take_notes:'',
    politica_canc:'',
    contac_phone:''
  };

  selectedExperience: any = {
    name: '',
    category: '',
    prices: [{ groupSize: null, pricePerPerson: null }],
    childRate: {
      pp: null,
      upTo: null,
      minimumAge: null
    },
    guide_price: 0,
    approximateDuration: '',
    take_notes:'',
    politica_canc:'',
    contac_phone:''
  };

  constructor(private experienceService: ExperiencesService) { }

  ngOnInit(): void {
    this.fetchExperiences();
  }

  async fetchExperiences() {
    try {
      this.experiences = await this.experienceService.getAllExperiences();
      this.filteredExperiences = this.experiences;
    } catch (error) {
      console.error('Error fetching experiences', error);
    }
  }

  filterExperiences() {
    this.filteredExperiences = this.experiences.filter(experience =>
      experience.name.toLowerCase().includes(this.filterText.toLowerCase()) || experience.category.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }


  async deleteExperience(id: string) {
    try {
      await this.experienceService.deleteExperience(id);
      this.fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience', error);
    }
  }

  openEditModal(experience: any) {
    this.selectedExperience = { ...experience };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchExperiences();
  }

  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.emptyExperience();
  }

  emptyExperience(): void {
    this.newExperience = {
      name: '',
      category: '',
      prices: [],
      childRate: {
        pp: null,
        upTo: null,
        minimumAge: null
      },
      guide_price: 0,
      approximateDuration: '',
      take_notes:'',
      politica_canc:'',
      contac_phone:''
    };
  }
 // Función para agregar un nuevo campo de precio en el formulario de agregar experiencia
 addPriceField() {
  this.newExperience.prices.push({ groupSize: null, pricePerPerson: null });
}

// Función para agregar un nuevo campo de precio en el formulario de editar experiencia
addEditPriceField() {
  this.selectedExperience.prices.push({ groupSize: null, pricePerPerson: null });
}
removePriceField(index: number) {

  if (this.newExperience.prices.length >= 1) { // Prevent removing the only price field
    this.newExperience.prices.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }

}

removeEditPriceField(index: number) {

  if (this.selectedExperience.prices.length >= 1) { // Prevent removing the only price field
    this.selectedExperience.prices.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }

}

  onSubmit() {
    this.experienceService.addExperience(this.newExperience).then(
      response => {
        console.log('Experience added', response);
        this.fetchExperiences();
        this.showAddModal = false;
        this.emptyExperience();
      },
      error => {
        console.error('Error adding experience', error);
      }
    );
  }

  onEditSubmit() {
    this.experienceService.updateExperience(this.selectedExperience._id, this.selectedExperience).then(
      response => {
        console.log('Experience updated', response);
        this.fetchExperiences();
        this.showEditModal = false;
      },
      error => {
        console.error('Error updating experience', error);
      }
    );
  }
}
