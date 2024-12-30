import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient,withInterceptors  } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../enviroment/environment';
import { SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2'

import { authInterceptor  } from '../app/Services/AuthService/auth.interceptor';
import { spinnerInterceptor } from './interceptors/spinner.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes,withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), importProvidersFrom([]), importProvidersFrom([SweetAlert2Module.forRoot()]) ,
    provideHttpClient(
        withInterceptors([authInterceptor,spinnerInterceptor]))
  
  ]
};
