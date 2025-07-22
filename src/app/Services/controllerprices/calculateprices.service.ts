import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { firstValueFrom, Observable,catchError, throwError ,of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculatepricesService {

  private baseUrl = `${environment.apiUrl}/get-service-prices`
  private baseUrl2 = `${environment.apiUrl}/createquoter`
  //private baseUrl2 = `${environment.apiUrl}/quoter`
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
  //   createQuoter(newQuoterData: any): Observable<any> {
  //   return this.http.post<any>(this.baseUrl2, newQuoterData).pipe(
  //     catchError((error) => {
  //       console.error('Error en createQuoter:', error);
  //       return throwError(() => error);
    
  //   }));
  // }

 

 
}
