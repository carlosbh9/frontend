import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from '../app/Services/AuthService/auth.guard'

export const routes: Routes = [

    {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/layout/layout.component').then((m) => m.LayoutComponent),
        children: [
          {
            path: 'quoter-main',
            loadComponent: () =>
              import('./pages-quoter/menu-quoter/quoter.component').then((m) => m.QuoterComponent),
            canActivate: [authGuard],
            data: { permission: 'view_quoter' },
            children: [
              {
                path: 'quoter-v2-form',
                loadComponent: () =>
                  import('./pages-quoter/quoter-v2/quoter-v2-form/quoter-v2-form.component').then(
                    (m) => m.QuoterV2FormComponent
                  ),
              },
              {
                path: 'quoter-list',
                loadComponent: () =>
                  import('./pages-quoter/quoter-v2/quoter-list/contacts/quoter-list.component').then(
                    (m) => m.QuoterListComponent
                  ),
              },
              {
                path: 'quoter-v2-edit/:id',
                loadComponent: () =>
                  import('./pages-quoter/quoter-v2/quoter-v2-form/quoter-v2-form.component').then(
                    (m) => m.QuoterV2FormComponent
                  ),
              },
              {
                path: 'master-quoter-v2',
                loadComponent: () =>
                  import('./pages-quoter/master-quoter-v2/master-quoter-v2.component').then(
                    (m) => m.MasterQuoterV2Component
                  ),
              },
              {
                path: 'booking-form',
                loadComponent: () =>
                  import('./pages-quoter/booking-form/booking-form.component').then(
                    (m) => m.BookingFormComponent
                  ),
              },
              {
                path: 'service-orders',
                loadComponent: () =>
                  import('./features/service-orders/pages/service-orders-page.component').then(
                    (m) => m.ServiceOrdersPageComponent
                  ),
              },
              {
                path: 'service-orders/contact/:contactId',
                loadComponent: () =>
                  import('./features/service-orders/pages/service-orders-by-contact-page.component').then(
                    (m) => m.ServiceOrdersByContactPageComponent
                  ),
              },
              {
                path: 'booking-files',
                loadComponent: () =>
                  import('./features/booking-files/pages/booking-files-list-page.component').then(
                    (m) => m.BookingFilesListPageComponent
                  ),
              },
              {
                path: 'booking-files/:id',
                loadComponent: () =>
                  import('./features/booking-files/pages/booking-file-page.component').then(
                    (m) => m.BookingFilePageComponent
                  ),
              },
              {
                path: 'booking-files/by-quoter/:quoterId',
                loadComponent: () =>
                  import('./features/booking-files/pages/booking-file-page.component').then(
                    (m) => m.BookingFilePageComponent
                  ),
              },
              {
                path: 'service-order-templates',
                canActivate: [authGuard],
                data: { permission: 'view_users' },
                loadComponent: () =>
                  import('./features/service-orders/pages/service-order-templates-page.component').then(
                    (m) => m.ServiceOrderTemplatesPageComponent
                  ),
              },
              // {
              //   path: 'booking-list',
              //   loadComponent: () =>
              //     import('./pages-quoter/booking-form/booking-list/booking-list.component').then(
              //       (m) => m.BookingListComponent
              //     ),
              // },


            ],
          },
          // {
          //   path: 'tariff',
          //   loadComponent: () => import('./pages/menu-tariff/menu-tariff.component').then((m) => m.MenuTariffComponent ),
          //   canActivate: [authGuard],
          //   data: { permission: 'view_tariff'},
          //   children:[
          //     {
          //       path: 'tariff-v2',
          //       loadComponent: () =>
          //         import('./pages/tariff-v2/tariff-v2.component').then((m) => m.TariffV2Component)
          //     }
          //   ]
          // },
           {
            path: 'tariff-v2',
            loadComponent: () => import('./pages/tariff-v2/tariff-v2.component').then((m) => m.TariffV2Component),
            canActivate: [authGuard],
            data: { permission: 'view_tariff'},
          },
          {
            path:'manageUsers',
            loadComponent: () => import('./ManageUsersComponent/manage-users.component').then((m) => m.ManageUsersComponent),
            canActivate:[authGuard],
            data: { permission: 'view_users'},
          },
          {
            path:'operations',
            loadComponent: () => import('./operations/operations.component').then((m) => m.OperationsComponent),
            canActivate:[authGuard],
            children:[
              {
                path: 'biblia',
                loadComponent: () =>
                  import('./operations/biblia/biblia.component').then((m) => m.BibliaComponent)
              },
              {
                path:'reservations',
                loadComponent: () => import('./operations/reservas-status/reservas-status.component').then((m) => m.ReservasStatusComponent)
              },
              {
                path:'assignments',
                loadComponent: () => import('./operations/guide-transport-assignment/guide-transport-assignment.component').then((m) => m.GuideTransportAssignmentComponent)
              }
            ],
        },
      ]
    },

    {
      path: 'booking-form-public/:token',
      loadComponent: () =>
        import('./pages-quoter/booking-form/public-form/booking-form-public.component').then(
          (m) => m.BookingFormPublicComponent
        ),
    },

    {
      path: 'booking-form-public',
      loadComponent: () =>
        import('./pages-quoter/booking-form/public-form/booking-form-public.component').then(
          (m) => m.BookingFormPublicComponent
        ),
    },

    {   path:'login',component: LoginComponent},

     {   path:'**',redirectTo:'dashboard/quoter-main/quoter-list',pathMatch:'full'}

];
