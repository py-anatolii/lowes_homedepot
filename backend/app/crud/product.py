from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError

from app.models import Product, ProductSearch

def create_product(*, session: Session, products: List[dict]):
    for product_data in products:
        product = Product(**product_data)
        session.add(product)
    session.commit()

def delete_product(*, session: Session):
    session.query(Product).delete()
    session.commit()
    
def get_all_product(*, session: Session) -> List[Product]:
    statement = select(Product)
    results = session.exec(statement).all()
    return results
