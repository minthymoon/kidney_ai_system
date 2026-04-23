from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Float
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"  
    id = Column(Integer, primary_key=True, index=True) 
    username = Column(String, unique=True, index=True) 
    password_hash = Column(String) 
    specialty = Column(String)

    patients = relationship("Patient", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(String)

    doctor_id = Column(Integer, ForeignKey("users.id"))
    doctor = relationship("User", back_populates="patients")
    
 
    records = relationship("MedicalRecord", back_populates="owner")


class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    
    patient_id = Column(Integer, ForeignKey("patients.id"))
    
    doctor_id = Column(Integer, ForeignKey("users.id"))
    
    image_url = Column(String)    
    ai_prediction = Column(String) 
    confidence_score = Column(Float)
    doctor_notes = Column(Text)     
    
    scan_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("Patient", back_populates="records")