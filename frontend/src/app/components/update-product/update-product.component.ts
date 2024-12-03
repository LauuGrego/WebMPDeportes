import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-update-product',
  standalone: false,
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent {
  product = {id:0, name: '', price: 0, description: '', type: '', stock: 0 };

  constructor(private apiService: ApiService) {}

  addProduct(): void {
    this.apiService.updateProduct(this.product).subscribe(() => {
      alert('Producto actualizado exitosamente.');
    });
  }
}
