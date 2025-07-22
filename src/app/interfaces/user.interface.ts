export interface UserPayload {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: [string]; // O `role: string` si es solo un rol
  }


  export interface User{
    _id: string;
    username: string;
    password: string;
    contacts: [string];
    name: string;
    role: string; // O `role: string` si es solo un rol
  }

  export interface Role{
    _id?: string;
    nameRole: string;
    name: string;
    permissions:string[];
  }

  export interface PermissionNode {
    label: string;
    value?: string;            // Identificador único del permiso (opcional en nodos "padre")
    checked?: boolean;         // Indica si está marcado
    expanded?: boolean;        // Indica si está expandido (para controlar mostrar/ocultar hijos)
    children?: PermissionNode[];  // Lista de permisos hijos
  }
  
  export const PERMISSION_TREE: PermissionNode[] = [
    {
      label: 'Tariff',
      expanded: true,
   
      children: [
        { label: 'Create tariff', value: 'create_tariff', checked: false },
        { label: 'Edit and Delete tariff', value: 'actions_tariff', checked: false },
      ]
    },
    {
      label: 'Quoter',
      expanded: true,
      children: [
         { label: 'Create Quoter', value: 'create_quoter', checked: false },
         { label: 'Update Quoter', value: 'update_quoter', checked: false },
         { label: 'Edit and Delete Quoter', value: 'actions_quoter', checked: false },
         { label: 'Delete Quoter', value: 'delete_quoter', checked: false },
      ]
    },
    {
      label: 'Contacts',
      expanded: true,
      children: [
        { label: 'Print infoPax', value: 'print_info_pax', checked: false },
        { label: 'Info pax filters', value: 'info_pax_filters', checked: false },
        { label: 'Info pax Table', value: 'info_pax_table', checked: false }
      ]
    },
    {
      label: 'View ',
      expanded: true,
      children: [
        { label: 'Users', value: 'view_users', checked: false },
        { label: 'Tariff', value: 'view_tariff', checked: false },
        { label: 'Quoter', value: 'view_quoter', checked: false }
      ]
    },
    // {
    //   label: 'Routes',
    //   expanded: true,
    //   children: [
    //     { label: 'Route quoter', value: 'route_quoter_main', checked: false },
    //     { label: 'Route users ', value: 'route_users', checked: false },
    //     { label: 'Route tariff ', value: 'route_tariff', checked: false },
    //   ]
    // },
  ];
  