import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  product = { name: '', price: 0, description: '', type: '', stock: 0 };

  constructor(private apiService: ApiService) {}

  addProduct(): void {
    this.apiService.addProduct(this.product).subscribe(() => {
      alert('Producto agregado exitosamente.');
    });
  }
}
