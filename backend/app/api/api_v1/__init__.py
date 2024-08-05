from fastapi import APIRouter
from app.api.api_v1.routes import users
from app.api.api_v1.routes import products

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
