# CampusSafe – Emergency Contact and Campus Safety Portal

## 📌 Project Overview

**CampusSafe** is a web-based application designed to improve campus safety by providing a centralized platform for incident reporting and emergency contact management. It allows students to report safety-related incidents and track their status, while administrators can review reports, update incident details, and manage emergency contact information.

The system aims to simplify campus incident management, maintain organized records, and support a safer educational environment.

## 🎯 Objectives

- Provide a centralized platform for campus incident reporting.
- Allow students to submit and track incident reports.
- Enable administrators to review and manage reported incidents.
- Maintain emergency contact information.
- Store user and incident details in a structured database.
- Provide a simple and user-friendly interface.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure |
| CSS3 | Styling and layout |
| Bootstrap 5 | Responsive user interface |
| JavaScript | Interactive functionality |
| Python Flask | Backend development |
| MongoDB | Database management |
| PyMongo | Flask–MongoDB connectivity |
| Werkzeug | Password hashing and security |
| Visual Studio Code | Development environment |

## ✨ Features

### 👨‍🎓 Student Module
- User registration and login.
- Submit campus incident reports.
- View previously submitted reports.
- Track incident status.
- View emergency contact information.

### 🛡️ Administrator Module
- Access the administrator dashboard.
- View submitted incident reports.
- Update incident statuses.
- Add administrative notes.
- Manage emergency contact information.

### 🔐 Security
- User authentication.
- Password hashing using Werkzeug.
- Separate functionalities for students and administrators.

## 🏗️ System Architecture

The application follows a three-layer architecture:

1. **Presentation Layer:** HTML, CSS, Bootstrap, and JavaScript provide the user interface.
2. **Application Layer:** Python Flask handles authentication, incident management, and application logic.
3. **Database Layer:** MongoDB stores users, incident reports, emergency contacts, and safety alerts.

## 🗄️ Database Collections

The application uses the `campus_safety_db` database with the following collections:

- `users` – Stores user account information.
- `incident_reports` – Stores reported campus incidents.
- `emergency_contacts` – Stores emergency contact details.
- `safety_alerts` – Stores safety-related alert information.

## ⚙️ Installation and Setup

### Prerequisites

Install the following software before running the project:

- Python 3
- MongoDB
- Visual Studio Code
- Git (optional)

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Campus-safety-portal
```

Alternatively, download the repository as a ZIP file and extract it.

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows Command Prompt:

```cmd
venv\Scripts\activate
```

### Step 3: Install Dependencies

If your project contains a `requirements.txt` file, run:

```bash
python -m pip install -r requirements.txt
```

If the file is not available, install the packages required by your application, including Flask and PyMongo.

### Step 4: Configure MongoDB

Ensure MongoDB is running and configure the database connection in the application according to your local setup.

Database name:

```text
campus_safety_db
```

Do not upload database passwords, secret keys, or other private credentials to GitHub.

### Step 5: Run the Application

Use the Python command corresponding to your Flask application's entry-point filename. For example, if the main file is `app.py`:

```bash
python app.py
```

Open the local URL displayed in the terminal, commonly:

```text
http://127.0.0.1:5000/
```

## 🧪 Testing

The main application functionalities can be tested using the following scenarios:

- Register a new student account.
- Log in with valid credentials.
- Submit an incident report.
- View the submitted report and its status.
- Log in as an administrator.
- Review reports and update their statuses.
- Add or update emergency contact details.
- Verify that changes are reflected in the application.

## 🔮 Future Enhancements

- GPS-based location sharing.
- Automated SMS and email notifications.
- Real-time emergency alerts.
- Mobile application support.
- Advanced incident statistics and reporting.
- Improved incident prioritization.

These features are proposed enhancements and are not part of the current implementation unless explicitly added.

## 🎓 Academic Project

**Project Name:** CampusSafe – Emergency Contact and Campus Safety Portal

**Domain:** Web Technology

**Purpose:** To develop a centralized web application for campus incident reporting and emergency contact management.

## 👥 Contributors
- PRADEEBA R S
- MUDIMI VARSHA 



This project was developed for academic purposes. Add a suitable open-source license if you intend to distribute and reuse the code under specific terms.
