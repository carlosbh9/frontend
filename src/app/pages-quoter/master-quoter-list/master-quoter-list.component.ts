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
  
  // emptyQuoter: Quoter = {
  //   guest: '',
  //   FileCode: '',
  //   travelDate: {
  //     start: '',
  //     end: ''
  //   },
  //   accomodations: '',
  //   totalNights: 0,
  //   number_paxs: [0],
  //   travel_agent: '',
  //   exchange_rate: '',
  //   services: [],
  //   hotels: [],
  //   flights: [],
  //   operators:[],
  //   total_prices:{
  //     total_hoteles: [],
  //     total_services: [],
  //     total_ext_operator: [],
  //     total_ext_cruises: [],
  //     total_flights: [],
  //     subtotal: [],
  //     cost_transfers: [],
  //     final_cost: [],
  //     price_pp: []
  //   }
//}
  constructor(private router: Router,private route: ActivatedRoute) {
   // this.selectedQuoter = this.emptyQuoter; // Mueve la inicialización aquí
  }
  ngOnInit(): void {
    this.fetchMasterQuoter();
  }
  async fetchMasterQuoter (){
    try{
      this.Masterquotes = await this.MasterquoterService.getAllMasterQuoter();
      this.filteredQuotes = this.Masterquotes
      console.log(this.Masterquotes)
    }catch{
      console.error('Error fetching entrances');
    }
  }

  filterQuotes() {
    this.filteredQuotes = this.Masterquotes.filter(quoter =>
      quoter.guest.toLowerCase().includes(this.filterText.toLowerCase())
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
