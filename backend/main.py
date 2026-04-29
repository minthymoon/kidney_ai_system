from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models as models
from pydantic import BaseModel, Field
from .auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime
from typing import List, Optional
from . import schemas

models.Base.metadata.create_all(bind=engine)



app = FastAPI()

@app.get("/")
def root():
    return {
        "project": "Kidney AI Support System",
        "status": "Online",
        "phase": "1: Database Integration"
    }

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"status": "Database Connection Successful!"}

@app.post("/signup")
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):

    if len(user_data.username) < 3:
        raise HTTPException(status_code=400, detail="Username is too short. It must be at least 3 characters.")
    
    if len(user_data.username) > 20:
        raise HTTPException(status_code=400, detail="Username is too long. Maximum 20 characters allowed.")
    
    
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="Password is too weak. Please use at least 8 characters.")
    
    if len(user_data.password) > 12:
        raise HTTPException(status_code=400, detail="Password is too long. Please keep it between 8 and 12 characters.")
    
  
    hashed_pwd = get_password_hash(user_data.password)
    
  
    new_user = models.User(
        username=user_data.username, 
        password_hash=hashed_pwd,
        specialty=user_data.specialty
    )
    
   
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": f"{new_user.username} created successfully!"}

    # forntfacingMessage:'created successfully'
    # status: 201
    # data: new_user.username
    
@app.post("/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
   
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    
  
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    

    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "message": f"Welcome back, {user.username}!"
    }

@app.post("/patients", response_model=schemas.PatientResponse)
def add_patient(
    patient_in: schemas.PatientCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):

    # make email reqiered and check if patient exists or not in the db for validation
    
    #  firstName: ['', Validators.required],
    #   lastName: ['', Validators.required],
    #   dateOfBirth: ['', Validators.required],
    #   gender: ['', Validators.required],
    #   referringPhysician: [''],
    #   phone: [''],
    #   email: ['', Validators.email,Validators.required],
    #   address: [''],
    #  });
   
    new_patient = models.Patient(
        full_name=patient_in.full_name,
        age=patient_in.age,
        gender=patient_in.gender,
        doctor_id=current_user.id  
    )
    
   
    db.add(new_patient)
    db.commit()
    
   
    db.refresh(new_patient)
    
    return new_patient

@app.get("/patients", response_model=list[schemas.PatientResponse])
def get_patients(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    
    patients = db.query(models.Patient).filter(models.Patient.doctor_id == current_user.id).all()
    
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_one_patient(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
   
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.doctor_id == current_user.id
    ).first()

   
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return patient

@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
   
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.doctor_id == current_user.id
    ).first()

   
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

   
    db.delete(patient)
    db.commit()

    return {"message": f"Patient {patient_id} deleted successfully"}


# for this: when the doc clicks edit, the frontend fetches the getpatient and their id, and uses the data from there to fill the input boxes
# when the doctor saves they only send back the changes to the patch route, ok?
@app.patch("/patients/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(
    patient_id: int, 
    patient_update: schemas.PatientUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
   
    db_patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.doctor_id == current_user.id
    ).first()

    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

   
    update_data = patient_update.dict(exclude_unset=True)

    
    for key, value in update_data.items():
        setattr(db_patient, key, value)

    db.commit()
    db.refresh(db_patient)
    return db_patient