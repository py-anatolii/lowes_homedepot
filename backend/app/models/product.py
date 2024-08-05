from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field, model_validator
from sqlmodel import Field, SQLModel

class ProductSearch(SQLModel):
    zipCode: str
    radius: str
    keyWord: str
    
    