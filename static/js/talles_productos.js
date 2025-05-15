document.addEventListener('DOMContentLoaded', function() {
  // Contenedores
  const numericSizesContainer = document.getElementById('numeric-sizes');
  const letterSizesContainer = document.getElementById('letter-sizes');
  
  // Generar talles numéricos del 1 al 8 (como reales)
  for (let size = 1; size <= 8; size++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-button';
    btn.dataset.size = size.toFixed(1); // Guardar como real
    btn.textContent = size; // Mostrar como entero
    numericSizesContainer.appendChild(btn);
  }

  // Generar talles numéricos del 18 al 47 en incrementos de 0.5 (como reales)
  for (let size = 18; size <= 47; size += 0.5) {
    const display = Number.isInteger(size) ? size : size.toFixed(1);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-button';
    btn.dataset.size = size.toFixed(1); // Guardar como real
    btn.textContent = display; // Mostrar como entero o decimal
    numericSizesContainer.appendChild(btn);
  }

  // Generar talles de letras
  ['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-button';
    btn.dataset.size = size;
    btn.textContent = size;
    letterSizesContainer.appendChild(btn);
  });

  // Manejo de selección de talles
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('size-button')) {
      const size = e.target.dataset.size;
      const input = document.getElementById('selected-sizes');
      const selected = new Set(input.value ? input.value.split(',') : []);
      
      if (selected.has(size)) {
        selected.delete(size);
        e.target.classList.remove('selected');
      } else {
        selected.add(size);
        e.target.classList.add('selected');
      }
      
      input.value = Array.from(selected).join(',');
    }
  });

  // Función para preseleccionar talles (nueva)
  function preselectSizes(selectedSizes) {
    if (!selectedSizes) return;
    
    const sizesArray = Array.isArray(selectedSizes) ? 
                      selectedSizes : 
                      selectedSizes.split(',');
    
    const allSizeButtons = document.querySelectorAll('.size-button');
    
    allSizeButtons.forEach(button => {
      if (sizesArray.includes(button.dataset.size)) {
        button.classList.add('selected');
      }
    });
    
    // Actualizar el campo oculto
    document.getElementById('selected-sizes').value = sizesArray.join(',');
  }

  // Llamar a preselectSizes cuando se cargue un producto para editar
  // Ejemplo: preselectSizes(['S', 'M', 'L']) o preselectSizes('S,M,L')
  // Esto debería llamarse desde tu función openEditModal
  window.preselectSizes = preselectSizes;
});