from typing import Annotated
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException
from concurrent.futures import ThreadPoolExecutor

from app.db import get_db
from app.core.security import get_current_user
from app.models import User, Message, ProductSearch
from app.scrapers import lowes_scraper, home_depot_scraper

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

router = APIRouter()

@router.post("/search")
def search_products(session: SessionDep, search_data: ProductSearch) -> Message:
    zip_code = search_data.zipCode
    radius = search_data.radius
    key_word = search_data.keyWord
    
    with ThreadPoolExecutor() as executor:
        future_lowes = executor.submit(lowes_scraper, zip_code, radius, key_word)
        future_home_depot = executor.submit(home_depot_scraper, zip_code, radius, key_word)
        
        lowes_result = future_lowes.result()
        home_depot_result = future_home_depot.result()
        print(lowes_result, home_depot_result)
        
    return Message(message="Success")
    
    
    

