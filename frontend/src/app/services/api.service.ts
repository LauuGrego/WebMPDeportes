import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root', // Esto permite que el servicio se registre automáticamente
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000'; // Cambia por la URL de tu backend

  constructor(private http: HttpClient) {}
  // Métodos aquí
}
