import React, { useState } from 'react';
import axios from 'axios';

const UpdateProduct = () => {
    const [productId, setProductId] = useState("");
    const [updates, setUpdates] = useState({ name: "", type: "", price: "", description: "", stock: "" });
  
    const handleUpdate = async () => {
      await axios.put(`http://localhost:8000/actualizar_producto/${productId}`, updates);
      alert("Producto actualizado");
    };
  
    return (
      <div>
        <h2>Actualizar Producto</h2>
        <input type="text" placeholder="ID del Producto" onChange={(e) => setProductId(e.target.value)} />
        <input type="text" placeholder="Nuevo Nombre" onChange={(e) => setUpdates({ ...updates, name: e.target.value })} />
        <input type="text" placeholder="Nuevo Tipo" onChange={(e) => setUpdates({ ...updates, type: e.target.value })} />
        <input type="number" placeholder="Nuevo Precio" onChange={(e) => setUpdates({ ...updates, price: e.target.value })} />
        <textarea placeholder="Nueva Descripción" onChange={(e) => setUpdates({ ...updates, description: e.target.value })} />
        <input type="number" placeholder="Nuevo Stock" onChange={(e) => setUpdates({ ...updates, stock: e.target.value })} />
        <button onClick={handleUpdate}>Actualizar</button>
      </div>
    );
  };
  