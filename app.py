"""
CampusSafe - Emergency Contact and Campus Safety Portal
Flask Application with MongoDB Atlas Cloud Database Integration
"""

import os
import re
import random
import string
import datetime
from functools import wraps
from bson.objectid import ObjectId
from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, session, abort, jsonify
)
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.errors import ConnectionFailure, ConfigurationError, OperationFailure, DuplicateKeyError

from config import Config

# -------------------------------------------------------------------
# Application Initialization
# -------------------------------------------------------------------
app = Flask(__name__)
app.config.from_object(Config)

# MongoDB Client Holder
_mongo_client = None

def get_mongo_client():
    """Returns a singleton PyMongo client connected to MongoDB Atlas."""
    global _mongo_client
    if _mongo_client is None:
        if not Config.is_mongo_configured():
            return None
        try:
            _mongo_client = MongoClient(
                Config.MONGO_URI,
                serverSelectionTimeoutMS=Config.MONGO_TIMEOUT_MS,
                connectTimeoutMS=Config.MONGO_TIMEOUT_MS
            )
        except Exception:
            _mongo_client = None
    return _mongo_client

def get_db():
    """
    Safely gets the database instance and tests connectivity.
    Returns (db, error_string)
    """
    if not Config.is_mongo_configured():
        return None, (
            "MongoDB Atlas is not configured in .env. "
            "Please add your MONGO_URI to .env to connect to your Atlas cluster."
        )

    try:
        client = get_mongo_client()
        if client is None:
            return None, "Failed to initialize PyMongo client. Check your MONGO_URI in .env."
        # Ping the cluster to verify authentication and connection
        client.admin.command('ping')
        return client[Config.MONGO_DB_NAME], None
    except ConfigurationError as ce:
        return None, f"MongoDB Configuration Error: {str(ce)}"
    except ConnectionFailure as cf:
        return None, f"Could not connect to MongoDB Atlas cluster: {str(cf)}. Check IP Whitelist in Atlas."
    except OperationFailure as of:
        return None, f"MongoDB Authentication/Operation failed: {str(of)}. Check user credentials."
    except Exception as e:
        return None, f"Database error: {str(e)}"

# -------------------------------------------------------------------
# Authentication & Authorization Helpers
# -------------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Administrator login required.", "warning")
            return redirect(url_for('admin_login', next=request.url))
        if session.get('user_role') != 'admin':
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

def generate_reference_id():
    """Generates a professional unique incident reference ID: e.g. INC-202610-A7B2"""
    date_part = datetime.datetime.utcnow().strftime("%Y%m")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"INC-{date_part}-{random_part}"

# -------------------------------------------------------------------
# Context Processors (Injected into all templates)
# -------------------------------------------------------------------
@app.context_processor
def inject_global_data():
    current_user = None
    if 'user_id' in session:
        current_user = {
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'email': session.get('user_email'),
            'role': session.get('user_role'),
            'is_admin': session.get('user_role') == 'admin',
            'is_authenticated': True
        }
    else:
        current_user = {
            'is_authenticated': False,
            'is_admin': False
        }

    # Fetch active safety alerts if database is available
    active_alerts = []
    mongo_configured = Config.is_mongo_configured()
    try:
        db, err = get_db()
        if db is not None:
            alerts_cursor = db.safety_alerts.find({
                'is_active': True,
                'expires_at': {'$gt': datetime.datetime.utcnow()}
            }).sort('created_at', DESCENDING).limit(2)
            active_alerts = list(alerts_cursor)
    except Exception:
        active_alerts = []

    return {
        'current_user': current_user,
        'active_alerts': active_alerts,
        'mongo_configured': mongo_configured,
        'current_year': datetime.datetime.utcnow().year
    }

# -------------------------------------------------------------------
# Public Routes
# -------------------------------------------------------------------
@app.route('/')
def home():
    """Home Landing Page with project overview, statistics, and emergency cards."""
    db, err = get_db()
    stats = {
        'total_students': 0,
        'total_contacts': 0,
        'total_reports': 0,
        'resolved_reports': 0
    }
    featured_contacts = []

    if db is not None:
        try:
            stats['total_students'] = db.users.count_documents({'role': 'student'})
            stats['total_contacts'] = db.emergency_contacts.count_documents({'is_active': True})
            stats['total_reports'] = db.incident_reports.count_documents({})
            stats['resolved_reports'] = db.incident_reports.count_documents({'status': 'Resolved'})

            # Fetch top priority emergency contacts
            featured_contacts = list(db.emergency_contacts.find({'is_active': True}).limit(4))
        except Exception:
            pass

    return render_template(
        'index.html',
        stats=stats,
        featured_contacts=featured_contacts,
        db_error=err
    )

