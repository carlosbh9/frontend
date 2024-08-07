import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroment/environment';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TransportService {


  private baseUrl = `${environment.apiUrl}/transports`


  constructor(private http: HttpClient) { }

  
  //GET ALL TRANSPORTS
  async getalltransport(): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>(this.baseUrl));
    } catch (error) {
      console.error('Error fetching transports:', error);
      throw error;
    }
  }

//add transport
async addtransport(transport: any): Promise<any> {
  try {
    return await firstValueFrom(this.http.post<any>(this.baseUrl, transport));
  } catch (error) {
    console.error('Error adding transport:', error);
    throw error;
  }
}

//update transport
async updatetransport(id: string,transport: any): Promise<any> {
  try {
    return await firstValueFrom(this.http.patch<any>(`${this.baseUrl}/${id}`, transport));
  } catch (error) {
    console.error('Error updating transport:', error);
    throw error;
  }
}

//delete transport
async deletetransport(id: string): Promise<any> {
  try {
    return await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/${id}`));
  } catch (error) {
    console.error('Error deleting transport:', error);
    throw error;
  }
}



}


