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
                path: 'quoter-form',
                loadComponent: () =>
                  import('./pages-quoter/quoter/quoter-form/quoter-form.component').then(
                    (m) => m.QuoterFormComponent
                  ),
              },
              {
                path: 'quoter-list',
                loadComponent: () =>
                  import('./pages-quoter/quoter/quoter-list/contacts/quoter-list.component').then(
                    (m) => m.QuoterListComponent
                  ),
              },
              {
                path: 'quoter-edit/:id',
                loadComponent: () =>
                  import('./pages-quoter/quoter/quoter-form/quoter-form.component').then(
                    (m) => m.QuoterFormComponent
                  ),
              },
              {
                path: 'master-quoter',
                loadComponent: () =>
                  import('./pages-quoter/master-quoter-list/master-quoter/master-quoter.component').then(
                    (m) => m.MasterQuoterComponent
                  ),
              },
              {
                path: 'master-quoter-list',
                loadComponent: () =>
                  import('./pages-quoter/master-quoter-list/master-quoter-list.component').then(
                    (m) => m.MasterQuoterListComponent
                  ),
              },
              {
                path: 'master-quoter-edit/:id',
                loadComponent: () =>
                  import('./pages-quoter/master-quoter-list/master-quoter/master-quoter.component').then(
                    (m) => m.MasterQuoterComponent
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
          {
            path: 'tariff',
            loadComponent: () => import('./pages/menu-tariff/menu-tariff.component').then((m) => m.MenuTariffComponent ),
            canActivate: [authGuard],
            data: { permission: 'view_tariff'},
            children:[
              {
                path: 'train',
                loadComponent: () =>
                  import('./pages/train/train.component').then((m) => m.TrainComponent)

              },
              {
                path: 'extra',
                loadComponent: () =>
                  import('./pages/extra/extra.component').then((m) => m.ExtraComponent)
              },
              {
                path: 'entrance',
                loadComponent: () =>
                  import('./pages/entrances/entrances.component').then((m) => m.EntrancesComponent)
              },
              {
                path: 'expeditions',
                loadComponent: () =>
                  import('./pages/expeditions/expeditions.component').then(
                    (m) => m.ExpeditionsComponent
                  )
              },
              {
                path: 'experiences',
                loadComponent: () =>
                  import('./pages/experiences/experiences.component').then(
                    (m) => m.ExperiencesComponent
                  )
              },
              {
                path: 'restaurant',
                loadComponent: () =>
                  import('./pages/restaurant/restaurant.component').then(
                    (m) => m.RestaurantComponent
                  )
              },
              {
                path: 'guides',
                loadComponent: () =>
                  import('./pages/guides/guides.component').then((m) => m.GuidesComponent)
              },
              {
                path: 'operators',
                loadComponent: () =>
                  import('./pages/operators/operators.component').then((m) => m.OperatorsComponent)
              },
              {
                path: 'services-operators/:id',
                loadComponent: () =>
                  import('./pages/operators-services/operators-services.component').then(
                    (m) => m.OperatorsServicesComponent
                  ),
              },
              {
                path: 'services-train/:id',
                loadComponent: () =>
                  import('./pages/train-services/train-services.component').then(
                    (m) => m.TrainServicesComponent
                  )
              },
              {
                path: 'transport',
                loadComponent: () =>
                  import('./pages/transport/transport.component').then((m) => m.TransportComponent)
              },
              {
                path: 'hotel',
                loadComponent: () =>
                  import('./pages/hotel/hotel.component').then((m) => m.HotelComponent)
              },
              {
                path: 'services-hotel/:id',
                loadComponent: () =>
                  import('./pages/hotel-services/hotel-services.component').then(
                    (m) => m.HotelServicesComponent
                  )
              },
              {
                path: 'lima-gourmet',
                loadComponent: () =>
                  import('./pages/lima-gourmet/lima-gourmet.component').then(
                    (m) => m.LimaGourmetComponent
                  )
              }
            ]
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
