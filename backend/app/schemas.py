from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str


class MedicalRecordCreate(BaseModel):
    patient_id: int
    ai_prediction: str
    confidence_score: float
    doctor_notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordCreate):
    id: int
    scan_date: datetime
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: str

class PatientResponse(PatientCreate):
    id: int
    doctor_id: int

    records: list[MedicalRecordResponse] = []

    class Config:
        from_attributes = True