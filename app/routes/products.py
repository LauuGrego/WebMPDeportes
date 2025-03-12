from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from app.models.product import Product, ProductCreate, ProductUpdate
from app.db.client import db_client
from bson import ObjectId
from .users_JWT_auth import admin_only
from app.models.user import User
import re
from fastapi.responses import JSONResponse
import random

router = APIRouter(prefix="/productos", tags=["Products"])

# Colección de productos y categorías
products_collection = db_client.products
categories_collection = db_client.categories

# Obtener producto por ID
def get_product_by_id(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["id"] = str(product["_id"])  # Asigna el id como string
        del product["_id"]                 # Elimina el campo _id
    return product


@router.get("/obtener_por_id/{product_id}")
async def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return JSONResponse(content=product)


# Agregar productos
@router.post("/agregar", response_model=Product)
async def create_product(product_data: ProductCreate, admin: User = Depends(admin_only)):
    # Normalizar los datos de entrada
    product_data.name = product_data.name.strip().title()
    product_data.category_name = product_data.category_name.strip().title()
    product_data.type = product_data.type.strip().title()

    if product_data.size:
        product_data.size = [s.strip().title() for s in product_data.size if s.strip()]


    # Asegurarse de que image_url sea una lista; de lo contrario, asignar una lista vacía
    if not product_data.image_url:
        product_data.image_url = []

    category = categories_collection.find_one({"name": product_data.category_name})
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{product_data.category_name}' no existe.")
    
    product_dict = product_data.model_dump()
    product_dict.pop("category_name")  
    product_dict["category_id"] = str(category["_id"])  

    result = products_collection.insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    product_dict["id"] = product_dict.pop("_id")
    
    return product_dict



@router.put("/actualizar/{product_id}", response_model=Product)
async def modify_product(product_id: str, updated_product: ProductUpdate, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    # Si se actualiza la categoría, normalizar y verificar su existencia
    category = None
    if updated_product.category_name:
        updated_product.category_name = updated_product.category_name.strip().title()
        category = categories_collection.find_one({"name": updated_product.category_name})
        if not category:
            raise HTTPException(status_code=404, detail=f"La categoría '{updated_product.category_name}' no existe.")

    # Normalizar las listas de strings
    if updated_product.size:
        updated_product.size = [s.strip().title() for s in updated_product.size if s.strip()]

    if updated_product.image_url:
        updated_product.image_url = [url.strip() for url in updated_product.image_url if url.strip()]

    # Obtener solo los campos que han sido enviados
    update_data = updated_product.model_dump(exclude_unset=True)

    # Normalizar otros posibles campos string (si es necesario)
    for key, value in update_data.items():
        if isinstance(value, str):
            update_data[key] = value.strip().title()

    # Si se actualizó la categoría, agrega el category_id
    if category:
        update_data["category_id"] = str(category["_id"])

    # Actualizar solo los campos recibidos en la base de datos
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
    message = f"¡Hola! Quiero saber más info acerca de {product_name}."
    whatsapp_url = f"https://wa.me/3445417684?text={message}"
    return {"url": whatsapp_url}


# Deshabilitar productos
@router.put("/deshabilitar/{product_id}", response_model=Product)
async def disable_product(product_id: str, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    # Deshabilitar el producto (poner el stock en 0)
    updated_product = products_collection.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": {"stock": 0}},
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