@app.route('/contacts')
def emergency_contacts():
    """Emergency Contacts Directory with real-time search and category filtering."""
    db, err = get_db()
    if db is None:
        return render_template('emergency_contacts.html', contacts=[], categories=[], db_error=err)

    search_query = request.args.get('q', '').strip()
    category_filter = request.args.get('category', '').strip()

    # Build MongoDB query
    query = {'is_active': True}
    if search_query:
        # Safe regex search across name and description
        escaped_query = re.escape(search_query)
        query['$or'] = [
            {'name': {'$regex': escaped_query, '$options': 'i'}},
            {'description': {'$regex': escaped_query, '$options': 'i'}},
            {'phone': {'$regex': escaped_query, '$options': 'i'}}
        ]

    if category_filter and category_filter != 'All':
        query['category'] = category_filter

    try:
        contacts = list(db.emergency_contacts.find(query).sort('name', ASCENDING))
        # Get distinct categories for filter buttons
        distinct_categories = db.emergency_contacts.distinct('category', {'is_active': True})
    except Exception as e:
        contacts = []
        distinct_categories = []
        err = f"Failed to retrieve emergency contacts: {str(e)}"

    return render_template(
        'emergency_contacts.html',
        contacts=contacts,
        categories=distinct_categories,
        current_query=search_query,
        current_category=category_filter,
        db_error=err
    )

@app.route('/guidelines')
def safety_guidelines():
    """Campus Safety Guidelines and Emergency Protocol Page."""
    return render_template('safety_guidelines.html')

