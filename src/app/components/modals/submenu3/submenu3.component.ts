import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-submenu3',
  standalone: true,
  imports: [],
  templateUrl: './submenu3.component.html',
  styleUrl: './submenu3.component.css'
})
export class Submenu3Component {
  toggleStateEdit = signal(false);

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.toggleStateEdit.set(input.checked);
  }
}
