
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate
from db.client import db_client
from bson import ObjectId
from .users_JWT_auth import admin_only
from models.user import User
import re
from fastapi.responses import JSONResponse

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




# Buscar productos por filtro
@router.get("/buscar", response_model=List[Product])
async def search_products(
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    size: Optional[List[str]] = None,
   # color: Optional[str] = None
):
   
    query = {}


    if name:
        query["name"] = {"$regex": re.escape(name), "$options": "i"}
    

    if min_price is not None:
        query["price"] = {"$gte": min_price}
    

    if max_price is not None:
        query["price"] = {"$lte": max_price}
    

    if type:
        query["type"] = {"$regex": re.escape(type), "$options": "i"}
    

    if category:
        category_obj = categories_collection.find_one({"name": category})
        if category_obj:
            query["category_id"] = str(category_obj["_id"])
    

    if size:
        query["size"] = {"$in": [s.strip().title() for s in size]}  
    
    """
    if color:
            query["color"] = {"$regex": re.escape(color), "$options": "i"}"""

    products = products_collection.find(query)

    result = []
    for product in products:
        product["_id"] = str(product["_id"])
        product["id"] = product.pop("_id")
        result.append(product)

    return result



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
    return [{"id": product["id"], **{key: value for key, value in product.items() if key != "_id"}} for product in products]


@router.get("/listar/tipos")
async def list_product_types():
    types = products_collection.distinct("type")
    types = [t.strip().title() for t in types if t]
    return types
