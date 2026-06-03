from pydantic import BaseModel, EmailStr
from typing import Optional, Generic, TypeVar, List, Any
from datetime import date, datetime

T = TypeVar("T")

class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    is_active: bool
    role: int


    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class PatientInfo(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True

class MedicalRecordCreate(BaseModel):
    patient_id: int
    ai_prediction: str
    confidence_score: float
    doctor_notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordCreate):
    id: int
    scan_date: datetime
    image_url: Optional[str] = None
    status: str
    patient: Optional[PatientInfo] = None

    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone_number: Optional[str] = None
    email: EmailStr 
    address: Optional[str] = None
    referring_physician: Optional[str] = None

class PatientResponse(PatientCreate):
    id: int
    doctor_id: int

    records: list[MedicalRecordResponse] = []

    class Config:
        from_attributes = True



class PatientListResponse(PatientCreate): #no returning records with patients :)
    id: int
    doctor_id: int

    class Config:
        from_attributes = True

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    referring_physician: Optional[str] = None

class PatientUpdateResponse(BaseModel):
    message: str
    status: str
    data: PatientResponse

class StandardResponse(BaseModel, Generic[T]):
    message: str
    status: str 
    data: Optional[T] = None

    class Config:
        from_attributes = True

class ChartData(BaseModel):
    label: str
    value: int

class DoctorNoteUpdate(BaseModel):
    notes: str