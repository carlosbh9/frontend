import { Component } from '@angular/core';
import { GuidesService } from '../../Services/guides.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';
import { toast } from 'ngx-sonner';


@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule,FormsModule,HasRoleDirective],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.css'
})
export class GuidesComponent {
  guides: any[] = [];
  filteredGuides: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;
  filterYear : string = '2025'

  newGuide: any = {
    name_guide: '',
    type_guide: 'Regular', // Valor por defecto
    price_guide: 0,
    observations: '',
    year:''
  };

  selectedGuide: any = {
    name_guide: '',
    type_guide: 'Regular',
    price_guide: 0,
    observations: '',
    year:''
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
    this.filteredGuides = this.guides.filter(guide =>(
      guide.name_guide.toLowerCase().includes(this.filterText.toLowerCase()) || guide.type_guide.toLowerCase().includes(this.filterText.toLocaleLowerCase())) && (this.filterYear ? guide.year === this.filterYear : true)
    );
  }

  
  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
    this.filterYear = String(selectElement.value); // Convertir el valor a número
    this.filterGuides();
    
  }
  confirmDelete(id: string) {
    toast('Are you sure you want to delete this record?', {
     
      action: {
        label: 'Confirm',
        onClick: async () => {
        await this.deleteGuide(id);
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
  async deleteGuide(id: string) {
    try {
      await this.guidesService.deleteGuide(id);
      toast.success('Record deleted')
      this.fetchGuides();
    } catch (error) {
      console.error('Error deleting guide', error);
      toast.error('Error deleting guide')
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
      observations: '',
      year:''
    };
  }

  onSubmit() {
    this.guidesService.addGuide(this.newGuide).then(
      response => {
        console.log('Guide added', response);
        toast.success("Added record")
        this.fetchGuides();
        this.showAddModal = false;
        this.emptyGuide();
      },
      error => {
        console.error('Error adding guide', error);
        toast.error('Error adding guide')
      }
    );
  }

  onEditSubmit() {
    this.guidesService.updateGuide(this.selectedGuide._id, this.selectedGuide).then(
      response => {
        console.log('Guide updated', response);
        toast.success('Guide updated')
        this.fetchGuides();
        this.showEditModal = false;
      },
      error => {
        console.error('Error updating guide', error);
        toast.error('Error updating guide')
      }
    );
  }
}
