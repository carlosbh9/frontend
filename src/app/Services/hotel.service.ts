import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroment/environment';
import { HttpClient,  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HotelService {

  private baseUrl = `${environment.apiUrl}/hotels`;

  constructor(private http: HttpClient) { }


// Get all hotels
  async getAllHotels() {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(this.baseUrl));
      return res;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
  }

//create a hotel
  async addHotel(hotel: any) {
    try {
      const res = await firstValueFrom(this.http.post<any>(this.baseUrl, hotel));
      return res;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  }


  //update a hotel
  async updateHotel(id: string, hotel: any) {
    try {
      if (hotel.informacion_general) {
        hotel.informacion_general = Array.from(hotel.informacion_general.entries());
      }
      const res = await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, hotel));
     
      return res;
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  }

  //delete a hotel
  async deleteHotel(id: string) {
    try {
      const res = await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
      return res;
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  }

  //get a hotel by id
  async getHotelById(id: string) {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
      // Convert `informacion_general` Map to an object (if it's a Map)
      if (res.informacion_general instanceof Map) {
        res.informacion_general = Object.fromEntries(res.informacion_general);
      }
      return res;
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  }
}
