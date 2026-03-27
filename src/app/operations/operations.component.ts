import { Component } from '@angular/core';
import { NavigationShellComponent } from '../components/navigation-shell/navigation-shell.component';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [NavigationShellComponent],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.css'
})
export class OperationsComponent {
  readonly title = 'Operaciones';
  readonly description =
    'Accede al seguimiento operativo, estado de reservas y asignaciones desde la navegación central del sidebar.';
}
