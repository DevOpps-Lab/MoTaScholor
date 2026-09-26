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

@app.get("/users/{user_id}/alerts", response_model=list[schemas.Alert])
def get_alerts(user_id: int, db: Session = Depends(get_db)):
    alerts = db.query(models.Alert).filter(models.Alert.user_id == user_id).all()
    return alerts

@app.get("/mentors", response_model=list[schemas.Mentor])
def get_mentors(db: Session = Depends(get_db)):
    mentors = db.query(models.Mentor).all()
    return mentors

@app.get("/users/{user_id}/chat", response_model=list[schemas.JagoMessage])
def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    messages = db.query(models.JagoMessage).filter(models.JagoMessage.user_id == user_id).all()
    return messages

@app.post("/users/{user_id}/chat", response_model=schemas.JagoMessage)
def post_chat_message(user_id: int, message: schemas.JagoMessageCreate, db: Session = Depends(get_db)):
    # Save user message
    user_msg = models.JagoMessage(user_id=user_id, sender="user", text=message.text, timestamp=message.timestamp)
    db.add(user_msg)
    
    # Process AI Response (Mock Logic for MVP)
    query = message.text.lower()
    reply = "I'm sorry, I couldn't understand. I am still learning!"
    if "status" in query:
        reply = "Your Pre-Matric Scholarship is currently Disbursed. Your Post-Matric application is Verified and awaiting Sanction."
    elif "eligible" in query or "apply" in query:
        reply = "Based on your AI Predictor score, you have a 92% match for the Top Class Education Scheme."
    elif "document" in query:
        reply = "You don't need to re-upload documents. Your Immutable Vault has already synced your Aadhaar and ST Certificate from DigiLocker."
        
    bot_msg = models.JagoMessage(user_id=user_id, sender="bot", text=reply, timestamp=message.timestamp)
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    return bot_msg

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
