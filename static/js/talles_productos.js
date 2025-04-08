// Generar talles numéricos del 1 al 8
const numericSizesContainer = document.getElementById('numeric-sizes');
for (let size = 1; size <= 8; size++) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'size-button';
  btn.dataset.size = size;
  btn.textContent = size;
  numericSizesContainer.appendChild(btn);
}

// Generar talles numéricos del 22 al 47 en incrementos de 0.5
for (let size = 18; size <= 47; size += 0.5) {
  const display = Number.isInteger(size) ? size : size.toFixed(1);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'size-button';
  btn.dataset.size = display;
  btn.textContent = display;
  numericSizesContainer.appendChild(btn);
}

// Generar talles de letras
const letterSizesContainer = document.getElementById('letter-sizes');
['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'size-button';
  btn.dataset.size = size;
  btn.textContent = size;
  letterSizesContainer.appendChild(btn);
});

// Manejo de selección de talles
document.addEventListener('click', function (e) {
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