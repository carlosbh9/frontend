import { Component } from '@angular/core';
import { GuidesService } from '../../Services/guides.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.css'
})
export class GuidesComponent {
  guides: any[] = [];
  filteredGuides: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;

  newGuide: any = {
    name_guide: '',
    type_guide: 'Regular', // Valor por defecto
    price_guide: 0,
    observations: ''
  };

  selectedGuide: any = {
    name_guide: '',
    type_guide: 'Regular',
    price_guide: 0,
    observations: ''
  };

  constructor(private guidesService: GuidesService,private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fetchGuides();
  }


  async fetchGuides() {
    try {
      this.guides = await this.guidesService.getAllGuides();
      this.filteredGuides = this.guides;
    } catch (error) {
      console.error('Error fetching guides', error);
    }
  }

  filterGuides() {
    this.filteredGuides = this.guides.filter(guide =>
      guide.name_guide.toLowerCase().includes(this.filterText.toLowerCase()) || guide.type_guide.toLowerCase().includes(this.filterText.toLocaleLowerCase())
    );
  }

  async deleteGuide(id: string) {
    try {
      await this.guidesService.deleteGuide(id);
      this.fetchGuides();
    } catch (error) {
      console.error('Error deleting guide', error);
    }
  }

  openEditModal(guide: any) {
    this.selectedGuide = { ...guide };
    this.showEditModal = true;
    console.log(this.selectedGuide)
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.fetchGuides();
  }

  openModal() {
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.emptyGuide();
  }

  emptyGuide(): void {
    this.newGuide = {
      name_guide: '',
      type_guide: 'Regular',
      price_guide: 0,
      observations: ''
    };
  }

  onSubmit() {
    this.guidesService.addGuide(this.newGuide).then(
      response => {
        console.log('Guide added', response);
        this.fetchGuides();
        this.showAddModal = false;
        this.emptyGuide();
      },
      error => {
        console.error('Error adding guide', error);
      }
    );
  }

  onEditSubmit() {
    this.guidesService.updateGuide(this.selectedGuide._id, this.selectedGuide).then(
      response => {
        console.log('Guide updated', response);
        this.fetchGuides();
        this.showEditModal = false;
      },
      error => {
        console.error('Error updating guide', error);
      }
    );
  }
}
