import os
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Request
from sqlalchemy import func
from sqlalchemy.orm import Session
from .database import engine, get_db, SessionLocal
from . import models as models
from .auth import get_password_hash, verify_password, create_access_token, get_current_user
from . import schemas
from fastapi.middleware.cors import CORSMiddleware
from .ai_service import predict_kidney_image, model
from fastapi.staticfiles import StaticFiles
from fastapi import Form
from .schemas import UserResponse

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
        phone_number=user_data.phone_number,
        is_active=True,
        role=2
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
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="This account has been deactivated.")

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

@app.get("/patients", response_model=schemas.StandardResponse[list[schemas.PatientListResponse]])
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

#DELETE:patient
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


#PATCH: edit patient profile
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

#GET: retrieve doc profile
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

#PATCH: edit doc profile
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
#POST:change password
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


# POST: ai analysis
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


 # PATCH: note on analysis
@app.patch("/analysis/update-note/{record_id}", response_model=schemas.StandardResponse[schemas.MedicalRecordResponse])
async def add_doctor_note(
    record_id: int,
    note_data: schemas.DoctorNoteUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    doctor_id = current_user.get("id")
    if record.doctor_id != doctor_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to edit this record"
        )

    record.doctor_notes = note_data.notes
    db.commit()
    db.refresh(record)

    return {
        "message": "Doctor's note added successfully",
        "status": "success",
        "data": record
    }

 # GET PATIENT RECORDS
@app.get("/analysis/records/patient/{patient_id}", response_model=schemas.StandardResponse[list[schemas.MedicalRecordResponse]])
async def get_medical_records(
    patient_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doctor_id = current_user.get("id")

    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id,
        models.MedicalRecord.doctor_id == doctor_id
    ).all()

    base_url = str(request.base_url).rstrip("/")
    for rec in records:
        if rec.image_url and not rec.image_url.startswith("http"):
            rec.image_url = f"{base_url}{rec.image_url}"

    return {
        "message": f"Retrieved {len(records)} medical records for patient {patient_id}",
        "status": "success",
        "data": records
    }


 # DELETE RECORD
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


