import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroment/environment';
import { firstValueFrom, Observable,catchError, throwError ,of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculatepricesService {

  private baseUrl = `${environment.apiUrl}/get-service-prices`
  private baseUrl2 = `${environment.apiUrl}/createquoter`
  private dataDefault = './servicesDefault.json'
  constructor(private http: HttpClient) { }

  async calculatePrice(temp: any): Promise<any[]> {
  try {
    const res = await firstValueFrom(this.http.post<any>(this.baseUrl,temp));
    return res;
  } catch (error) {
    console.log('error al obtener los precios')
    throw error
  }
  }

   // Método para crear una cotización
    createQuoter(newQuoterData: any): Observable<any> {
    return this.http.post<any>(this.baseUrl2, newQuoterData).pipe(
      catchError((error) => {
        console.error('Error en createQuoter:', error);
        return throwError(() => error);
    
    }));
  }

  getData(): Observable<any> {
    return of(this.jsonData);  // `of` convierte el objeto en un Observable
  }

  private jsonData = {
    "services": [
      {
        "service_id": "675338d351e154dca7ff5714",
        "service_type": "extra"
      }
    ],
    "date": "",
    "number_paxs": [3, 6],
    "children_ages": [9, 6]
  };
}
