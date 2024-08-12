from datetime import datetime
from typing import Optional
from pydantic import Field, model_validator
from sqlmodel import Field, SQLModel

class ProductSearch(SQLModel):
    zipCode: str
    radius: str
    keyWord: str

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    price: str
    brand: str
    stock: str
    store: str
    
    