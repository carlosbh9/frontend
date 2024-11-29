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

export const routes: Routes = [
   // , canActivate: [authGuard] ,data:{role:'admin'}
    {   path:'dashboard',component: LayoutComponent,
        
        children:[
            {   path:'train', component: TrainComponent},
            {   path:'entrance', component:EntrancesComponent ,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'expeditions', component: ExpeditionsComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path: 'experiences', component: ExperiencesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path: 'restaurant', component: RestaurantComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'guides', component:GuidesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'operators', component : OperatorsComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'services-operators/:id',component: OperatorsServicesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'train', component:TrainComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'services-train/:id',component: TrainServicesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'transport', component:TransportComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'hotel', component: HotelComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'services-hotel/:id',component: HotelServicesComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'lima-gourmet', component:LimaGourmetComponent,canActivate: [authGuard] ,data:{role:['OPE','ventas']}},
            {   path:'quoter-main',component: QuoterComponent,
                canActivate: [authGuard] ,data:{role:['TD','ventas']},
                children: [
                    {   path:'quoter-form', component:QuoterFormComponent}, 
                    {   path:'quoter-list', component:QuoterListComponent},
                    {   path:'quoter-edit/:id', component:QuoterFormComponent},
                    {   path:'master-quoter',component:MasterQuoterComponent},
                    {   path:'master-quoter-list', component:MasterQuoterListComponent},
                    {   path:'master-quoter-edit/:id',component:MasterQuoterComponent}
                ]
            }
            
        ]
    },
    {   path:'login',component: LoginComponent},

    {   path:'**',redirectTo:'dashboard',pathMatch:'full'}

];