# -------------------------------------------------------------------
# Student Authentication Routes
# -------------------------------------------------------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    """Student registration with validation, unique indexes, and Werkzeug hashing."""
    if 'user_id' in session:
        return redirect(url_for('home'))

    db, err = get_db()
    if request.method == 'POST':
        if db is None:
            flash(f"Database unavailable: {err}", "danger")
            return render_template('register.html')

        full_name = request.form.get('full_name', '').strip()
        student_id = request.form.get('student_id', '').strip().upper()
        email = request.form.get('email', '').strip().lower()
        department = request.form.get('department', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Server-side validation
        errors = []
        if not full_name or len(full_name) < 2:
            errors.append("Please enter your complete full name.")
        if not student_id or len(student_id) < 3:
            errors.append("Please enter a valid Student ID.")
        if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            errors.append("Please enter a valid university or personal email address.")
        if not department:
            errors.append("Please select or enter your academic department.")
        if len(password) < 6:
            errors.append("Password must be at least 6 characters long.")
        if password != confirm_password:
            errors.append("Passwords do not match.")

        if errors:
            for error in errors:
                flash(error, "danger")
            return render_template(
                'register.html',
                form_data={'full_name': full_name, 'student_id': student_id, 'email': email, 'department': department}
            )

        # Check uniqueness in MongoDB Atlas
        try:
            if db.users.find_one({'email': email}):
                flash("An account with this email address already exists.", "warning")
                return render_template('register.html', form_data={'full_name': full_name, 'student_id': student_id, 'department': department})

            if db.users.find_one({'student_id': student_id}):
                flash("An account with this Student ID already exists.", "warning")
                return render_template('register.html', form_data={'full_name': full_name, 'email': email, 'department': department})

            # Hash password securely (Werkzeug pbkdf2 or scrypt)
            hashed_password = generate_password_hash(password)

            user_doc = {
                'full_name': full_name,
                'student_id': student_id,
                'email': email,
                'department': department,
                'password_hash': hashed_password,
                'role': 'student',  # Public registration strictly restricted to student role
                'created_at': datetime.datetime.utcnow(),
                'is_active': True
            }

            db.users.insert_one(user_doc)
            flash("Registration successful! You may now log in with your credentials.", "success")
            return redirect(url_for('login'))

        except DuplicateKeyError:
            flash("Email or Student ID already in use. Please check your credentials.", "danger")
        except Exception as e:
            flash(f"Registration failed due to a database error: {str(e)}", "danger")

    return render_template('register.html', form_data={}, db_error=err)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Student Login route with authentication and session creation."""
    if 'user_id' in session:
        return redirect(url_for('home'))

    db, err = get_db()
    if request.method == 'POST':
        if db is None:
            flash(f"Database error: {err}", "danger")
            return render_template('login.html')

        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if not email or not password:
            flash("Please provide both email and password.", "danger")
            return render_template('login.html', email=email)

        try:
            user = db.users.find_one({'email': email})
            if user and check_password_hash(user.get('password_hash', ''), password):
                if not user.get('is_active', True):
                    flash("Your account is currently deactivated. Please contact campus security.", "danger")
                    return render_template('login.html')

                # Establish session
                session.clear()
                session['user_id'] = str(user['_id'])
                session['user_name'] = user.get('full_name', 'Student')
                session['user_email'] = user.get('email')
                session['user_role'] = user.get('role', 'student')
                session['student_id'] = user.get('student_id', '')

                flash(f"Welcome back, {session['user_name']}!", "success")
                next_url = request.args.get('next')
                if next_url and next_url.startswith('/'):
                    return redirect(next_url)
                return redirect(url_for('home'))
            else:
                flash("Invalid email or password. Please try again.", "danger")

        except Exception as e:
            flash(f"Authentication error: {str(e)}", "danger")

    return render_template('login.html', db_error=err)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Administrator Login route with strict role checking."""
    if 'user_id' in session and session.get('user_role') == 'admin':
        return redirect(url_for('admin_dashboard'))

    db, err = get_db()
    if request.method == 'POST':
        if db is None:
            flash(f"Database error: {err}", "danger")
            return render_template('admin_login.html')

        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        try:
            user = db.users.find_one({'email': email})
            if user and check_password_hash(user.get('password_hash', ''), password):
                if user.get('role') != 'admin':
                    flash("Access denied: You do not possess administrator privileges.", "danger")
                    return render_template('admin_login.html')

                session.clear()
                session['user_id'] = str(user['_id'])
                session['user_name'] = user.get('full_name', 'Admin')
                session['user_email'] = user.get('email')
                session['user_role'] = 'admin'

                flash("Administrator access verified.", "success")
                return redirect(url_for('admin_dashboard'))
            else:
                flash("Invalid administrator credentials.", "danger")
        except Exception as e:
            flash(f"Authentication error: {str(e)}", "danger")

    return render_template('admin_login.html', db_error=err)

@app.route('/logout')
def logout():
    """Clear user session and redirect to home."""
    session.clear()
    flash("You have been securely logged out.", "info")
    return redirect(url_for('home'))

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile overview and password update."""
    db, err = get_db()
    if db is None:
        flash(f"Database error: {err}", "danger")
        return redirect(url_for('home'))

    user = db.users.find_one({'_id': ObjectId(session['user_id'])})
    if not user:
        session.clear()
        return redirect(url_for('login'))

    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'update_profile':
            full_name = request.form.get('full_name', '').strip()
            department = request.form.get('department', '').strip()
            if full_name and department:
                db.users.update_one(
                    {'_id': ObjectId(session['user_id'])},
                    {'$set': {'full_name': full_name, 'department': department}}
                )
                session['user_name'] = full_name
                flash("Profile details updated successfully.", "success")
            else:
                flash("Name and department cannot be empty.", "warning")
        elif action == 'change_password':
            old_pass = request.form.get('old_password', '')
            new_pass = request.form.get('new_password', '')
            confirm_new = request.form.get('confirm_new_password', '')

            if not check_password_hash(user.get('password_hash', ''), old_pass):
                flash("Current password is incorrect.", "danger")
            elif len(new_pass) < 6:
                flash("New password must be at least 6 characters.", "danger")
            elif new_pass != confirm_new:
                flash("New passwords do not match.", "danger")
            else:
                new_hash = generate_password_hash(new_pass)
                db.users.update_one(
                    {'_id': ObjectId(session['user_id'])},
                    {'$set': {'password_hash': new_hash}}
                )
                flash("Password changed successfully.", "success")

        # Refresh user object
        user = db.users.find_one({'_id': ObjectId(session['user_id'])})

    # Get student's report statistics
    report_count = db.incident_reports.count_documents({'user_id': session['user_id']})

    return render_template('profile.html', user=user, report_count=report_count)

# -------------------------------------------------------------------
# Incident Reporting Module
# -------------------------------------------------------------------
@app.route('/report', methods=['GET', 'POST'])
@login_required
def report_incident():
    """Incident report submission form with validation, ID generation, and Atlas persistence."""
    categories = [
        "Medical Emergency",
        "Harassment",
        "Suspicious Activity",
        "Theft",
        "Fire Hazard",
        "Infrastructure or Safety Hazard",
        "Other"
    ]
    urgency_levels = ["Low", "Medium", "High", "Critical"]

    db, err = get_db()
    if request.method == 'POST':
        if db is None:
            flash(f"Database error: Could not save report. {err}", "danger")
            return render_template('report_incident.html', categories=categories, urgencies=urgency_levels)

        incident_type = request.form.get('incident_type', '').strip()
        location = request.form.get('location', '').strip()
        incident_datetime_str = request.form.get('incident_datetime', '').strip()
        urgency = request.form.get('urgency', '').strip()
        description = request.form.get('description', '').strip()
        contact_info = request.form.get('contact_info', '').strip()
        supporting_details = request.form.get('supporting_details', '').strip()

        # Validation
        errors = []
        if incident_type not in categories:
            errors.append("Please select a valid incident category.")
        if not location or len(location) < 3:
            errors.append("Please specify an accurate campus location.")
        if urgency not in urgency_levels:
            errors.append("Please select a valid urgency level.")
        if not description or len(description) < 15:
            errors.append("Please provide a detailed description (at least 15 characters).")

        # Parse datetime
        incident_dt = datetime.datetime.utcnow()
        if incident_datetime_str:
            try:
                incident_dt = datetime.datetime.fromisoformat(incident_datetime_str)
            except ValueError:
                incident_dt = datetime.datetime.utcnow()

        if errors:
            for error in errors:
                flash(error, "danger")
            return render_template(
                'report_incident.html',
                categories=categories,
                urgencies=urgency_levels,
                form_data=request.form
            )

        try:
            # Generate unique reference ID
            reference_id = generate_reference_id()
            now = datetime.datetime.utcnow()

            report_doc = {
                'reference_id': reference_id,
                'user_id': session['user_id'],
                'user_name': session.get('user_name', 'Student'),
                'user_email': session.get('user_email', ''),
                'incident_type': incident_type,
                'location': location,
                'incident_datetime': incident_dt,
                'description': description,
                'urgency': urgency,
                'status': 'Submitted',
                'contact_info': contact_info,
                'supporting_details': supporting_details,
                'investigation_notes': "",
                'status_history': [
                    {
                        'status': 'Submitted',
                        'changed_at': now,
                        'changed_by': session.get('user_name', 'Student'),
                        'note': 'Incident report submitted by student.'
                    }
                ],
                'created_at': now,
                'updated_at': now
            }

            db.incident_reports.insert_one(report_doc)
            flash(f"Incident report successfully submitted! Your Reference ID is: {reference_id}", "success")
            return redirect(url_for('report_details', reference_id=reference_id))

        except Exception as e:
            flash(f"Failed to submit incident report: {str(e)}", "danger")

    return render_template(
        'report_incident.html',
        categories=categories,
        urgencies=urgency_levels,
        form_data={},
        db_error=err
    )

@app.route('/my-reports')
@login_required
def my_reports():
    """List of incident reports submitted by the logged-in student."""
    db, err = get_db()
    if db is None:
        return render_template('my_reports.html', reports=[], db_error=err)

    status_filter = request.args.get('status', '').strip()
    query = {'user_id': session['user_id']}
    if status_filter and status_filter in ['Submitted', 'Under Review', 'Resolved']:
        query['status'] = status_filter

    try:
        reports = list(db.incident_reports.find(query).sort('created_at', DESCENDING))
    except Exception as e:
        reports = []
        err = f"Failed to retrieve reports: {str(e)}"

    return render_template(
        'my_reports.html',
        reports=reports,
        current_status=status_filter,
        db_error=err
    )

@app.route('/report/<reference_id>')
@login_required
def report_details(reference_id):
    """View details and status progression of a specific incident report."""
    db, err = get_db()
    if db is None:
        flash(f"Database error: {err}", "danger")
        return redirect(url_for('my_reports'))

    report = db.incident_reports.find_one({'reference_id': reference_id})
    if not report:
        abort(404)

    # Authorization: Students can only view their own reports; Administrators can view any report
    if session.get('user_role') != 'admin' and report.get('user_id') != session['user_id']:
        abort(403)

    return render_template('report_details.html', report=report)

# -------------------------------------------------------------------
# Administrator Portal Routes
# -------------------------------------------------------------------
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    """Admin dashboard with key metrics, analytics data, and recent incident reports."""
    db, err = get_db()
    metrics = {
        'total_students': 0,
        'total_reports': 0,
        'submitted_reports': 0,
        'under_review_reports': 0,
        'resolved_reports': 0,
        'critical_urgency': 0,
        'high_urgency': 0,
        'total_contacts': 0
    }
    recent_reports = []
    category_counts = {}
    status_counts = {'Submitted': 0, 'Under Review': 0, 'Resolved': 0}

    if db is not None:
        try:
            metrics['total_students'] = db.users.count_documents({'role': 'student'})
            metrics['total_reports'] = db.incident_reports.count_documents({})
            metrics['submitted_reports'] = db.incident_reports.count_documents({'status': 'Submitted'})
            metrics['under_review_reports'] = db.incident_reports.count_documents({'status': 'Under Review'})
            metrics['resolved_reports'] = db.incident_reports.count_documents({'status': 'Resolved'})
            metrics['critical_urgency'] = db.incident_reports.count_documents({'urgency': 'Critical'})
            metrics['high_urgency'] = db.incident_reports.count_documents({'urgency': 'High'})
            metrics['total_contacts'] = db.emergency_contacts.count_documents({})

            # Status counts for Chart.js
            status_counts['Submitted'] = metrics['submitted_reports']
            status_counts['Under Review'] = metrics['under_review_reports']
            status_counts['Resolved'] = metrics['resolved_reports']

            # Category aggregation for Chart.js
            pipeline = [
                {'$group': {'_id': '$incident_type', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
            cat_results = list(db.incident_reports.aggregate(pipeline))
            for item in cat_results:
                category_counts[item['_id']] = item['count']

            # Recent 8 reports
            recent_reports = list(db.incident_reports.find({}).sort('created_at', DESCENDING).limit(8))

        except Exception as e:
            err = f"Failed to compute dashboard analytics: {str(e)}"

    return render_template(
        'admin_dashboard.html',
        metrics=metrics,
        recent_reports=recent_reports,
        category_counts=category_counts,
        status_counts=status_counts,
        db_error=err
    )

@app.route('/admin/reports')
@admin_required
def admin_reports():
    """All incident reports with multi-criteria filtering and search."""
    db, err = get_db()
    if db is None:
        return render_template('admin_reports.html', reports=[], db_error=err)

    query = {}
    search_q = request.args.get('q', '').strip()
    status_f = request.args.get('status', '').strip()
    urgency_f = request.args.get('urgency', '').strip()
    category_f = request.args.get('category', '').strip()

    if search_q:
        escaped_q = re.escape(search_q)
        query['$or'] = [
            {'reference_id': {'$regex': escaped_q, '$options': 'i'}},
            {'location': {'$regex': escaped_q, '$options': 'i'}},
            {'description': {'$regex': escaped_q, '$options': 'i'}},
            {'user_name': {'$regex': escaped_q, '$options': 'i'}}
        ]

    if status_f and status_f != 'All':
        query['status'] = status_f
    if urgency_f and urgency_f != 'All':
        query['urgency'] = urgency_f
    if category_f and category_f != 'All':
        query['incident_type'] = category_f

    try:
        reports = list(db.incident_reports.find(query).sort('created_at', DESCENDING))
        categories = db.incident_reports.distinct('incident_type')
    except Exception as e:
        reports = []
        categories = []
        err = f"Failed to fetch reports: {str(e)}"

    return render_template(
        'admin_reports.html',
        reports=reports,
        categories=categories,
        current_q=search_q,
        current_status=status_f,
        current_urgency=urgency_f,
        current_category=category_f,
        db_error=err
    )

@app.route('/admin/reports/<reference_id>', methods=['GET', 'POST'])
@admin_required
def admin_report_details(reference_id):
    """Admin inspection of incident report, investigation notes, and status transition."""
    db, err = get_db()
    if db is None:
        flash(f"Database error: {err}", "danger")
        return redirect(url_for('admin_reports'))

    report = db.incident_reports.find_one({'reference_id': reference_id})
    if not report:
        abort(404)

    if request.method == 'POST':
        new_status = request.form.get('status', '').strip()
        investigation_note = request.form.get('investigation_note', '').strip()

        if new_status in ['Submitted', 'Under Review', 'Resolved']:
            now = datetime.datetime.utcnow()
            history_entry = {
                'status': new_status,
                'changed_at': now,
                'changed_by': session.get('user_name', 'Administrator'),
                'note': investigation_note if investigation_note else f"Status updated to {new_status}."
            }

            update_data = {
                'status': new_status,
                'updated_at': now
            }
            if investigation_note:
                update_data['investigation_notes'] = investigation_note

            db.incident_reports.update_one(
                {'reference_id': reference_id},
                {
                    '$set': update_data,
                    '$push': {'status_history': history_entry}
                }
            )
            flash(f"Report {reference_id} status updated to '{new_status}'.", "success")
            return redirect(url_for('admin_report_details', reference_id=reference_id))

    return render_template('admin_report_details.html', report=report)

@app.route('/admin/contacts', methods=['GET', 'POST'])
@admin_required
def admin_contacts():
    """Manage Emergency Contacts: CRUD operations."""
    db, err = get_db()
    if db is None:
        return render_template('admin_contacts.html', contacts=[], db_error=err)

    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'create':
            name = request.form.get('name', '').strip()
            category = request.form.get('category', '').strip()
            phone = request.form.get('phone', '').strip()
            description = request.form.get('description', '').strip()
            availability = request.form.get('availability', '').strip()

            if name and category and phone:
                new_contact = {
                    'name': name,
                    'category': category,
                    'phone': phone,
                    'description': description,
                    'availability': availability or "Standard Campus Hours",
                    'is_active': True,
                    'created_at': datetime.datetime.utcnow(),
                    'updated_at': datetime.datetime.utcnow()
                }
                db.emergency_contacts.insert_one(new_contact)
                flash(f"Emergency contact '{name}' created successfully.", "success")
            else:
                flash("Contact Name, Category, and Phone number are required.", "danger")

        elif action == 'edit':
            contact_id = request.form.get('contact_id')
            name = request.form.get('name', '').strip()
            category = request.form.get('category', '').strip()
            phone = request.form.get('phone', '').strip()
            description = request.form.get('description', '').strip()
            availability = request.form.get('availability', '').strip()
            is_active = request.form.get('is_active') == 'on'

            if contact_id and name and category and phone:
                try:
                    db.emergency_contacts.update_one(
                        {'_id': ObjectId(contact_id)},
                        {
                            '$set': {
                                'name': name,
                                'category': category,
                                'phone': phone,
                                'description': description,
                                'availability': availability,
                                'is_active': is_active,
                                'updated_at': datetime.datetime.utcnow()
                            }
                        }
                    )
                    flash(f"Contact '{name}' updated successfully.", "success")
                except Exception as e:
                    flash(f"Failed to update contact: {str(e)}", "danger")

        elif action == 'delete':
            contact_id = request.form.get('contact_id')
            if contact_id:
                try:
                    db.emergency_contacts.delete_one({'_id': ObjectId(contact_id)})
                    flash("Emergency contact deleted.", "info")
                except Exception as e:
                    flash(f"Failed to delete contact: {str(e)}", "danger")

        elif action == 'toggle_status':
            contact_id = request.form.get('contact_id')
            current_status = request.form.get('current_status') == 'True'
            if contact_id:
                try:
                    db.emergency_contacts.update_one(
                        {'_id': ObjectId(contact_id)},
                        {'$set': {'is_active': not current_status, 'updated_at': datetime.datetime.utcnow()}}
                    )
                    flash("Contact status toggled.", "info")
                except Exception as e:
                    flash(f"Failed to toggle status: {str(e)}", "danger")

        return redirect(url_for('admin_contacts'))

    try:
        contacts = list(db.emergency_contacts.find({}).sort('category', ASCENDING))
    except Exception as e:
        contacts = []
        err = f"Failed to load contacts: {str(e)}"

    return render_template('admin_contacts.html', contacts=contacts, db_error=err)

# -------------------------------------------------------------------
# Error Handlers
# -------------------------------------------------------------------
@app.errorhandler(403)
def forbidden_error(error):
    return render_template('403.html'), 403

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(error):
    return render_template('500.html'), 500

# -------------------------------------------------------------------
# Entrypoint for Local Development
# -------------------------------------------------------------------
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV', 'development') == 'development'
    print("=" * 65)
    print("Starting CampusSafe Portal on http://127.0.0.1:5000")
    print("=" * 65)
    app.run(host='127.0.0.1', port=port, debug=debug_mode)
