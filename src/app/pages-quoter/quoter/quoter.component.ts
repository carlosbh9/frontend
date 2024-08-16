import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quoter',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './quoter.component.html',
  styleUrl: './quoter.component.css'
})
export class QuoterComponent {

}
