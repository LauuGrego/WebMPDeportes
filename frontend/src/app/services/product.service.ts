import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000'; // URL de tu backend

  constructor(private http: HttpClient) {}
  
  getProducts(filters?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filtrar_busqueda`, {
      params: filters,
    });
  }
  
}
