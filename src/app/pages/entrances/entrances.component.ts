import { Component , OnInit} from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';


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

  editEntrance(id: string) {
    // Aquí puedes redirigir a una página de edición o abrir un modal para editar la entrada
  }
}