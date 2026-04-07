export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface User {
  _id: string;
  username: string;
  password?: string;
  name: string;
  role: string;
}

export interface Role {
  _id?: string;
  nameRole: string;
  name: string;
  permissions: string[];
}

export interface PermissionNode {
  id?: string;
  label: string;
  value?: string;
  checked?: boolean;
  expanded?: boolean;
  children?: PermissionNode[];
}

export interface RoleScopeInfo {
  role: string;
  label: string;
  description: string;
  serviceOrderAreas: string[];
  isAdmin: boolean;
}

export const PERMISSION_TREE: PermissionNode[] = [
  {
    id: 'tariff',
    label: 'Tariff',
    expanded: true,
    children: [
      { label: 'Create tariff', value: 'create_tariff', checked: false },
      { label: 'Edit and Delete tariff', value: 'actions_tariff', checked: false },
    ]
  },
  {
    id: 'quoter',
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
    id: 'contacts',
    label: 'Contacts',
    expanded: true,
    children: [
      { label: 'Print infoPax', value: 'print_info_pax', checked: false },
      { label: 'Info pax filters', value: 'info_pax_filters', checked: false },
      { label: 'Info pax Table', value: 'info_pax_table', checked: false },
      { label: 'View all contacts', value: 'contacts.read_all', checked: false },
      { label: 'Manage all contacts', value: 'contacts.manage_all', checked: false }
    ]
  },
  {
    id: 'service-orders',
    label: 'Service Orders',
    expanded: true,
    children: [
      { label: 'Cancel service orders', value: 'service_orders.cancel', checked: false },
      { label: 'Assign service orders', value: 'service_orders.assign', checked: false },
      { label: 'Update service order checklist', value: 'service_orders.checklist.update', checked: false },
      { label: 'Update service order stages', value: 'service_orders.stage.update', checked: false },
      { label: 'Manage service order financials', value: 'service_orders.financials.manage', checked: false },
      { label: 'Manage service order attachments', value: 'service_orders.attachments.manage', checked: false },
      { label: 'Manage order templates', value: 'service_order_templates.manage', checked: false }
    ]
  },
  {
    id: 'view',
    label: 'View',
    expanded: true,
    children: [
      { label: 'Users', value: 'view_users', checked: false },
      { label: 'Tariff', value: 'view_tariff', checked: false },
      { label: 'Quoter', value: 'view_quoter', checked: false }
    ]
  },
];

export interface PermissionsCatalogResponse {
  permissions: Record<string, string>;
  tree: PermissionNode[];
  roleScopes: RoleScopeInfo[];
}
