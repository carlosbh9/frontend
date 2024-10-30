import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroment/environment';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CalculatepricesService {

  private baseUrl = `${environment.apiUrl}/get-service-prices`

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
}
