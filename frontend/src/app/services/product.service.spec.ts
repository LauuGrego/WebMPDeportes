import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8000'; // URL de tu backend FastAPI

  constructor(private http: HttpClient) {}

  // Obtener productos con filtros
  getProducts(filters?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filtrar_busqueda`, {
      params: filters,
    });
  }

  // Crear un producto
  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/agregar_producto`, product);
  }

  // Actualizar un producto
  updateProduct(productId: number, product: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/actualizar_producto/${productId}`,
      product
    );
  }

  // Deshabilitar un producto
  disableProduct(productId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/deshabilitar_producto/${productId}`,
      {}
    );
  }
}
