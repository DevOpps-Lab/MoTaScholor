from pydantic import BaseModel
from typing import List, Optional

class ApplicationBase(BaseModel):
    scheme_id: str
    scheme_name: str
    academic_year: str
    status: str
    submitted_at: str
    verified_at: Optional[str] = None
    sanctioned_at: Optional[str] = None
    disbursed_at: Optional[str] = None
    amount: Optional[float] = None
    pipeline_stage: int

class Application(ApplicationBase):
    id: str
    user_id: int

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    name: str
    type: str
    source: str
    verification_status: str
    uploaded_at: str
    file_size: str

class Document(DocumentBase):
    id: str
    user_id: int

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    application_id: str
    scheme_name: str
    amount: float
    date: str
    dbt_status: str
    pfms_ref: str
    installment: str

class Payment(PaymentBase):
    id: str
    user_id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    aadhaar_id: str
    apaar_id: str
    full_name: str
    tribe: str
    pvtg_status: bool
    category: str
    state: str
    district: str
    date_of_birth: str
    gender: str
    phone: str
    email: str
    family_income: float
    bank_account: str
    bank_name: str
    ifsc: str
    current_class: str
    institution: str
    udise_code: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    applications: List[Application] = []
    documents: List[Document] = []
    payments: List[Payment] = []

    class Config:
        from_attributes = True
