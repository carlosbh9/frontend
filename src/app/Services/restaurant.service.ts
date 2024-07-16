import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private baseUrl = `${environment.apiUrl}/restaurants`

  constructor(private http: HttpClient) { }
}
