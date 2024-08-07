from typing import Annotated, List, Any
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException
from concurrent.futures import ThreadPoolExecutor

from app import crud
from app.db import get_db
from app.core.security import get_current_user
from app.models import User, Message, ProductSearch, Product
from app.scrapers import lowes_scraper, home_depot_scraper

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

router = APIRouter()

@router.post("/search")
def search_products(session: SessionDep, search_data: ProductSearch) -> Message:
    zip_code = search_data.zipCode
    radius = search_data.radius
    key_words = search_data.keyWord.split(',')

    all_results = []

    with ThreadPoolExecutor() as executor:
        futures = []
        for key_word in key_words:
            futures.append(executor.submit(lowes_scraper, zip_code, radius, key_word))
            futures.append(executor.submit(home_depot_scraper, zip_code, radius, key_word))
        
        for future in futures:
            result = future.result()
            if result:
                all_results.extend(result)

    if not all_results:
        return Message(message="No results found from both sources.")

    crud.delete_product(session=session)
    crud.create_product(session=session, products=all_results)
    return Message(message="Success!")
    
@router.get("/get_all_product")
def get_all_products(session: SessionDep) -> Any:
    products = crud.get_all_product(session=session)
    result_list = [product.dict() for product in products]
    return {"results": result_list}
