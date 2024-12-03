import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service'; 

@Component({
  selector: 'app-search-products',
  standalone: false,
  templateUrl: './search-products.component.html',
  styleUrls: ['./search-products.component.css']
})
export class SearchProductsComponent implements OnInit {
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.apiService.getProducts(this.filters).subscribe((data) => {
      this.products = data;
    });
  }

  onFilterChange(): void {
    this.getProducts();
  }
}
