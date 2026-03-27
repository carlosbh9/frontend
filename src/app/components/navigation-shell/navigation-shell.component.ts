import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-navigation-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './navigation-shell.component.html',
})
export class NavigationShellComponent {
  title = input.required<string>();
  description = input.required<string>();
}
