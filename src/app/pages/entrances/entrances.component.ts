import { Component } from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entrances',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entrances.component.html',
  styleUrl: './entrances.component.css'
})
export class EntrancesComponent {
  entrances: any[] = [];

  constructor(private entrancesService: EntrancesService) { }

  ngOnInit(): void {
    this.fetchEntrances();
  }

  async fetchEntrances() {
    try {
      const data = await this.entrancesService.getAllEntrances();
      this.entrances = data;
    } catch (error) {
      console.error('Error fetching entrances', error);
    }
  }
}
