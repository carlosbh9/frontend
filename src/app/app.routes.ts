import { Routes } from '@angular/router';
import { HotelComponent } from './pages/hotel/hotel.component';
import { TrainComponent } from './pages/train/train.component';
import {LayoutComponent} from './components/layout/layout.component';


export const routes: Routes = [
    {
        path:'',
        component: LayoutComponent,
        children: [
            {
        path:'hotel',
        component: HotelComponent
    },{
        path:'train',
        component: TrainComponent
    }
        ]
    },
];
