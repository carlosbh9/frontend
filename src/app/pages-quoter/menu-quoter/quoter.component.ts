import { Component } from '@angular/core';
import { NavigationShellComponent } from '../../components/navigation-shell/navigation-shell.component';

@Component({
  selector: 'app-quoter',
  standalone: true,
  imports: [NavigationShellComponent],
  templateUrl: './quoter.component.html',
  styleUrl: './quoter.component.css'
})
export class QuoterComponent {
  readonly title = 'Ventas';
  readonly description =
    'Centraliza cotizaciones, postventa y seguimiento comercial usando la navegación principal del sidebar.';
}
