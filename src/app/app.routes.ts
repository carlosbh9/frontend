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

export const routes: Routes = [

    {   path:'',component: LayoutComponent,
        children:[
            {   path:'train', component: TrainComponent},
            {   path:'entrance', component:EntrancesComponent},
            {   path:'expeditions', component: ExpeditionsComponent},
            {   path: 'experiences', component: ExperiencesComponent},
            {   path: 'restaurant', component: RestaurantComponent},
            {   path:'guides', component:GuidesComponent},
            {   path:'operators', component : OperatorsComponent},
           // {   path:'operators/:id/services',component: OperatorsServicesComponent},
            {   path:'services-operators/:id',component: OperatorsServicesComponent},
            {   path:'train', component:TrainComponent},
            {   path:'services-train/:id',component: TrainServicesComponent},
            {   path:'transport', component:TransportComponent},
            {   path:'hotel', component: HotelComponent},
            {   path:'services-hotel/:id',component: HotelServicesComponent},
            {   path:'quoter-main',component: QuoterComponent,
                children: [
                    {   path:'quoter-form', component:QuoterFormComponent} 
                ]
            }
        ]
    }

    //{   path:'**',component: LayoutComponent}

];
