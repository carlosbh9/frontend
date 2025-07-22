import { Directive ,effect,inject, input, TemplateRef, ViewContainerRef} from '@angular/core';
import { AuthService } from './auth.service';


@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionsDirective {
  private templateRef = inject(TemplateRef)
  private viewContainer = inject(ViewContainerRef)

  private authService = inject(AuthService)
  
  roles = input.required<string[]>({alias:'hasPermission'})
  constructor() { }
  ngOnInit() {
    // Obtenemos la lista de permisos del usuario
    const userPermissions = this.authService.getPermisions(); 
  
    const hasAllPermissions = this.roles().every(perm =>
      userPermissions.includes(perm)
    );
    if (hasAllPermissions) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
