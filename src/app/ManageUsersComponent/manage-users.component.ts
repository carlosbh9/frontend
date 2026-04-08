import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  PermissionNode,
  PERMISSION_TREE,
  PermissionsCatalogResponse,
  Role,
  RoleScopeInfo,
  User,
} from '../interfaces/user.interface';
import { RolesService } from '../Services/Users/roles.service';
import { UsersService } from '../Services/Users/users.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageUsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly roleService = inject(RolesService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly openModalRole = signal(false);
  readonly isEditMode = signal(false);

  userForm!: FormGroup;
  userFormRole!: FormGroup;

  permissionCatalogTree: PermissionNode[] = this.clonePermissionTree(PERMISSION_TREE);
  permissionTree: PermissionNode[] = this.clonePermissionTree(PERMISSION_TREE);
  roleScopeCatalog: RoleScopeInfo[] = [];
  selectedUser: User | null = null;
  selectedRole: Role | null = null;
  isEditing = false;
  readonly userSearch = signal('');
  readonly roleSearch = signal('');

  readonly filteredUsers = computed(() => {
    const term = this.userSearch().trim().toLowerCase();
    const items = this.users();

    if (!term) return items;

    return items.filter((user) =>
      [user.username, user.name, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  });

  readonly filteredRoles = computed(() => {
    const term = this.roleSearch().trim().toLowerCase();
    const items = this.roles();

    if (!term) return items;

    return items.filter((role) => {
      const scope = this.getRoleScope(role.name);
      return [
        role.nameRole,
        role.name,
        ...(role.permissions || []),
        scope?.label || '',
        scope?.description || '',
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  });

  ngOnInit(): void {
    this.initForm();
    this.initFormRole();
    void Promise.all([
      this.getusers(),
      this.getRoles(),
      this.loadPermissionsCatalog(),
    ]);
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['', [Validators.required]],
    });
  }

  private initFormRole() {
    this.userFormRole = this.fb.group({
      nameRole: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  private updatePasswordValidation(): void {
    const passwordControl = this.userForm.get('password');
    if (!passwordControl) return;

    passwordControl.setValidators(this.isEditing ? [] : [Validators.required]);
    passwordControl.updateValueAndValidity();
  }

  async getusers() {
    try {
      const result = await this.usersService.getAllUsers();
      this.users.set(result);
    } catch (error) {
      console.log('Error al cargar los User', error);
      toast.error('No se pudieron cargar los usuarios');
    }
  }

  async getRoles() {
    try {
      const result = await this.roleService.getAllRoles();
      this.roles.set(result);
    } catch (error) {
      console.log('Error al cargar los Roless', error);
      toast.error('No se pudieron cargar los roles');
    }
  }

  async loadPermissionsCatalog() {
    try {
      const result: PermissionsCatalogResponse = await this.roleService.getPermissionsCatalog();
      this.roleScopeCatalog = result.roleScopes || [];
      this.permissionCatalogTree = this.clonePermissionTree(result.tree || PERMISSION_TREE);
      this.permissionTree = this.clonePermissionTree(this.permissionCatalogTree);
    } catch (error) {
      console.log('Error al cargar el catalogo de permisos, usando fallback local', error);
      this.roleScopeCatalog = [];
      this.permissionCatalogTree = this.clonePermissionTree(PERMISSION_TREE);
      this.permissionTree = this.clonePermissionTree(this.permissionCatalogTree);
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.isEditing) {
      void this.updateUser();
      return;
    }

    void this.saveUser();
  }

  async saveUser() {
    try {
      const newUser: User = this.userForm.getRawValue();
      await this.usersService.createUser(newUser);
      toast.success('Usuario creado');
      await this.getusers();
      this.cancelEdit();
    } catch (error) {
      console.error('Error al guardar el usuario', error);
      toast.error('No se pudo crear el usuario');
    }
  }

  async updateUser() {
    try {
      if (!this.selectedUser) return;

      const formValue = { ...this.userForm.getRawValue() };
      if (!String(formValue.password || '').trim()) {
        delete formValue.password;
      }

      const updatedData: User = { ...this.selectedUser, ...formValue };
      await this.usersService.updateUser(updatedData._id, updatedData);
      toast.success('Usuario actualizado');
      await this.getusers();
      this.cancelEdit();
    } catch (error) {
      console.error('Error al actualizar el usuario', error);
      toast.error('No se pudo actualizar el usuario');
    }
  }

  async deleteUser(id: string) {
    try {
      await this.usersService.deleteUser(id);
      toast.success('Usuario eliminado');
      await this.getusers();
      if (this.selectedUser?._id === id) {
        this.cancelEdit();
      }
    } catch (error) {
      console.error('Error deleting User', error);
      toast.error('No se pudo eliminar el usuario');
    }
  }

  async deleteRole(id: string) {
    try {
      await this.roleService.deleteRole(id);
      toast.success('Rol eliminado');
      await this.getRoles();
    } catch (error) {
      console.error('Error deleting Role', error);
      toast.error('No se pudo eliminar el rol');
    }
  }

  confirmDelete(id: string) {
    toast('Vas a eliminar este usuario.', {
      action: {
        label: 'Confirmar',
        onClick: async () => {
          await this.deleteUser(id);
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => undefined,
      },
      position: 'bottom-center',
    });
  }

  confirmDeleteRole(id: string) {
    toast('Vas a eliminar este rol.', {
      action: {
        label: 'Confirmar',
        onClick: async () => {
          await this.deleteRole(id);
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => undefined,
      },
      position: 'bottom-center',
    });
  }

  editUser(user: User) {
    this.userForm.patchValue({
      username: user.username,
      name: user.name,
      password: '',
      role: user.role,
    });
    this.selectedUser = user;
    this.isEditing = true;
    this.updatePasswordValidation();
  }

  cancelEdit() {
    this.userForm.reset({
      username: '',
      name: '',
      password: '',
      role: '',
    });
    this.isEditing = false;
    this.selectedUser = null;
    this.updatePasswordValidation();
  }

  closeModal() {
    this.openModalRole.set(false);
    this.selectedRole = null;
  }

  private clonePermissionTree(tree: PermissionNode[]): PermissionNode[] {
    return JSON.parse(JSON.stringify(tree));
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedRole = null;
    this.userFormRole.reset({
      nameRole: '',
      name: ''
    });
    this.permissionTree = this.clonePermissionTree(this.permissionCatalogTree.length ? this.permissionCatalogTree : PERMISSION_TREE);
    this.uncheckAllPermissions(this.permissionTree);
    this.openModalRole.set(true);
  }

  openEditModal(role: Role): void {
    this.isEditMode.set(true);
    this.selectedRole = role;
    this.userFormRole.patchValue({ name: role.name, nameRole: role.nameRole });
    this.permissionTree = this.clonePermissionTree(this.permissionCatalogTree.length ? this.permissionCatalogTree : PERMISSION_TREE);
    this.markSelectedPermissions(role.permissions || [], this.permissionTree);
    this.openModalRole.set(true);
  }

  private uncheckAllPermissions(nodes: PermissionNode[]) {
    for (const node of nodes) {
      node.checked = false;
      if (node.children) {
        this.uncheckAllPermissions(node.children);
      }
    }
  }

  private markSelectedPermissions(permissions: string[], tree: PermissionNode[]): void {
    for (const node of tree) {
      node.checked = node.value ? permissions.includes(node.value) : false;
      if (node.children) {
        this.markSelectedPermissions(permissions, node.children);
        node.checked = node.children.every((child) => child.checked);
      }
    }
  }

  private getCheckedPermissions(tree: PermissionNode[]): string[] {
    let selected: string[] = [];
    for (const node of tree) {
      if (node.checked && node.value) {
        selected.push(node.value);
      }
      if (node.children) {
        selected = [...selected, ...this.getCheckedPermissions(node.children)];
      }
    }
    return [...new Set(selected)];
  }

  async onSave() {
    if (this.userFormRole.invalid) {
      this.userFormRole.markAllAsTouched();
      return;
    }

    const { nameRole, name } = this.userFormRole.getRawValue();
    const selectedPermissions = this.getCheckedPermissions(this.permissionTree);

    try {
      if (this.isEditMode() && this.selectedRole?._id) {
        const payload: Role = {
          ...this.selectedRole,
          nameRole,
          name,
          permissions: selectedPermissions,
        };
        await this.roleService.updateRole(this.selectedRole._id, payload);
        toast.success('Rol actualizado');
      } else {
        const newRole: Role = {
          nameRole,
          name,
          permissions: selectedPermissions
        };
        await this.roleService.createRole(newRole);
        toast.success('Rol creado');
      }

      await this.getRoles();
      this.closeModal();
    } catch (error) {
      console.error('Error al guardar el rol', error);
      toast.error('No se pudo guardar el rol');
    }
  }

  toggleExpand(node: PermissionNode): void {
    node.expanded = !node.expanded;
  }

  toggleAllGroups(expanded: boolean): void {
    for (const node of this.permissionTree) {
      node.expanded = expanded;
    }
  }

  toggleAllPermissions(checked: boolean): void {
    for (const node of this.permissionTree) {
      node.checked = checked;
      if (node.children) {
        this.setChildrenCheck(node.children, checked);
      }
    }
  }

  onParentChange(node: PermissionNode): void {
    if (node.children) {
      this.setChildrenCheck(node.children, node.checked || false);
    }
  }

  onChildChange(parent: PermissionNode): void {
    if (!parent.children) return;

    const allChecked = parent.children.every((child) => child.checked);
    const noneChecked = parent.children.every((child) => !child.checked);

    if (allChecked) {
      parent.checked = true;
    } else if (noneChecked) {
      parent.checked = false;
    } else {
      parent.checked = false;
    }
  }

  private setChildrenCheck(children: PermissionNode[], checked: boolean): void {
    for (const child of children) {
      child.checked = checked;
      if (child.children) {
        this.setChildrenCheck(child.children, checked);
      }
    }
  }

  getRoleScope(roleName: string): RoleScopeInfo | undefined {
    const normalizedRole = String(roleName || '').trim().toLowerCase();
    return this.roleScopeCatalog.find((scope) => scope.role === normalizedRole);
  }

  getRoleBadge(roleName: string): string {
    const scope = this.getRoleScope(roleName);
    return scope?.label || roleName || 'Sin rol';
  }

  getRoleDescription(roleName: string): string {
    const scope = this.getRoleScope(roleName);
    return scope?.description || 'Rol personalizable sin alcance base documentado en backend.';
  }

  getRoleAreas(roleName: string): string[] {
    const scope = this.getRoleScope(roleName);
    return scope?.serviceOrderAreas || [];
  }

  getPermissionPreview(permissions: string[]): string[] {
    return (permissions || []).slice(0, 3);
  }

  getTotalPermissions(): number {
    return this.flattenPermissionValues(this.permissionCatalogTree).length;
  }

  getSelectedPermissionsCount(): number {
    return this.getCheckedPermissions(this.permissionTree).length;
  }

  getRemainingPermissionsCount(permissions: string[]): number {
    return Math.max((permissions || []).length - 3, 0);
  }

  getGroupSelectionSummary(node: PermissionNode): string {
    const total = this.flattenPermissionValues(node.children || []).length;
    const selected = this.flattenCheckedValues(node.children || []).length;
    return `${selected}/${total} permisos`;
  }

  private flattenPermissionValues(nodes: PermissionNode[]): string[] {
    return nodes.flatMap((node) => {
      const current = node.value ? [node.value] : [];
      const children = node.children ? this.flattenPermissionValues(node.children) : [];
      return [...current, ...children];
    });
  }

  private flattenCheckedValues(nodes: PermissionNode[]): string[] {
    return nodes.flatMap((node) => {
      const current = node.checked && node.value ? [node.value] : [];
      const children = node.children ? this.flattenCheckedValues(node.children) : [];
      return [...current, ...children];
    });
  }
}
