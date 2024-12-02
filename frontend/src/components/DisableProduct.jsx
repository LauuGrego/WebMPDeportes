import React, { useState } from 'react';
import axios from 'axios';

const DisableProduct = () => {
    const [productId, setProductId] = useState("");
  
    const handleDisable = async () => {
      await axios.delete(`http://localhost:8000/deshabilitar_producto/${productId}`);
      alert("Producto deshabilitado");
    };
  
    return (
      <div>
        <h2>Deshabilitar Producto</h2>
        <input type="text" placeholder="ID del Producto" onChange={(e) => setProductId(e.target.value)} />
        <button onClick={handleDisable}>Deshabilitar</button>
      </div>
    );
  };
  