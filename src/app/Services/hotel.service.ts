import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { HttpClient,  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HotelService {

  private baseUrl = `${environment.apiUrl}/hotels`;
  private tariffsUrl = `${environment.apiUrl}/tariffs`;

  constructor(private http: HttpClient) { }

  private normalizeHotel(hotel: any) {
    if (!hotel) {
      return hotel;
    }

    const normalizedHotel = { ...hotel };

    if (
      normalizedHotel.informacion_general &&
      typeof normalizedHotel.informacion_general === 'object' &&
      !Array.isArray(normalizedHotel.informacion_general) &&
      !(normalizedHotel.informacion_general instanceof Map)
    ) {
      normalizedHotel.informacion_general = new Map(Object.entries(normalizedHotel.informacion_general));
    }

    return normalizedHotel;
  }


// Get all hotels
  async getAllHotels() {
    try {
      const res = await firstValueFrom(this.http.get<any[]>(`${this.tariffsUrl}?type=hotel`));
      return res.map((hotel: any) => this.normalizeHotel(hotel));
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
  }

//create a hotel
  async addHotel(hotel: any) {
    try {
      if (hotel.informacion_general instanceof Map) {
        hotel.informacion_general = Object.fromEntries(hotel.informacion_general.entries());
      }
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
      const res = await firstValueFrom(this.http.get<any>(`${this.tariffsUrl}/${id}`));
      return this.normalizeHotel(res);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  }

  //obtener todos los servicios de un hotel
  async getServicesByHotelId(hotelId: string) {
    try {
      const hotel = await this.getHotelById(hotelId);
      return Array.isArray(hotel?.services) ? hotel.services : [];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  //agregar un servicio a un hotel
  async addServiceToHotel(hotelId: string, service: any): Promise<any> {
    try {
      return await firstValueFrom(this.http.post<any>(`${this.baseUrl}/${hotelId}/services`, service));
    } catch (error) {
      console.error('Error adding service to hotel:', error);
      throw error;
    }
  }

  //Actualizar un servicio de un hotel
  async updateService(hotelId: string, serviceId: string, service: any): Promise<any> {
    try {
      return await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${hotelId}/services/${serviceId}`, service));
    } catch (error) {
      console.error('Error updating service by hotel:', error);
      throw error;
    }
  }

  //eliminar un servicio de un hotel
  async deleteService(hotelId: string, serviceId: string): Promise<any> {
    try {
      return await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${hotelId}/services/${serviceId}`));
    } catch (error) {
      console.error('Error deleting service by hotel:', error);
      throw error;
    }
  }


}
