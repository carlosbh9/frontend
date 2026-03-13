// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from '../../enviroments/environment';
// import { firstValueFrom } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class EntrancesService {

//   private baseUrl = `${environment.apiUrl}/entrances`

//   constructor(private http: HttpClient) { }

// //  private baseUrl = environment.apiUrl;
// async getAllEntrances(): Promise<any[]> {
//   try {
//     const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
//     return res;
//   } catch (error) {
//     console.log('Error while trying to get all Entrances: ', error);
//     throw error;
//   }
// }

// // Método para obtener una entrada por ID
// async getEntranceById(id: string): Promise<any> {
//   try {
//     const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
//     return res;
//   } catch (error) {
//     console.log('Error while trying to get Entrance by ID: ', error);
//     throw error;
//   }
// }

// // Método para crear una nueva entrada
// async createEntrance(entrance: any): Promise<any> {
//   try {
//     const res = await firstValueFrom(this.http.post<any>(this.baseUrl, entrance));
//     return res;
//   } catch (error) {
//     console.log('Error while trying to create Entrance: ', error);
//     throw error;
//   }
// }

// // Método para actualizar una entrada existente
// async updateEntrance(id: string, entrance: any): Promise<any> {
//   try {
//     const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, entrance));
//     return res;
//   } catch (error) {
//     console.log('Error while trying to update Entrance: ', error);
//     throw error;
//   }
// }

// // Método para eliminar una entrada
// async deleteEntrance(id: string): Promise<any> {
//   try {
//     const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
//     return res;
//   } catch (error) {
//     console.log('Error while trying to delete Entrance: ', error);
//     throw error;
//   }
// }
// }
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface EntranceChildRate {
  pp: number;
  upTo: number | null;
}

export interface Entrance {
  _id?: string;
  description: string;
  price_pp: number;
  childRate: EntranceChildRate;
  take_note: string;
  year: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntrancesService {
  private readonly baseUrl = `${environment.apiUrl}/entrances`;

  constructor(private readonly http: HttpClient) {}

  async getAllEntrances(): Promise<Entrance[]> {
    return firstValueFrom(this.http.get<Entrance[]>(this.baseUrl));
  }

  async getEntranceById(id: string): Promise<Entrance> {
    return firstValueFrom(this.http.get<Entrance>(`${this.baseUrl}/${id}`));
  }

  async createEntrance(entrance: Entrance): Promise<Entrance> {
    return firstValueFrom(this.http.post<Entrance>(this.baseUrl, entrance));
  }

  async updateEntrance(id: string, entrance: Entrance): Promise<Entrance> {
    return firstValueFrom(this.http.patch<Entrance>(`${this.baseUrl}/${id}`, entrance));
  }

  async deleteEntrance(id: string): Promise<{ ok?: boolean; message?: string }> {
    return firstValueFrom(this.http.delete<{ ok?: boolean; message?: string }>(`${this.baseUrl}/${id}`));
  }
}
