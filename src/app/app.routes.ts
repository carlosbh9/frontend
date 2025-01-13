import { Routes } from '@angular/router';
import { HotelComponent } from './pages/hotel/hotel.component';
import { TrainComponent } from './pages/train/train.component';
import {LayoutComponent} from './components/layout/layout.component';
import { HeaderComponent } from './components/header/header.component';
import { Component } from '@angular/core';
import { RestaurantComponent } from './pages/restaurant/restaurant.component';
import { EntrancesComponent } from './pages/entrances/entrances.component';
import { ExpeditionsComponent } from './pages/expeditions/expeditions.component';
import { ExperiencesComponent } from './pages/experiences/experiences.component';
import { GuidesComponent } from './pages/guides/guides.component';
import { OperatorsComponent } from './pages/operators/operators.component';
import { TransportComponent } from './pages/transport/transport.component';
import { OperatorsServicesComponent } from './pages/operators-services/operators-services.component';
import { TrainServicesComponent } from './pages/train-services/train-services.component';
import { HotelServicesComponent } from './pages/hotel-services/hotel-services.component';
import { QuoterComponent } from './pages-quoter/quoter/quoter.component';
import { QuoterFormComponent } from './pages-quoter/quoter-form/quoter-form.component';
import { LoginComponent } from './login/login.component';
import { QuoterListComponent } from './pages-quoter/quoter-list/quoter-list.component';
import { MasterQuoterComponent } from './pages-quoter/master-quoter/master-quoter.component';
import { LimaGourmetComponent } from './pages/lima-gourmet/lima-gourmet.component';
import { MasterQuoterListComponent } from './pages-quoter/master-quoter-list/master-quoter-list.component';

import { authGuard } from '../app/Services/AuthService/auth.guard'
import { ExtraComponent } from './pages/extra/extra.component';

export const routes: Routes = [
   // , canActivate: [authGuard] ,data:{role:'admin'}
    // {   path:'dashboard',component: LayoutComponent,canActivate: [authGuard],
    //     data:{role:['OPE','ventas','TD']},
    //     children:[
    //         {   path:'train', component: TrainComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'extra',component: ExtraComponent ,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'entrance', component:EntrancesComponent ,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'expeditions', component: ExpeditionsComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path: 'experiences', component: ExperiencesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path: 'restaurant', component: RestaurantComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'guides', loadComponent: () => import('./pages/guides/guides.component').then(m => m.GuidesComponent),canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'operators', component : OperatorsComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'services-operators/:id',component: OperatorsServicesComponent},
    //         {   path:'train', component:TrainComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'services-train/:id',component: TrainServicesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'transport', component:TransportComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'hotel', component: HotelComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'services-hotel/:id',component: HotelServicesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'lima-gourmet', component:LimaGourmetComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas','TD']}},
    //         {   path:'quoter-main',component: QuoterComponent,
    //             canActivate: [authGuard] ,data:{role:['TD','ventas']},
    //             children: [
    //                 {   path:'quoter-form', component:QuoterFormComponent}, 
    //                 {   path:'quoter-list', component:QuoterListComponent},
    //                 {   path:'quoter-edit/:id', component:QuoterFormComponent},
    //                 {   path:'master-quoter',component:MasterQuoterComponent},
    //                 {   path:'master-quoter-list', component:MasterQuoterListComponent},
    //                 {   path:'master-quoter-edit/:id',component:MasterQuoterComponent}
    //             ]
    //         }
            
    //     ]
    // },
    {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/layout/layout.component').then((m) => m.LayoutComponent),
        canActivate: [authGuard],
        data: { role: ['OPE', 'ventas', 'TD'] },
        children: [
          {
            path: 'train',
            loadComponent: () =>
              import('./pages/train/train.component').then((m) => m.TrainComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'extra',
            loadComponent: () =>
              import('./pages/extra/extra.component').then((m) => m.ExtraComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'entrance',
            loadComponent: () =>
              import('./pages/entrances/entrances.component').then((m) => m.EntrancesComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'expeditions',
            loadComponent: () =>
              import('./pages/expeditions/expeditions.component').then(
                (m) => m.ExpeditionsComponent
              ),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'experiences',
            loadComponent: () =>
              import('./pages/experiences/experiences.component').then(
                (m) => m.ExperiencesComponent
              ),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'restaurant',
            loadComponent: () =>
              import('./pages/restaurant/restaurant.component').then(
                (m) => m.RestaurantComponent
              ),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'guides',
            loadComponent: () =>
              import('./pages/guides/guides.component').then((m) => m.GuidesComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'operators',
            loadComponent: () =>
              import('./pages/operators/operators.component').then((m) => m.OperatorsComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
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
              ),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'transport',
            loadComponent: () =>
              import('./pages/transport/transport.component').then((m) => m.TransportComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'hotel',
            loadComponent: () =>
              import('./pages/hotel/hotel.component').then((m) => m.HotelComponent),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'services-hotel/:id',
            loadComponent: () =>
              import('./pages/hotel-services/hotel-services.component').then(
                (m) => m.HotelServicesComponent
              ),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'lima-gourmet',
            loadComponent: () =>
              import('./pages/lima-gourmet/lima-gourmet.component').then(
                (m) => m.LimaGourmetComponent
              ),
            canActivate: [authGuard],
            data: { role: ['OPE', 'ventas', 'TD'] },
          },
          {
            path: 'quoter-main',
            loadComponent: () =>
              import('./pages-quoter/quoter/quoter.component').then((m) => m.QuoterComponent),
            canActivate: [authGuard],
            data: { role: ['TD', 'ventas'] },
            children: [
              {
                path: 'quoter-form',
                loadComponent: () =>
                  import('./pages-quoter/quoter-form/quoter-form.component').then(
                    (m) => m.QuoterFormComponent
                  ),
              },
              {
                path: 'quoter-list',
                loadComponent: () =>
                  import('./pages-quoter/quoter-list/quoter-list.component').then(
                    (m) => m.QuoterListComponent
                  ),
              },
              {
                path: 'quoter-edit/:id',
                loadComponent: () =>
                  import('./pages-quoter/quoter-form/quoter-form.component').then(
                    (m) => m.QuoterFormComponent
                  ),
              },
              {
                path: 'master-quoter',
                loadComponent: () =>
                  import('./pages-quoter/master-quoter/master-quoter.component').then(
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
                  import('./pages-quoter/master-quoter/master-quoter.component').then(
                    (m) => m.MasterQuoterComponent
                  ),
              },
            ],
          },
        ],
    },
    {   path:'login',component: LoginComponent},

     {   path:'**',redirectTo:'dashboard/quoter-main/quoter-list',pathMatch:'full'}

];
