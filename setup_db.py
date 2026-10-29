"""
CampusSafe - MongoDB Atlas Database Initialization Script
Run this script manually once after verifying connection with check_db.py:
    python setup_db.py
"""

import os
import sys
import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, OperationFailure
from werkzeug.security import generate_password_hash
from config import Config

def init_database():
    print("=" * 65)
    print("CampusSafe - MongoDB Atlas Database Setup & Indexing")
    print("=" * 65)

    if not Config.is_mongo_configured():
        print("[ERROR] MONGO_URI is not configured in .env. Please configure it first.")
        sys.exit(1)

    client = None
    try:
        client = MongoClient(
            Config.MONGO_URI,
            serverSelectionTimeoutMS=Config.MONGO_TIMEOUT_MS
        )
        # Verify connection
        client.admin.command('ping')
        db = client[Config.MONGO_DB_NAME]
        print(f"[SUCCESS] Connected to MongoDB Atlas. Database: '{Config.MONGO_DB_NAME}'")

        # -------------------------------------------------------------
        # 1. CREATE INDEXES (Safe and idempotent)
        # -------------------------------------------------------------
        print("\n[STEP 1] Creating indexes on collections...")

        # Collection: users
        # Unique index on email and student_id
        db.users.create_index([("email", ASCENDING)], unique=True, name="idx_users_unique_email")
        db.users.create_index([("student_id", ASCENDING)], unique=True, name="idx_users_unique_student_id")
        db.users.create_index([("role", ASCENDING)], name="idx_users_role")
        print("  - Index created on 'users': unique email, unique student_id, role")

        # Collection: incident_reports
        # Unique index on reference_id
        db.incident_reports.create_index([("reference_id", ASCENDING)], unique=True, name="idx_reports_ref_id")
        db.incident_reports.create_index([("user_id", ASCENDING)], name="idx_reports_user_id")
        db.incident_reports.create_index([("status", ASCENDING)], name="idx_reports_status")
        db.incident_reports.create_index([("urgency", ASCENDING)], name="idx_reports_urgency")
        db.incident_reports.create_index([("created_at", DESCENDING)], name="idx_reports_created_at")
        print("  - Index created on 'incident_reports': unique reference_id, user_id, status, urgency, created_at")

        # Collection: emergency_contacts
        db.emergency_contacts.create_index([("category", ASCENDING)], name="idx_contacts_category")
        db.emergency_contacts.create_index([("name", ASCENDING)], name="idx_contacts_name")
        db.emergency_contacts.create_index([("is_active", ASCENDING)], name="idx_contacts_active")
        print("  - Index created on 'emergency_contacts': category, name, is_active")

        # Collection: safety_alerts
        db.safety_alerts.create_index([("is_active", ASCENDING)], name="idx_alerts_active")
        db.safety_alerts.create_index([("created_at", DESCENDING)], name="idx_alerts_created_at")
        print("  - Index created on 'safety_alerts': is_active, created_at")

        # -------------------------------------------------------------
        # 2. SEED SAMPLE EMERGENCY CONTACTS (Clearly marked as DEMO)
        # -------------------------------------------------------------
        print("\n[STEP 2] Checking emergency contacts collection...")
        existing_contacts_count = db.emergency_contacts.count_documents({})
        if existing_contacts_count == 0:
            print("  - Seeding initial demonstration contacts (clearly labeled DEMO)...")
            demo_contacts = [
                {
                    "name": "Campus Security Main Control Room (DEMO)",
                    "category": "Campus Security",
                    "phone": "0422-2614000",
                    "description": "Main gate security dispatch and campus patrol desk for safety inquiries (Demonstration Entry).",
                    "availability": "24/7 Round the Clock",
                    "is_active": True,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                },
                {
                    "name": "Campus Health & Medical Centre (DEMO)",
                    "category": "Medical & Health",
                    "phone": "0422-2614108",
                    "description": "On-campus health dispensary, primary care triage, and campus first-aid dispatch (Demonstration Entry).",
                    "availability": "24/7 Emergency Ward",
                    "is_active": True,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                },
                {
                    "name": "Campus Fire Safety & Hazard Response (DEMO)",
                    "category": "Fire & Hazard",
                    "phone": "0422-2614101",
                    "description": "Chemical lab safety, smoke or electrical fire reporting, evacuation coordination (Demonstration Entry).",
                    "availability": "24/7 Emergency Line",
                    "is_active": True,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                },
                {
                    "name": "Women's Safety & Anti-Harassment Cell (DEMO)",
                    "category": "Counseling & Support",
                    "phone": "0422-2614112",
                    "description": "Confidential advisory, anti-ragging support, and grievance committee contact (Demonstration Entry).",
                    "availability": "Monday - Saturday, 8:00 AM - 8:00 PM",
                    "is_active": True,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                },
                {
                    "name": "Student Counseling & Psychological Support (DEMO)",
                    "category": "Counseling & Support",
                    "phone": "0422-2614220",
                    "description": "Student emotional well-being, crisis counseling, and academic stress assistance (Demonstration Entry).",
                    "availability": "Monday - Friday, 9:00 AM - 6:00 PM",
                    "is_active": True,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                },
                {
                    "name": "Campus Electrical & Infrastructure Maintenance (DEMO)",
                    "category": "Facilities & Maintenance",
                    "phone": "0422-2614330",
                    "description": "Report broken pathways, hazardous exposed wiring, dark walkways, or water leaks (Demonstration Entry).",
                    "availability": "Monday - Saturday, 8:00 AM - 7:00 PM",
                    "is_active": True,
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                }
            ]
            db.emergency_contacts.insert_many(demo_contacts)
            print(f"  [SUCCESS] Inserted {len(demo_contacts)} demonstration contacts.")
        else:
            print(f"  [INFO] Emergency contacts collection already contains {existing_contacts_count} record(s). Skipping insert to avoid duplicates.")

        # -------------------------------------------------------------
        # 3. SEED INITIAL SAFETY ALERT (Active broadcast banner)
        # -------------------------------------------------------------
        print("\n[STEP 3] Checking safety alerts...")
        if db.safety_alerts.count_documents({}) == 0:
            initial_alert = {
                "title": "Welcome to CampusSafe Demonstration Portal",
                "message": "Notice: This portal is an educational demonstration project. For life-threatening emergencies, immediately dial national emergency numbers or visit the campus security office directly.",
                "category": "General Safety Advisory",
                "severity": "Info",
                "created_at": datetime.datetime.utcnow(),
                "expires_at": datetime.datetime.utcnow() + datetime.timedelta(days=90),
                "is_active": True
            }
            db.safety_alerts.insert_one(initial_alert)
            print("  [SUCCESS] Inserted initial system advisory alert.")
        else:
            print("  [INFO] Safety alerts already exist. Skipping.")

        # -------------------------------------------------------------
        # 4. ADMINISTRATOR ACCOUNT PROVISIONING
        # -------------------------------------------------------------
        print("\n[STEP 4] Administrator Account Provisioning")
        admin_user = db.users.find_one({"role": "admin"})
        if admin_user:
            print(f"  [INFO] An administrator account already exists: {admin_user.get('email')}")
        else:
            print("  No administrator account found.")
            # Check environment variables or ask user
            admin_email = os.getenv("ADMIN_EMAIL", "").strip()
            admin_password = os.getenv("ADMIN_PASSWORD", "").strip()

            if not admin_email or not admin_password:
                print("  You can configure an initial administrator account now.")
                try:
                    admin_email = input("  Enter Admin Email (e.g. admin@campussafe.edu): ").strip()
                    admin_password = input("  Enter Admin Password (min 8 chars):admin@1234").strip()
                except (EOFError, KeyboardInterrupt):
                    admin_email = ""
                    admin_password = ""

            if admin_email and admin_password and len(admin_password) >= 6:
                hashed = generate_password_hash(admin_password)
                admin_doc = {
                    "full_name": "Campus Safety Administrator",
                    "student_id": "ADMIN-001",
                    "email": admin_email.lower(),
                    "department": "Campus Security & Safety Office",
                    "password_hash": hashed,
                    "role": "admin",
                    "created_at": datetime.datetime.utcnow(),
                    "is_active": True
                }
                db.users.insert_one(admin_doc)
                print(f"  [SUCCESS] Administrator account created: {admin_email.lower()}")
            else:
                print("  [NOTE] Admin account was not created during setup.")
                print("  To create an admin account later, you can either:")
                print("  a) Re-run python setup_db.py and provide email/password, OR")
                print("  b) Register a user via the portal and set role='admin' directly in Atlas Data Explorer.")

        print("\n" + "=" * 65)
        print("[SETUP COMPLETE] Database setup and indexing finished successfully!")
        print("You can verify collections in MongoDB Atlas Data Explorer:")
        print(f"  - Database: {Config.MONGO_DB_NAME}")
        print("  - Collections: users, emergency_contacts, incident_reports, safety_alerts")
        print("=" * 65)

    except ConnectionFailure as cf:
        print(f"[ERROR] Could not connect to Atlas: {cf}")
        sys.exit(1)
    except OperationFailure as of:
        print(f"[ERROR] Database operation failed: {of}")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error during setup: {e}")
        sys.exit(1)
    finally:
        if client:
            client.close()

if __name__ == "__main__":
    init_database()
