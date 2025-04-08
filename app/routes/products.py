from fastapi import APIRouter, HTTPException, Depends, Request, File, UploadFile, Form
from typing import List, Optional
from app.models.product import Product, ProductCreate, ProductUpdate
from app.db.client import db_client
from bson import ObjectId
from .users_JWT_auth import admin_only
from app.models.user import User
import re
from fastapi.responses import JSONResponse
import random
import os
from pathlib import Path

router = APIRouter(prefix="/productos", tags=["Products"])

# Colección de productos y categorías
products_collection = db_client.products
categories_collection = db_client.categories

# Define the folder to store product images
IMAGE_FOLDER = Path("products_image")
IMAGE_FOLDER.mkdir(exist_ok=True)  # Create the folder if it doesn't exist

# Obtener producto por ID
def get_product_by_id(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["id"] = str(product["_id"])  # Asigna el id como string
        del product["_id"]                 # Elimina el campo _id
        product.pop("image", None)         # Excluir el campo 'image' del producto
    return product


@router.get("/obtener_por_id/{product_id}")
async def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return JSONResponse(content=product)


# Agregar productos
@router.post("/agregar", response_model=Product)
async def create_product(
    name: str = Form(...),
    type: str = Form(...),
    size: str = Form(...),
    description: str = Form(...),
    stock: int = Form(...),
    category_name: str = Form(...),
    image: UploadFile = File(...),
    admin: User = Depends(admin_only)
):
    # Debugging: Log incoming data
    print("Product Data:", name, type, size, description, stock, category_name)
    print("Image Filename:", image.filename)

    try:
        # Normalize input
        name = name.strip().title()
        type = type.strip().title()
        category_name = category_name.strip().title()
        size_list = [s.strip().title() for s in size.split(",") if s.strip()]

        # Save the image to the products_image folder
        image_filename = f"{name.replace(' ', '_')}.jpg"
        image_path = IMAGE_FOLDER / image_filename
        with open(image_path, "wb") as f:
            f.write(await image.read())

        # Check if the category exists
        category = categories_collection.find_one({"name": category_name})
        if not category:
            raise HTTPException(status_code=404, detail=f"La categoría '{category_name}' no existe.")

        # Prepare the product dictionary
        product_dict = {
            "name": name,
            "type": type,
            "size": size_list,
            "description": description,
            "stock": stock,
            "category_id": str(category["_id"]),
            "image": str(image_path),  # Save the image path in the database
        }

        # Insert the product into the database
        result = products_collection.insert_one(product_dict)
        product_dict["_id"] = str(result.inserted_id)
        product_dict["id"] = product_dict.pop("_id")

        # Exclude the image field from the response
        product_dict.pop("image", None)

        return product_dict

    except Exception as e:
        print("Error al procesar el producto:", e)
        raise HTTPException(status_code=422, detail=str(e))


@router.put("/actualizar/{product_id}", response_model=Product)
async def modify_product(
    product_id: str,
    name: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    category_name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    admin: User = Depends(admin_only)
):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    update_data = {}

    # Update fields if provided
    if name:
        update_data["name"] = name.strip().title()
    if type:
        update_data["type"] = type.strip().title()
    if size:
        update_data["size"] = [s.strip().title() for s in size.split(",") if s.strip()]
    if description:
        update_data["description"] = description.strip()
    if stock is not None:
        update_data["stock"] = stock
    if category_name:
        category_name = category_name.strip().title()
        category = categories_collection.find_one({"name": category_name})
        if not category:
            raise HTTPException(status_code=404, detail=f"La categoría '{category_name}' no existe.")
        update_data["category_id"] = str(category["_id"])

    # Handle image update
    if image:
        image_filename = f"{(update_data.get('name') or db_product['name']).replace(' ', '_')}.jpg"
        image_path = IMAGE_FOLDER / image_filename
        with open(image_path, "wb") as f:
            f.write(await image.read())
        update_data["image"] = str(image_path)

    # Update the product in the database
    products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})

    return get_product_by_id(product_id)


# Función para barajar productos aleatoriamente (Fisher-Yates)
def shuffle_products(products: List[dict]) -> List[dict]:
    shuffled = products[:]
    random.shuffle(shuffled)
    return shuffled

