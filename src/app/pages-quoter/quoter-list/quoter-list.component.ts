import { Component,inject ,OnInit} from '@angular/core';
import { QuoterService} from '../../Services/quoter.service'
import { Quoter } from '../../interfaces/quoter.interface';
import { Router,ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-quoter-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './quoter-list.component.html',
  styleUrl: './quoter-list.component.css'
})
export class QuoterListComponent implements OnInit{
  quoterService = inject(QuoterService)
  //router = inject(Router)
  //route= inject(ActivatedRoute) 
  quotes: Quoter[] = []
  filteredQuotes: any[] = [];
  filterText: string = '';
  selectedQuoter: Quoter 
  
  emptyQuoter: Quoter = {
    guest: '',
    FileCode: '',
    travelDate: {
      start: '',
      end: ''
    },
    accomodations: '',
    totalNights: 0,
    number_paxs: [0],
    travel_agent: '',
    exchange_rate: '',
    services: [],
    hotels: [],
    flights: [],
    operators:[]
  }
  constructor(private router: Router,private route: ActivatedRoute) {
    this.selectedQuoter = this.emptyQuoter; // Mueve la inicialización aquí
  }
  ngOnInit(): void {
    this.fetchQuoter();
  }
  async fetchQuoter (){
    try{
      this.quotes = await this.quoterService.getAllQuoter();
      this.filteredQuotes = this.quotes
      console.log(this.quotes)
    }catch{
      console.error('Error fetching entrances');
    }
  }

  filterQuotes() {
    this.filteredQuotes = this.quotes.filter(quoter =>
      quoter.guest.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }
  quoterForm() {
    this.router.navigate([`../quoter-form`],{ relativeTo: this.route });
  }
  async deleteQuoter(id: string) {
    try {
      await this.quoterService.deleteQuoter(id);
      this.fetchQuoter();
    } catch (error) {
      console.error('Error deleting quoter', error);
    }
  }

  editQuoter(id: string){
    this.router.navigate([`../quoter-edit`,id],{ relativeTo: this.route });
  }

}

