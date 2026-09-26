from database import SessionLocal, engine
import models

# Create all tables
models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(models.User).first():
        print("Database already seeded.")
        return
        
    print("Seeding database...")
    
    user = models.User(
        aadhaar_id="123456789012",
        apaar_id="APAAR-MH-2024-08912",
        full_name="Anita Birhor",
        tribe="Birhor",
        pvtg_status=True,
        category="ST",
        state="Jharkhand",
        district="Hazaribagh",
        date_of_birth="2005-03-15",
        gender="Female",
        phone="+91 98765 43210",
        email="anita.birhor@email.com",
        family_income=180000,
        bank_account="XXXX XXXX 5678",
        bank_name="State Bank of India",
        ifsc="SBIN0001234",
        current_class="XII",
        institution="Government Higher Secondary School, Hazaribagh",
        udise_code="20150300701"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    app1 = models.Application(
        id="APP-2026-PM-0847",
        user_id=user.id,
        scheme_id="prematric",
        scheme_name="Pre-Matric Scholarship",
        academic_year="2025-26",
        status="disbursed",
        submitted_at="2025-07-15",
        verified_at="2025-08-02",
        sanctioned_at="2025-09-10",
        disbursed_at="2025-10-01",
        amount=5250,
        pipeline_stage=4
    )
    
    app2 = models.Application(
        id="APP-2026-POM-1234",
        user_id=user.id,
        scheme_id="postmatric",
        scheme_name="Post-Matric Scholarship",
        academic_year="2026-27",
        status="verified",
        submitted_at="2026-08-01",
        verified_at="2026-09-15",
        pipeline_stage=2
    )
    db.add_all([app1, app2])

    doc1 = models.Document(
        id="DOC-001", user_id=user.id, name="Aadhaar Card", type="identity", 
        source="UIDAI / DigiLocker", verification_status="verified", 
        uploaded_at="2025-06-10", file_size="245 KB"
    )
    doc2 = models.Document(
        id="DOC-002", user_id=user.id, name="ST Certificate", type="certificate", 
        source="State e-District / DigiLocker", verification_status="verified", 
        uploaded_at="2025-06-10", file_size="180 KB"
    )
    db.add_all([doc1, doc2])

    pay1 = models.Payment(
        id="PAY-001", user_id=user.id, application_id=app1.id, 
        scheme_name="Pre-Matric Scholarship", amount=2625, 
        date="2025-10-01", dbt_status="Credited", 
        pfms_ref="PFMS/2025/ST/PM/084712", installment="1st Installment (Jul-Nov 2025)"
    )
    db.add(pay1)

    # Seed Alerts
    alert1 = models.Alert(user_id=user.id, type="error", title="Action Required: Blurry Document", time="Just now", text="Your Income Certificate was flagged by the Nodal Officer as blurry.", action="Open Camera & Fix Now")
    alert2 = models.Alert(user_id=user.id, type="success", title="Smart Contract Disbursed", time="10 mins ago", text="₹5,250 has been disbursed directly to your SBI account via smart contract.")
    alert3 = models.Alert(user_id=user.id, type="info", title="DigiLocker Sync", time="2 hours ago", text="Your Class X Marksheet was automatically verified via DigiLocker node.")
    db.add_all([alert1, alert2, alert3])

    # Seed Mentors
    mentor1 = models.Mentor(name="Dr. Ramesh Munda", scheme="National Overseas Scholarship (NOS)", location="UK / Jharkhand", status="Available for Chat", match="98% Profile Match")
    mentor2 = models.Mentor(name="Suman Oraon", scheme="Top Class Education Scheme", location="IIT Delhi", status="Busy", match="85% Profile Match")
    db.add_all([mentor1, mentor2])

    # Seed JagoMessages
    msg1 = models.JagoMessage(user_id=user.id, sender="bot", text="Namaste! I am JAGO, your AI Scholarship Assistant. How can I help you today?", timestamp="2026-09-26T10:00:00Z")
    db.add(msg1)

    db.commit()
    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    seed_db()
