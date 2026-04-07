export interface NavigationItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  route?: string;
  permissions?: string[];
  permissionMode?: 'all' | 'any';
  matchRoutes?: string[];
  action?: 'openItineraryBuilder';
}

export interface NavigationGroup {
  id: string;
  label: string;
  description: string;
  icon: string;
  permissions?: string[];
  permissionMode?: 'all' | 'any';
  items: NavigationItem[];
}

export const navigationConfig: NavigationGroup[] = [
  {
    id: 'tariffs',
    label: 'Tarifas',
    description: 'Herramientas para administrar tarifas y estructuras de precios.',
    icon: 'bx bx-money-withdraw',
    permissions: ['view_tariff'],
    items: [
      {
        id: 'tariff-v2',
        label: 'Tariff',
        description: 'Editor principal de tarifas.',
        icon: 'bx bx-layer',
        route: 'tariff-v2',
        permissions: ['view_tariff'],
        matchRoutes: ['tariff-v2'],
      },
    ],
  },
  {
    id: 'sales',
    label: 'Ventas',
    description: 'Cotización, postventa y archivos operativos comerciales.',
    icon: 'bx bx-briefcase-alt-2',
    items: [
      {
        id: 'quoter-list',
        label: 'Cotizaciones',
        description: 'Consulta y seguimiento de contactos cotizados.',
        icon: 'bx bx-task',
        route: 'quoter-main/quoter-list',
        permissions: ['view_quoter'],
        matchRoutes: ['quoter-main/quoter-list'],
      },
      {
        id: 'new-quoter',
        label: 'Nuevo Quoter',
        description: 'Registro de una nueva cotizacion.',
        icon: 'bx bx-cart-add',
        route: 'quoter-main/quoter-v2-form',
        permissions: ['view_quoter'],
        matchRoutes: ['quoter-main/quoter-v2-form', 'quoter-main/quoter-v2-edit'],
      },
      {
        id: 'master-quoter',
        label: 'Master Quoter',
        description: 'Vista consolidada del master quoter.',
        icon: 'bx bx-store-alt',
        route: 'quoter-main/master-quoter-v2',
        permissions: ['view_quoter'],
        matchRoutes: ['quoter-main/master-quoter-v2'],
      },
      {
        id: 'booking-form',
        label: 'Booking Form',
        description: 'Formulario y captura de booking.',
        icon: 'bx bx-book-content',
        route: 'quoter-main/booking-form',
        permissions: ['view_quoter'],
        matchRoutes: ['quoter-main/booking-form'],
      },

      {
        id: 'booking-files',
        label: 'Booking Files',
        description: 'Consulta y detalle de booking files.',
        icon: 'bx bx-folder-open',
        route: 'quoter-main/booking-files',
        permissions: ['view_quoter'],
        matchRoutes: ['quoter-main/booking-files'],
      },
      {
        id: 'itinerary-builder',
        label: 'Itinerary Builder',
        description: 'Abre la herramienta externa de itinerarios.',
        icon: 'bx bx-map-alt',
        permissions: ['view_quoter'],
        action: 'openItineraryBuilder',
      },

    ],
  },
  {
    id: 'operations',
    label: 'Operaciones',
    description: 'Seguimiento operativo y asignaciones diarias.',
    icon: 'bx bx-smile',
    items: [
       {
        id: 'service-orders',
        label: 'Service Orders',
        description: 'Gestión de service orders por contacto.',
        icon: 'bx bx-list-check',
        route: 'quoter-main/service-orders',
        permissions: ['view_quoter'],
        matchRoutes: ['quoter-main/service-orders'],
      },
      {
        id: 'service-order-templates',
        label: 'Order Templates',
        description: 'Plantillas para service orders.',
        icon: 'bx bx-slider-alt',
        route: 'quoter-main/service-order-templates',
        permissions: ['view_users', 'service_order_templates.manage'],
        permissionMode: 'any',
        matchRoutes: ['quoter-main/service-order-templates'],
      },
      {
        id: 'operations-biblia',
        label: 'Biblia',
        description: 'Panel de referencia operativa.',
        icon: 'bx bx-book-open',
        route: 'operations/biblia',
        matchRoutes: ['operations/biblia'],
      },
      {
        id: 'operations-reservations',
        label: 'Estado de reservas',
        description: 'Monitoreo del estado de reservas.',
        icon: 'bx bx-calendar-check',
        route: 'operations/reservations',
        matchRoutes: ['operations/reservations'],
      },
      {
        id: 'operations-assignments',
        label: 'Asignaciones',
        description: 'Asignación de guías y transporte.',
        icon: 'bx bx-transfer-alt',
        route: 'operations/assignments',
        matchRoutes: ['operations/assignments'],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administración',
    description: 'Configuración operativa y acceso de usuarios.',
    icon: 'bx bxs-user-detail',
    permissions: ['view_users'],
    items: [
      {
        id: 'manage-users',
        label: 'Users',
        description: 'Gestión de usuarios y accesos.',
        icon: 'bx bxs-user-detail',
        route: 'manageUsers',
        permissions: ['view_users'],
        matchRoutes: ['manageUsers'],
      },
    ],
  },
];