# Buscar productos por nombre, tipo o categoría
@router.get("/buscar", response_model=List[Product])
async def search_products(name: Optional[str] = None, type: Optional[str] = None, category: Optional[str] = None):
    if not name and not type and not category:
        raise HTTPException(status_code=400, detail="Al menos uno de los parámetros 'name', 'type' o 'category' es requerido.")

    query = []

    def build_regex_query(field: str, value: str):
        words = value.split()
        regex_query = ".*".join([re.escape(word) for word in words])
        return {field: {"$regex": regex_query, "$options": "i"}}

    if name:
        query.append(build_regex_query("name", name))

    if type:
        query.append(build_regex_query("type", type))

    if category:
        category_doc = categories_collection.find_one({"name": category.strip().title()})
        if category_doc:
            query.append({"category_id": str(category_doc["_id"])})
        else:
            raise HTTPException(status_code=404, detail=f"La categoría '{category}' no existe.")

    products = list(products_collection.find({"$or": query}))

    if not products:
        # If no products found, search by individual words
        query = []
        if name:
            for word in name.split():
                query.append(build_regex_query("name", word))
        if type:
            for word in type.split():
                query.append(build_regex_query("type", word))
        products = list(products_collection.find({"$or": query}))

    for product in products:
        product["_id"] = str(product["_id"])
        product["id"] = product.pop("_id")

    shuffled_products = shuffle_products(products)
    return shuffled_products

# Endpoint para redirigir a WhatsApp con un mensaje predefinido
@router.get("/whatsapp_redirect")
async def whatsapp_redirect(product_name: str):
    # Find the product by name
    product = products_collection.find_one({"name": {"$regex": f"^{re.escape(product_name)}$", "$options": "i"}})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    # Get the product image path
    image_path = product.get("image")
    if not image_path or not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Imagen del producto no encontrada.")
    
    # Construct the WhatsApp message
    message = f"¡Hola! Quiero saber más info acerca de {product_name}."
    whatsapp_url = f"https://wa.me/3445417684?text={message}"
    
    # Return the WhatsApp URL and the image path
    return {
        "url": whatsapp_url,
        "image_path": image_path
    }


# Deshabilitar productos
@router.put("/deshabilitar/{product_id}", response_model=Product)
async def disable_product(product_id: str, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    # Deshabilitar el producto (poner el stock en 0 y vaciar la lista de size)
    updated_product = products_collection.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": {"stock": 0, "size": []}},  # Set stock to 0 and clear size list
        return_document=True  # Esto devuelve el documento actualizado
    )
    
    if updated_product:
        # Convertir ObjectId a string y asignarlo como 'id'
        updated_product["_id"] = str(updated_product["_id"])  # Convertir _id a string
        updated_product["id"] = updated_product.pop("_id")  # Cambiar _id a id
        
        # Eliminar cualquier campo no necesario
        return {key: updated_product[key] for key in updated_product if key != "_id"}
    else:
        raise HTTPException(status_code=500, detail="Error al deshabilitar el producto.")
    
    return ("producto deshabilidato con exito")


#Listar Productos
@router.get("/listar")
async def list_products():
    # Se buscan todos los productos, incluyendo el _id
    products = list(products_collection.find({}))
    
    # Verificar si se encontraron productos
    if not products:
        raise HTTPException(status_code=404, detail="No se encontraron productos.")
    
    # Convertir el _id de ObjectId a string antes de devolverlo
    for product in products:
        product["id"] = str(product["_id"])  # Convertir el ObjectId a string
        product["image"] = "Imagen omitida por razones de tamaño"  # Placeholder para la imagen
    
    # Eliminar el campo _id ya que ya lo hemos convertido a "id"
    products = [{"id": product["id"], **{key: value for key, value in product.items() if key != "_id"}} for product in products]
    
    # Barajar los productos antes de devolverlos
    shuffled_products = shuffle_products(products)
    return shuffled_products

@router.get("/listar/tipos")
async def list_product_types():
    types = products_collection.distinct("type")
    types = [t.strip().title() for t in types if t]
    return types

@router.put("/actualizar_talles")
async def update_product_sizes():
    products = list(products_collection.find({}))
    if not products:
        raise HTTPException(status_code=404, detail="No se encontraron productos.")

    for product in products:
        if "size" in product and isinstance(product["size"], list):
            updated_sizes = []
            for size in product["size"]:
                try:
                    # Attempt to convert size to a float; only add if successful
                    numeric_size = float(size)
                    updated_sizes.append(f"{numeric_size:.1f}")
                except ValueError:
                    # Ignore non-numeric sizes
                    continue
            if updated_sizes:  # Only update if there are valid numeric sizes
                products_collection.update_one(
                    {"_id": product["_id"]},
                    {"$set": {"size": updated_sizes}}
                )

    return {"message": "Talles numéricos actualizados correctamente para todos los productos."} 