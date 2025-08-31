// export_products.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const XLSX = require('xlsx');

const uri = process.env.MONGO_URI || 'mongodb+srv://lautaro_grego:Grego.121103@marcapasosdeportes.p9vbo.mongodb.net/?retryWrites=true&w=majority&appName=MarcaPasosDeportes';
const dbName = process.env.DB_NAME || 'MarcaPasosDeportes';
const outFile = process.env.OUTPUT_FILE || 'productos.xlsx';

async function exportProducts() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const productsColl = db.collection('products');
    const categoriesColl = db.collection('categories');

    // Prefetch categorías para evitar N queries
    const cats = await categoriesColl.find({}).toArray();
    const catMap = {};
    cats.forEach(c => { catMap[String(c._id)] = c.name; });

    // Cursor para manejo de grandes volúmenes
    const cursor = productsColl.find({}).batchSize(1000);
    // Cabecera ordenada
    const headers = ['id','name','type','size','description','stock','category_id','category_name','price','image_url'];
    const rows = [headers];

    await cursor.forEach(p => {
      const id = p._id ? String(p._id) : '';
      const name = p.name || '';
      const type = p.type || '';
      const size = Array.isArray(p.size) ? p.size.join('; ') : (p.size || '');
      const description = p.description || '';
      const stock = (p.stock !== undefined && p.stock !== null) ? p.stock : '';
      const category_id = p.category_id ? String(p.category_id) : '';
      const category_name = catMap[category_id] || '';
      const price = (p.price !== undefined && p.price !== null) ? Number(p.price) : '';
      const image_url = p.image_path || p.image_url || '';

      rows.push([id, name, type, size, description, stock, category_id, category_name, price, image_url]);
    });

    // Crear hoja y libro
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, outFile);

    console.log(`✅ Exportado ${rows.length-1} productos a ${outFile}`);
  } catch (err) {
    console.error('Error exportando productos:', err);
  } finally {
    await client.close();
  }
}

exportProducts();
