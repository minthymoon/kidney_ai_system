import os

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile 
from sqlalchemy import func
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models as models
from .auth import get_password_hash, verify_password, create_access_token, get_current_user
from . import schemas
from fastapi.middleware.cors import CORSMiddleware
from .ai_service import predict_kidney_image, model
from fastapi.staticfiles import StaticFiles
from fastapi import Form

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

 
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],          
    allow_credentials=True,
    allow_methods=["*"],            
    allow_headers=["*"],
)


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


# **********************************************************
# ***************** auth   **************************
# **********************************************************


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
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        phone_number=user_data.phone_number
    )
    
   
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
    "message": "Doctor account created successfully",
    "status": "success",
    "data": new_user
}
    
@app.post("/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
   
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    
  
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    

    access_token = create_access_token(user=user)
    
    return {
    
        "message": "logged in successfully",
        "status": "success",
        "data": {"access_token": access_token,}
       
    }


# **********************************************************
# *****************    patients          *******************
# **********************************************************


@app.post("/patients", response_model=schemas.StandardResponse[schemas.PatientResponse])
def add_patient(
    patient_in: schemas.PatientCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
   existing_patient = db.query(models.Patient).filter(models.Patient.email == patient_in.email).first()
   if existing_patient:
        raise HTTPException(
            status_code=400, 
            detail="A patient with this email already exists."
        )
   new_patient = models.Patient(
       first_name=patient_in.first_name,
       last_name=patient_in.last_name,
       date_of_birth=patient_in.date_of_birth,
       gender=patient_in.gender,
       phone_number=patient_in.phone_number,
       email=patient_in.email,
       address=patient_in.address,
       referring_physician=patient_in.referring_physician,
       doctor_id=current_user["id"]
    )
    
   
   db.add(new_patient)
   db.commit()
    
   
   db.refresh(new_patient)
    
   return{
        "message": "Patient record created successfully",
        "status": "success",
        "data": new_patient
    }

@app.get("/patients", response_model=schemas.StandardResponse[list[schemas.PatientResponse]])
def get_patients(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    
    patients = db.query(models.Patient).filter(models.Patient.doctor_id == current_user["id"]).all()
    
    return {
        "message": "Patients retrieved successfully",
        "status": "success",
        "data": patients
    }

@app.get("/patients/{patient_id}", response_model=schemas.StandardResponse[schemas.PatientResponse])
def get_one_patient(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
   
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.doctor_id == current_user["id"]
    ).first()

   
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return{
        "message": "Patient details retrieved successfully",
        "status": "success",
        "data": patient
    }

@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
   
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.doctor_id == current_user["id"]
    ).first()

   
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

   
    db.delete(patient)
    db.commit()

    return {
        "message": f"Patient with ID {patient_id} deleted successfully",
        "status": "success",
        "data": {"id": patient_id}
        }


# for this: when the doc clicks edit, the frontend fetches the getpatient and their id, and uses the data from there to fill the input boxes
# when the doctor saves they only send back the changes to the patch route, ok?
@app.patch("/patients/{patient_id}", response_model=schemas.PatientUpdateResponse)
def update_patient(
    patient_id: int, 
    patient_update: schemas.PatientUpdate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
   
    db_patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, 
        models.Patient.doctor_id == current_user["id"]
    ).first()

    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

   
    update_data = patient_update.dict(exclude_unset=True)

    
    for key, value in update_data.items():
        setattr(db_patient, key, value)

    db.commit()
    db.refresh(db_patient)
    return {
        "message": "Patient information updated successfully",
        "status": "success",
        "data": db_patient
    }


# **********************************************************
# *****************    doctors          *******************
# **********************************************************


@app.get("/doctors/profile", response_model=schemas.StandardResponse[schemas.UserResponse])
def get_full_doctor_profile(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    doctor = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    return {
        "message": "Full doctor profile retrieved",
        "status": "success",
        "data": doctor
    }

@app.patch("/doctors/profile", response_model=schemas.StandardResponse[schemas.UserResponse])
def update_doctor_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = db.query(models.User).filter(models.User.id == current_user["id"]).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Doctor not found")

    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated successfully",
        "status": "success",
        "data": db_user
    }

@app.post("/doctors/change-password", response_model=schemas.StandardResponse[dict])
def change_password(
    pass_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    db_user = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if not verify_password(pass_data.old_password, db_user.password_hash):
        raise HTTPException(
            status_code=400, 
            detail="Current password is incorrect"
        )

    db_user.password_hash = get_password_hash(pass_data.new_password)
    db.commit()

    return {
        "message": "Password updated successfully",
        "status": "success",
        "data": {"username": db_user.username}
    }


# **********************************************************
# *****************    analysis          *******************
# **********************************************************


# POST
@app.post("/analysis/predict-image", response_model=schemas.StandardResponse[schemas.MedicalRecordResponse])
async def upload_kidney_image(
    patient_id: int = Form(...) , 
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    print(f"Received file: {file.filename}, content type: {file.content_type}")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPG/PNG)")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    db_image_url = f"/uploads/{file.filename}"
    file_content = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    doctor_id = current_user.get("id")
    new_record = models.MedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor_id,
        image_url=db_image_url,
        status="pending", 
        ai_prediction=None,
        confidence_score=None,
        doctor_notes=None
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    try:
        prediction_result = predict_kidney_image(file_content, model)

        new_record.ai_prediction = prediction_result["result"]
        new_record.confidence_score = float(prediction_result["confidence"].strip('%'))
        new_record.status = "successful" 
        
        db.commit()
        db.refresh(new_record)

        return {
            "message": "AI analysis completed and saved",
            "status": "success",
            "data": new_record
        }

    except Exception as e:
        new_record.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")


 # PUT   
@app.put("/analysis/update-note/{record_id}", response_model=schemas.StandardResponse[schemas.MedicalRecordResponse])
async def add_doctor_note(
    record_id: int, 
    notes: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    
    record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    doctor_id = current_user.get("id")
    
    if record.doctor_id != doctor_id:
        raise HTTPException(
            status_code=403, 
            detail="You do not have permission to edit this record"
        )

    record.doctor_notes = notes
    db.commit()
    db.refresh(record)

    return {
        "message": "Doctor's note added successfully",
        "status": "success",
        "data": record
    }

 # GET 
@app.get("/analysis/records/patient/{patient_id}", response_model=schemas.StandardResponse[list[schemas.MedicalRecordResponse]])
async def get_medical_records(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doctor_id = current_user.get("id")

    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id,
        models.MedicalRecord.doctor_id == doctor_id
    ).all()

    return {
        "message": f"Retrieved {len(records)} medical records for patient {patient_id}",
        "status": "success",
        "data": records
    }


 # DELETE 
@app.delete("/analysis/records/{record_id}", response_model=schemas.StandardResponse[dict])
async def delete_medical_record(
    record_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    doctor_id = current_user.get("id")
    if record.doctor_id != doctor_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    if record.image_url:
        filename = record.image_url.split("/")[-1]
        file_path = os.path.join(UPLOAD_DIR, filename)

        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting physical file: {e}")

    db.delete(record)
    db.commit()

    return {
        "message": "Record and associated image deleted successfully",
        "status": "success",
        "data": {"id": record_id}
    }

from sqlalchemy.orm import Session

@app.get("/dashboard/stats", response_model=schemas.StandardResponse[dict])
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doctor_id = current_user.get("id")

    total_patients = db.query(models.Patient).filter(models.Patient.doctor_id == doctor_id).count()

    total_scans = db.query(models.MedicalRecord).filter(models.MedicalRecord.doctor_id == doctor_id).count()

    pending_scans = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.doctor_id == doctor_id,
        models.MedicalRecord.status == "pending"
    ).count()

    query_result = db.query(models.MedicalRecord, models.Patient.first_name)\
        .join(models.Patient, models.MedicalRecord.patient_id == models.Patient.id)\
        .filter(models.MedicalRecord.doctor_id == doctor_id)\
        .order_by(models.MedicalRecord.scan_date.desc())\
        .limit(5).all()
    
    diagnosis_counts = db.query(
    models.MedicalRecord.ai_prediction, 
    func.count(models.MedicalRecord.id)
    ).filter(
    models.MedicalRecord.doctor_id == doctor_id,
    models.MedicalRecord.status == "successful" 
    ).group_by(models.MedicalRecord.ai_prediction).all()

    chart_data = [
    {"label": pred if pred else "Normal", "value": count} 
    for pred, count in diagnosis_counts
]

    recent_activity = []
    for record, p_name in query_result:
        recent_activity.append({
            "id": record.id,
            "patient_name": p_name,
            "ai_prediction": record.ai_prediction,
            "status": record.status,
            "scan_date": record.scan_date,
            "image_url": record.image_url
        })

    return {
        "message": "Dashboard statistics retrieved",
        "status": "success",
        "data": {
            "stats": {
                "total_patients": total_patients,
                "total_scans": total_scans,
                "pending_scans": pending_scans
            },
            "chart_data": chart_data,
            "recent_activity": recent_activity
        }
    }
