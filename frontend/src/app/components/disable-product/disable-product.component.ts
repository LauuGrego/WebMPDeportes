import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-disable-product',
  standalone: false,
  templateUrl: './disable-product.component.html',
  styleUrls: ['./disable-product.component.css']
})
export class DisableProductComponent {
  productId = 0;

  constructor(private apiService: ApiService) {}

  disableProduct(): void {
    this.apiService.disableProduct(this.productId).subscribe(() => {
      alert('Producto deshabilitado.');
    });
  }
}
