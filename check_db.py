"""
CampusSafe - MongoDB Atlas Connection Verification Script
Run this script from terminal:
    python check_db.py
"""

import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError, OperationFailure
from config import Config

def check_connection():
    print("=" * 60)
    print("CampusSafe - MongoDB Atlas Connection Verification")
    print("=" * 60)

    if not Config.is_mongo_configured():
        print("[ERROR] MONGO_URI is missing or still set to the placeholder in .env!")
        print("Please follow these steps:")
        print("1. Open or create your .env file in this directory.")
        print("2. Set MONGO_URI to your actual MongoDB Atlas connection string.")
        print("   Format: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority")
        print("3. Ensure your current IP is whitelisted in Atlas -> Network Access.")
        print("=" * 60)
        sys.exit(1)

    print("[INFO] Connecting to MongoDB Atlas...")
    client = None
    try:
        # Connect with 5-second timeout
        client = MongoClient(
            Config.MONGO_URI,
            serverSelectionTimeoutMS=Config.MONGO_TIMEOUT_MS,
            connectTimeoutMS=Config.MONGO_TIMEOUT_MS
        )
        
        # Issue a real ping to the database server
        print("[INFO] Sending ping command to verify authentication and network...")
        client.admin.command('ping')
        print("[SUCCESS] MongoDB Atlas cluster is reachable and authentication succeeded!")

        # Access database
        db = client[Config.MONGO_DB_NAME]
        print(f"[SUCCESS] Database '{Config.MONGO_DB_NAME}' selected.")
        
        # Check existing collections
        collections = db.list_collection_names()
        print(f"[INFO] Existing collections in '{Config.MONGO_DB_NAME}':")
        if collections:
            for col in collections:
                count = db[col].count_documents({})
                print(f"   - {col}: {count} document(s)")
        else:
            print("   (No collections found yet. Run 'python setup_db.py' to initialize schemas and sample contacts)")

        print("=" * 60)
        print("[STATUS] ALL DATABASE CHECKS PASSED!")
        print("You can now safely run: python app.py")
        print("=" * 60)

    except ConfigurationError as ce:
        print("[ERROR] MongoDB Atlas Configuration Error:")
        print(f"Details: {ce}")
        print("Tip: Check that your connection string has valid 'mongodb+srv://' syntax and correct credentials.")
        sys.exit(1)
    except ConnectionFailure as cf:
        print("[ERROR] Connection to MongoDB Atlas failed:")
        print(f"Details: {cf}")
        print("\nTroubleshooting Checklist:")
        print("1. Network Access: In MongoDB Atlas, go to 'Network Access' -> Add IP Address.")
        print("   If testing locally, allow your current IP or '0.0.0.0/0' for development.")
        print("2. Database User: Ensure the user exists under 'Database Access' and has readWriteAnyDatabase or readWrite privileges.")
        print("3. Password: If your password has special characters, encode them properly (or use an alphanumeric password).")
        print("4. Internet: Check your local internet connectivity and firewall.")
        sys.exit(1)
    except OperationFailure as of:
        print("[ERROR] Authentication or Authorization failed:")
        print(f"Details: {of}")
        print("Tip: Check your MongoDB username and password in the connection string.")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected database connection error: {e}")
        sys.exit(1)
    finally:
        if client:
            client.close()

if __name__ == "__main__":
    check_connection()
