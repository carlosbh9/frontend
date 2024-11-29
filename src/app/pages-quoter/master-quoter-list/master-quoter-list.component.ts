import { Component ,inject} from '@angular/core';
import { MasterQuoterService } from '../../Services/master-quoter.service';
import { Router ,ActivatedRoute} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-master-quoter-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-quoter-list.component.html',
  styleUrl: './master-quoter-list.component.css'
})
export class MasterQuoterListComponent {
  MasterquoterService = inject(MasterQuoterService)
  
  Masterquotes: any[] = []
  filteredQuotes: any[] = [];
  filterText: string = '';
  // selectedQuoter: Quoter 
  
 
  constructor(private router: Router,private route: ActivatedRoute) {
   // this.selectedQuoter = this.emptyQuoter; // Mueve la inicialización aquí
  }
  ngOnInit(): void {
    this.fetchMasterQuoter();
  }
  async fetchMasterQuoter (){
 
    try {
      this.Masterquotes = await this.MasterquoterService.getAllMasterQuoter();
      
      // Ordenar los datos por tipo y luego por nombre de manera predeterminada
      this.Masterquotes.sort((a, b) => {
        // Ordenar primero por tipo
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
  
        // Si los tipos son iguales, ordenar por nombre alfabéticamente
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
  
        return 0; // Si ambos valores son iguales
      });
  
      // Inicialmente, mostrar todos los resultados ordenados
      this.filteredQuotes = this.Masterquotes;
      
      console.log(this.Masterquotes); // Para ver cómo queda la lista
    } catch (error) {
      console.error('Error fetching entrances', error);
    }
  }

  filterQuotes() {
    this.filteredQuotes = this.Masterquotes.filter(quoter =>
      quoter.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }
  quoterForm() {
    this.router.navigate([`../master-quoter`],{ relativeTo: this.route });
  }
  async deleteQuoter(id: string) {
    try {
      await this.MasterquoterService.deleteMasterQuoter(id);
      this.fetchMasterQuoter();
    } catch (error) {
      console.error('Error deleting quoter', error);
    }
  }

  editQuoter(id: string){
    this.router.navigate([`../master-quoter-edit`,id],{ relativeTo: this.route });
  }

}
