from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoTA Scholar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MoTA Scholar API"}

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/login", response_model=schemas.User)
def login_user(aadhaar_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.aadhaar_id == aadhaar_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found. Please try 123456789012")
    return user

@app.get("/users/{user_id}/dashboard")
def get_dashboard_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_received = sum(payment.amount for payment in user.payments)
    active_apps = len([app for app in user.applications if app.status not in ["disbursed", "rejected"]])
    docs_verified = len([doc for doc in user.documents if doc.verification_status == "verified"])
    total_docs = len(user.documents)
    
    return {
        "total_received": total_received,
        "active_applications": active_apps,
        "documents_verified": docs_verified,
        "total_documents": total_docs
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
