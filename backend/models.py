from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    aadhaar_id = Column(String, unique=True, index=True)
    apaar_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    tribe = Column(String)
    pvtg_status = Column(Boolean, default=False)
    category = Column(String)
    state = Column(String)
    district = Column(String)
    date_of_birth = Column(String)
    gender = Column(String)
    phone = Column(String)
    email = Column(String)
    family_income = Column(Float)
    bank_account = Column(String)
    bank_name = Column(String)
    ifsc = Column(String)
    current_class = Column(String)
    institution = Column(String)
    udise_code = Column(String)
    
    applications = relationship("Application", back_populates="user")
    documents = relationship("Document", back_populates="user")
    payments = relationship("Payment", back_populates="user")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scheme_id = Column(String)
    scheme_name = Column(String)
    academic_year = Column(String)
    status = Column(String)
    submitted_at = Column(String)
    verified_at = Column(String, nullable=True)
    sanctioned_at = Column(String, nullable=True)
    disbursed_at = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    pipeline_stage = Column(Integer)
    
    user = relationship("User", back_populates="applications")
    payments = relationship("Payment", back_populates="application")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    type = Column(String)
    source = Column(String)
    verification_status = Column(String)
    uploaded_at = Column(String)
    file_size = Column(String)
    
    user = relationship("User", back_populates="documents")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    application_id = Column(String, ForeignKey("applications.id"))
    scheme_name = Column(String)
    amount = Column(Float)
    date = Column(String)
    dbt_status = Column(String)
    pfms_ref = Column(String)
    installment = Column(String)
    
    user = relationship("User", back_populates="payments")
    application = relationship("Application", back_populates="payments")
