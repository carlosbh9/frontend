import { Injectable } from '@angular/core';
import { environment } from '../../enviroment/environment';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private baseUrl = `${environment.apiUrl}/restaurants`

  constructor(private http: HttpClient) { }

   // Obtener todos los restaurantes
   async getAllRestaurants(): Promise<any[]> {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.error('Error while trying to get all Restaurants', error);
      throw error;
    }
  }

  // getAllRestaurants(): Observable<Restaurant[]> {
  //   return this.http.get<Restaurant[]>(this.baseUrl).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  // private handleError(error: HttpErrorResponse): Observable<never> {
  //   console.error('Error fetching restaurants:', error);
  //   return throwError('Error fetching restaurants. Please try again later.');
  // }

  // Agregar un nuevo restaurante
  async addRestaurant(restaurant: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, restaurant));
      return res;
    } catch (error) {
      console.error('Error while trying to add Restaurant', error);
      throw error;
    }
  }

  // Actualizar un restaurante existente
  async updateRestaurant(id: string, restaurant: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, restaurant));
      return res;
    } catch (error) {
      console.error('Error while trying to update Restaurant', error);
      throw error;
    }
  }

  // Eliminar un restaurante
  async deleteRestaurant(id: string): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.error('Error while trying to delete Restaurant', error);
      throw error;
    }
  }
}
