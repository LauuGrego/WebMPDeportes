import React, { useState } from "react";
import axios from "axios";

const SearchProducts = () => {
  const [filters, setFilters] = useState({ name: "", type: "", priceRange: "" });
  const [products, setProducts] = useState([]);

  const handleSearch = async () => {
    const response = await axios.get("http://localhost:8000/filtrar_busqueda", {
      params: filters,
    });
    setProducts(response.data);
  };

  return (
    <div>
      <h2>Buscar Productos</h2>
      <input
        type="text"
        placeholder="Nombre"
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Tipo"
        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
      />
      <select onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}>
        <option value="">Rango de Precio</option>
        <option value="0-10000">0 - 10,000</option>
        <option value="10000-50000">10,000 - 50,000</option>
        <option value="50000-100000">50,000 - 100,000</option>
      </select>
      <button onClick={handleSearch}>Buscar</button>

      <div>
        {products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>Tipo: {product.type}</p>
            <p>Precio: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchProducts;
