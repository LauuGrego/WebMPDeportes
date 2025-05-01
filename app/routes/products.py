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
from fastapi.responses import StreamingResponse
from io import BytesIO
import base64  # Importar para codificar imágenes en Base64
from cloudinary.uploader import upload as cloudinary_upload


router = APIRouter(prefix="/productos", tags=["Products"])


# Colección de productos y categorías
products_collection = db_client.products
categories_collection = db_client.categories


# Define the folder to store product images
IMAGE_FOLDER = Path("static/images/products")
IMAGE_FOLDER.mkdir(parents=True, exist_ok=True)  # Create the folder if it doesn't exist


# Helper function to save the image to the filesystem
def save_image_to_directory(image_data: bytes, product_name: str) -> str:
    sanitized_name = re.sub(r'[^\w\-_\. ]', '_', product_name)  # Sanitize the product name
    image_path = IMAGE_FOLDER / f"{sanitized_name}.jpg"
    with open(image_path, "wb") as image_file:
        image_file.write(image_data)
    return str(image_path)


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


        # Subir la imagen a Cloudinary
        image_data = await image.read()
        upload_result = cloudinary_upload(image_data, folder="products", public_id=name.replace(" ", "_"))
        image_url = upload_result.get("secure_url")


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
            "image_url": image_url,  # Guardar solo el enlace de la imagen
        }


        # Insert the product into the database
        result = products_collection.insert_one(product_dict)
        product_dict["_id"] = str(result.inserted_id)
        product_dict["id"] = product_dict.pop("_id")


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
        image_data = await image.read()
        upload_result = cloudinary_upload(image_data, folder="products", public_id=name.replace(" ", "_"))
        image_url = upload_result.get("secure_url")
        update_data["image_url"] = image_url  # Actualizar el enlace de la imagen


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
        # Ensure image_url is a string, extract the first URL if it's a list
        if isinstance(product.get("image_url"), list):
            product["image_url"] = product["image_url"][0] if product["image_url"] else "/static/images/default-product.png"
        else:
            product["image_url"] = product.get("image_url", "/static/images/default-product.png")
        if "image_path" in product and product["image_path"]:
            try:
                with open(product["image_path"], "rb") as image_file:
                    product["image"] = base64.b64encode(image_file.read()).decode("utf-8")
            except FileNotFoundError:
                product["image"] = None
        else:
            product["image"] = None  # No image available
        product["price"] = float(product["price"]) if "price" in product and isinstance(product["price"], (int, float)) else None


    return products


# Obtener imagen del producto (elimina el manejo de archivos locales)
@router.get("/imagen/{product_id}")
async def get_product_image(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product or "image_url" not in product:
        raise HTTPException(status_code=404, detail="Imagen del producto no encontrada.")
    return {"image_url": product["image_url"]}




# Endpoint para redirigir a WhatsApp con un mensaje predefinido
@router.get("/whatsapp_redirect")
async def whatsapp_redirect(product_name: str):
    # Find the product by name
    product = products_collection.find_one({"name": {"$regex": f"^{re.escape(product_name)}$", "$options": "i"}})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
   
    # Get the product image
    image_data = product.get("image")
    if not image_data:
        raise HTTPException(status_code=404, detail="Imagen del producto no encontrada.")
   
    # Construct the WhatsApp message
    message = f"¡Hola! Quiero saber más info acerca de {product_name}."
    whatsapp_url = f"https://wa.me/3445417684?text={message}"
   
    # Return the WhatsApp URL and the image data
    return {
        "url": whatsapp_url,
        "image": "Imagen omitida por razones de tamaño"  # Placeholder for binary data
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
async def list_products(search: Optional[str] = None):
    query = {}
    if search:
        query["name"] = {"$regex": re.escape(search), "$options": "i"}  # Case-insensitive search


    products = list(products_collection.find(query))
   
    for product in products:
        product["id"] = str(product["_id"])  # Convertir el ObjectId a string
        del product["_id"]  # Eliminar el campo _id
        # Ensure image_url is a string, extract the first URL if it's a list
        if isinstance(product.get("image_url"), list):
            product["image_url"] = product["image_url"][0] if product["image_url"] else "/static/images/default-product.png"
        else:
            product["image_url"] = product.get("image_url", "/static/images/default-product.png")
        product["price"] = float(product["price"]) if "price" in product and isinstance(product["price"], (int, float)) else None  # Ensure price is a number or None
   
    return products


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
