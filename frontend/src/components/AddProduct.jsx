import React, { useState } from 'react';
import axios from 'axios';

function AddProduct() {
    // Lógica del componente
}



const AddProduct = () => {
    const [product, setProduct] = useState({ name: "", type: "", price: "", description: "", stock: "" });
  
    const handleAdd = async () => {
      await axios.post("http://localhost:8000/agregar_producto", product);
      alert("Producto agregado");
    };
  
    return (
      <div>
        <h2>Agregar Producto</h2>
        <input type="text" placeholder="Nombre" onChange={(e) => setProduct({ ...product, name: e.target.value })} />
        <input type="text" placeholder="Tipo" onChange={(e) => setProduct({ ...product, type: e.target.value })} />
        <input type="number" placeholder="Precio" onChange={(e) => setProduct({ ...product, price: e.target.value })} />
        <textarea placeholder="Descripción" onChange={(e) => setProduct({ ...product, description: e.target.value })} />
        <input type="number" placeholder="Stock" onChange={(e) => setProduct({ ...product, stock: e.target.value })} />
        <button onClick={handleAdd}>Agregar</button>
      </div>
    );
  };
  
  export default AddProduct; // Exporta el componente