# GET ONE RECORD
@app.get("/analysis/records/{record_id}", response_model=schemas.StandardResponse[schemas.MedicalRecordResponse])
async def get_single_medical_record(
    record_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    doctor_id = current_user.get("id")
    if record.doctor_id != doctor_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    base_url = str(request.base_url).rstrip("/")
    if record.image_url and not record.image_url.startswith("http"):
        record.image_url = f"{base_url}{record.image_url}"

    return {
        "message": "Medical record retrieved successfully",
        "status": "success",
        "data": record
    }


# GET ALL RECORDS
@app.get("/analysis/records", response_model=schemas.StandardResponse[list[schemas.MedicalRecordResponse]])
async def get_all_doctor_records(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doctor_id = current_user.get("id")
    
    records = db.query(models.MedicalRecord)\
        .filter(models.MedicalRecord.doctor_id == doctor_id)\
        .order_by(models.MedicalRecord.id.desc())\
        .all()
    
    base_url = str(request.base_url).rstrip("/")
    
    for record in records:
        if record.image_url and not record.image_url.startswith("http"):
            record.image_url = f"{base_url}{record.image_url}"
    
    return {
        "message": f"Retrieved {len(records)} total records",
        "status": "success",
        "data": records
    }



# **********************************************************
# *****************    dashboard         *******************
# **********************************************************


#GET DASHBOARD STATISTICS
@app.get("/dashboard/stats", response_model=schemas.StandardResponse[dict])
async def get_dashboard_stats(
    request: Request,
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
    
    base_url = str(request.base_url).rstrip("/")

    recent_activity = []
    for record, p_name in query_result:
        image_url = record.image_url
        if image_url and not image_url.startswith("http"):
            image_url = f"{base_url}{image_url}"
        recent_activity.append({
            "id": record.id,
            "patient_name": p_name,
            "ai_prediction": record.ai_prediction,
            "confidence_score": record.confidence_score,
            "status": record.status,
            "scan_date": record.scan_date,
            "image_url": image_url
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

# **********************************************************
# *****************    quick scan         ******************
# **********************************************************



# POST: quick scan (no patient, no record saved)
@app.post("/analysis/quick-scan")
async def quick_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role != 2:
        raise HTTPException(status_code=403, detail="Access denied. Doctors only.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPG/PNG)")

    file_content = await file.read()

    try:
        prediction_result = predict_kidney_image(file_content, model)

        return {
            "message": "Quick scan completed",
            "status": "success",
            "data": {
                "result": prediction_result["result"],
                "confidence": prediction_result["confidence"],
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")



# **********************************************************
# **************   superadmin and admin     ****************
# **********************************************************


#HARDCODE SUPERADMIN
# superadmin
def create_super_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.username == "super_admin").first()
        if not admin:
            print("Creating Super Admin...")
            
            admin_password = os.getenv("SUPER_ADMIN_PASSWORD")
            if not admin_password:
                print("⚠️ Warning: SUPER_ADMIN_PASSWORD not set in .env. Using fallback 'Admin123!'")
                admin_password = "Admin123!"

            new_admin = models.User(
                username="super_admin",
                password_hash=get_password_hash(admin_password), 
                first_name="Super",
                last_name="Admin",
                email="admin@system.com",
                phone_number="0000000000",
                is_active=True,
                role=4
            )
            
            db.add(new_admin)
            db.commit()
            print("👑 Super Admin 'super_admin' created successfully!")
        else:
            print("✅ Super Admin already exists.")
    except Exception as e:
        db.rollback()
        print(f"❌ CRITICAL: Seed failed. Error detail: {e}")
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    create_super_admin()


#POST: SUPERADMIN CREATES ADMINS
@app.post("/admin/create-admin", response_model=schemas.StandardResponse[UserResponse])
def create_new_admin(
    admin_data: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role != 4:
        raise HTTPException(
            status_code=403,
            detail="Access denied Only Super Admins can create Admin accounts"
        )

    existing_user = db.query(models.User).filter(models.User.username == admin_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pwd = get_password_hash(admin_data.password)
    new_admin = models.User(
        username=admin_data.username,
        password_hash=get_password_hash(admin_data.password),
        first_name=getattr(admin_data, "first_name", "Admin"),
        last_name=getattr(admin_data, "last_name", "User"),
        email=getattr(admin_data, "email", f"{admin_data.username}@system.com"),
        phone_number=getattr(admin_data, "phone_number", "0000000000"),
        role=3,
        is_active=True
     )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {
        "message": f"Admin account '{new_admin.username}' created successfully",
        "status": "success",
        "data": new_admin
    }


#POST: superadmin and admin add doctors
@app.post("/admin/create-doctor", response_model=schemas.StandardResponse[UserResponse])
def create_new_doctor(
    doctor_data: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role not in (3, 4):
        raise HTTPException(
            status_code=403,
            detail="Access denied. Only Admins and Super Admins can create Doctor accounts"
        )

    existing_user = db.query(models.User).filter(models.User.username == doctor_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    new_doctor = models.User(
        username=doctor_data.username,
        password_hash=get_password_hash(doctor_data.password),
        first_name=getattr(doctor_data, "first_name", "Doctor"),
        last_name=getattr(doctor_data, "last_name", "User"),
        email=getattr(doctor_data, "email", f"{doctor_data.username}@system.com"),
        phone_number=getattr(doctor_data, "phone_number", "0000000000"),
        role=2,
        is_active=True
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return {
        "message": f"Doctor account '{new_doctor.username}' created successfully",
        "status": "success",
        "data": new_doctor
    }


#GET DOCTOR PROFILES (both admin and superadmin)
@app.get("/admin/doctors-overview")
def get_doctors_overview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.get("role", 0) < 3:
        raise HTTPException(status_code=403, detail="Access denied.")
        
    doctors = db.query(models.User).filter(models.User.role == 2, models.User.is_active == True).all()
    
    overview = []
    for doc in doctors:
        patient_count = db.query(models.Patient).filter(models.Patient.doctor_id == doc.id).count() 
        scan_count = db.query(models.MedicalRecord).filter(models.MedicalRecord.doctor_id == doc.id).count()

        overview.append({
            "doctor_id": doc.id,
            "username": doc.username,
            "first_name": doc.first_name,
            "last_name": doc.last_name,
            "email": doc.email,
            "phone_number": doc.phone_number,
            "is_active": doc.is_active,
            "number_of_patients": patient_count,
            "number_of_scans": scan_count
        })
        
    return {
        "message": "Doctors overview fetched successfully",
        "status": "success",
        "data": overview
    }


#EDIT DOCTOR PROFILE (both admin and superadmin)
@app.patch("/admin/edit-doctor/{doctor_id}")
def edit_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    first_name: str = None,
    last_name: str = None,
    email: str = None,
    phone_number: str = None,
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role not in (3, 4):
        raise HTTPException(status_code=403, detail="Access denied. Only Admins and Super Admins can edit Doctor accounts")

    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == 2,
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if first_name is not None:
        doctor.first_name = first_name
    if last_name is not None:
        doctor.last_name = last_name
    if email is not None:
        existing = db.query(models.User).filter(
            models.User.email == email,
            models.User.id != doctor_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        doctor.email = email
    if phone_number is not None:
        doctor.phone_number = phone_number

    db.commit()
    db.refresh(doctor)

    return {
        "message": f"Doctor '{doctor.username}' updated successfully",
        "status": "success",
        "data": {
            "doctor_id": doctor.id,
            "username": doctor.username,
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "email": doctor.email,
            "phone_number": doctor.phone_number,
        }
    }


#DELETE DOCTOR (both admin and superadmin)
@app.delete("/admin/delete-doctor/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role not in (3, 4):
        raise HTTPException(status_code=403, detail="Access denied.")

    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == 2,
        models.User.is_active == True
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found or already deactivated")

    doctor.is_active = False
    db.commit()

    return {
        "message": f"Doctor '{doctor.username}' has been deleted successfully.",
        "status": "success",
        "data": None
    }

# GET SPECIFIC DOCTOR DETAILS (both admin and superadmin)
@app.get("/admin/doctors/{doctor_id}")
def get_doctor_details(doctor_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.get("role", 0) < 3:
        raise HTTPException(status_code=403, detail="Access denied.")

    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == 2
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")


    scans = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.doctor_id == doctor_id
    ).all()

    scans_data = []
    for scan in scans:
        scans_data.append({
            "scan_id": scan.id,
            "patient_id": scan.patient_id,
            "image_url": scan.image_url,
            "ai_prediction": scan.ai_prediction,
            "confidence_score": scan.confidence_score,
            "doctor_notes": scan.doctor_notes,
            "scan_date": scan.scan_date,
            "status": scan.status
        })

    return {
        "message": "Doctor details fetched successfully",
        "status": "success",
        "data": {
            "doctor_id": doctor.id,
            "username": doctor.username,
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "email": doctor.email,
            "phone_number": doctor.phone_number,
            "is_active": doctor.is_active,
            "number_of_patients": db.query(models.Patient).filter(models.Patient.doctor_id == doctor_id).count(),
            "number_of_scans": len(scans_data),
            "scans": scans_data
        }
    }


# GET SCAN RESULTS DISTRIBUTION (for dashboard graph)
@app.get("/admin/dashboard/scan-distribution")
def get_scan_distribution(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.get("role", 0) < 3:
        raise HTTPException(status_code=403, detail="Access denied.")

    categories = ["Cyst", "Normal", "Stone", "Tumor"]

    distribution = {}
    for category in categories:
        count = db.query(models.MedicalRecord).filter(
            models.MedicalRecord.ai_prediction == category
        ).count()
        distribution[category] = count

    total = sum(distribution.values())

    total_doctors = db.query(models.User).filter(
        models.User.role == 2,
        models.User.is_active == True
    ).count()

    total_patients = db.query(models.Patient).count()

    return {
        "message": "Scan distribution fetched successfully",
        "status": "success",
        "data": {
            "distribution": distribution,
            "total_scans": total,
            "total_doctors": total_doctors,
            "total_patients": total_patients
        }
    }


# GET ALL RECORDS (both admin and superadmin)
@app.get("/admin/records", response_model=schemas.StandardResponse[list[schemas.MedicalRecordResponse]])
async def get_all_records_admin(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role not in (3, 4):
        raise HTTPException(status_code=403, detail="Access denied.")

    records = db.query(models.MedicalRecord)\
        .order_by(models.MedicalRecord.id.desc())\
        .all()

    base_url = str(request.base_url).rstrip("/")

    overview = []
    for record in records:
        image_url = record.image_url
        if image_url and not image_url.startswith("http"):
            image_url = f"{base_url}{image_url}"

        overview.append({
            "record_id": record.id,
            "patient_id": record.patient_id,
            "doctor_id": record.doctor_id,
            "image_url": image_url,
            "created_at": record.created_at,
        })

    return {
        "message": f"Retrieved {len(overview)} total records",
        "status": "success",
        "data": overview
    }


# GET ONE RECORD (both admin and superadmin)
@app.get("/admin/records/{record_id}", response_model=schemas.StandardResponse[schemas.MedicalRecordResponse])
async def get_single_record_admin(
    record_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role not in (3, 4):
        raise HTTPException(status_code=403, detail="Access denied.")

    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    base_url = str(request.base_url).rstrip("/")
    image_url = record.image_url
    if image_url and not image_url.startswith("http"):
        image_url = f"{base_url}{image_url}"

    return {
        "message": "Medical record retrieved successfully",
        "status": "success",
        "data": {
            "record_id": record.id,
            "patient_id": record.patient_id,
            "doctor_id": record.doctor_id,
            "image_url": image_url,
            "created_at": record.created_at,
        }
    }


# **********************************************************
# **************   superadmin only     *********************
# **********************************************************

# GET ALL ADMIN PROFILES
@app.get("/admin/admins-overview")
def get_all_admins(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != 4:
        raise HTTPException(status_code=403, detail="Access denied. Only Super Admins can view admin accounts.")

    admins = db.query(models.User).filter(models.User.role == 3, models.User.is_active == True).all()

    overview = []
    for admin in admins:
        overview.append({
            "admin_id": admin.id,
            "username": admin.username,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "email": admin.email,
            "phone_number": admin.phone_number,
            "is_active": admin.is_active
        })

    return {
        "message": "Admins overview fetched successfully",
        "status": "success",
        "data": overview
    }

# GET SPECIFIC ADMIN PROFILE
@app.get("/admin/admins/{admin_id}")
def get_admin_details(admin_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != 4:
        raise HTTPException(status_code=403, detail="Access denied. Only Super Admins can view admin accounts.")

    admin = db.query(models.User).filter(
        models.User.id == admin_id,
        models.User.role == 3
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found.")

    return {
        "message": "Admin details fetched successfully",
        "status": "success",
        "data": {
            "admin_id": admin.id,
            "username": admin.username,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "email": admin.email,
            "phone_number": admin.phone_number,
            "is_active": admin.is_active
        }
    }



#EDIT ADMIN PROFILE (superadmin only)
@app.patch("/admin/edit-admin/{admin_id}")
def edit_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    first_name: str = None,
    last_name: str = None,
    email: str = None,
    phone_number: str = None,
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role != 4:
        raise HTTPException(status_code=403, detail="Access denied. Only Super Admins can edit Admin accounts")

    admin = db.query(models.User).filter(
        models.User.id == admin_id,
        models.User.role == 3
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if first_name is not None:
        admin.first_name = first_name
    if last_name is not None:
        admin.last_name = last_name
    if email is not None:
        existing = db.query(models.User).filter(
            models.User.email == email,
            models.User.id != admin_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        admin.email = email
    if phone_number is not None:
        admin.phone_number = phone_number

    db.commit()
    db.refresh(admin)

    return {
        "message": f"Admin '{admin.username}' updated successfully",
        "status": "success",
        "data": {
            "admin_id": admin.id,
            "username": admin.username,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "email": admin.email,
            "phone_number": admin.phone_number,
        }
    }


#DELETE ADMIN (superadmin only)
@app.delete("/admin/delete-admin/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)

    if user_role != 4:
        raise HTTPException(status_code=403, detail="Access denied. Only Super Admins can delete Admin accounts")

    admin = db.query(models.User).filter(
        models.User.id == admin_id,
        models.User.role == 3,
        models.User.is_active == True
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found or already deactivated")

    admin.is_active = False
    db.commit()

    return {
        "message": f"Admin '{admin.username}' has been deleted successfully.",
        "status": "success",
        "data": None
    }