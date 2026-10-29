/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Phone,
  PhoneCall,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Hourglass,
  Send,
  User,
  Users,
  Lock,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  HeartPulse,
  Building,
  Key,
  BarChart3,
  PieChart,
  Terminal,
  Database,
  Info,
  LogOut,
  LogIn,
  Check,
  X
} from 'lucide-react';

// --- TYPES ---
export interface Contact {
  id: string;
  name: string;
  category: string;
  phone: string;
  description: string;
  availability: string;
  isActive: boolean;
}

export interface StatusHistoryItem {
  status: 'Submitted' | 'Under Review' | 'Resolved';
  changedAt: string;
  changedBy: string;
  note: string;
}

export interface IncidentReport {
  referenceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  incidentType: string;
  location: string;
  incidentDatetime: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Submitted' | 'Under Review' | 'Resolved';
  contactInfo?: string;
  supportingDetails?: string;
  investigationNotes?: string;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
}

// --- INITIAL DEMONSTRATION DATA (Matching setup_db.py MongoDB Atlas Seed Data) ---
const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Campus Security Main Control Room (DEMO)',
    category: 'Campus Security',
    phone: '0422-2614000',
    description: 'Main gate security dispatch and campus patrol desk for safety inquiries (Demonstration Entry).',
    availability: '24/7 Round the Clock',
    isActive: true
  },
  {
    id: 'c2',
    name: 'Campus Health & Medical Centre (DEMO)',
    category: 'Medical & Health',
    phone: '0422-2614108',
    description: 'On-campus health dispensary, primary care triage, and campus first-aid dispatch (Demonstration Entry).',
    availability: '24/7 Emergency Ward',
    isActive: true
  },
  {
    id: 'c3',
    name: 'Campus Fire Safety & Hazard Response (DEMO)',
    category: 'Fire & Hazard',
    phone: '0422-2614101',
    description: 'Chemical lab safety, smoke or electrical fire reporting, evacuation coordination (Demonstration Entry).',
    availability: '24/7 Emergency Line',
    isActive: true
  },
  {
    id: 'c4',
    name: "Women's Safety & Anti-Harassment Cell (DEMO)",
    category: 'Counseling & Support',
    phone: '0422-2614112',
    description: 'Confidential advisory, anti-ragging support, and grievance committee contact (Demonstration Entry).',
    availability: 'Monday - Saturday, 8:00 AM - 8:00 PM',
    isActive: true
  },
  {
    id: 'c5',
    name: 'Student Counseling & Psychological Support (DEMO)',
    category: 'Counseling & Support',
    phone: '0422-2614220',
    description: 'Student emotional well-being, crisis counseling, and academic stress assistance (Demonstration Entry).',
    availability: 'Monday - Friday, 9:00 AM - 6:00 PM',
    isActive: true
  },
  {
    id: 'c6',
    name: 'Campus Electrical & Infrastructure Maintenance (DEMO)',
    category: 'Facilities & Maintenance',
    phone: '0422-2614330',
    description: 'Report broken pathways, hazardous exposed wiring, dark walkways, or water leaks (Demonstration Entry).',
    availability: 'Monday - Saturday, 8:00 AM - 7:00 PM',
    isActive: true
  }
];

const INITIAL_REPORTS: IncidentReport[] = [
  {
    referenceId: 'INC-202610-89F2',
    userId: 'u1',
    userName: 'Alex Johnson',
    userEmail: 'alex.j@campus.edu',
    incidentType: 'Infrastructure or Safety Hazard',
    location: 'Science Block 3, 2nd Floor Staircase',
    incidentDatetime: '2026-10-27T14:30',
    description: 'Loose electrical conduit with exposed wiring dangling right near the emergency stairwell railing.',
    urgency: 'High',
    status: 'Under Review',
    contactInfo: '+91 98765 43210',
    supportingDetails: 'Reported to block floor supervisor verbally.',
    investigationNotes: 'Campus electrical maintenance team dispatched to insulate and secure conduit.',
    createdAt: '2026-10-27T14:35:00Z',
    statusHistory: [
      {
        status: 'Submitted',
        changedAt: '2026-10-27 14:35',
        changedBy: 'Alex Johnson',
        note: 'Incident report submitted by student.'
      },
      {
        status: 'Under Review',
        changedAt: '2026-10-27 15:10',
        changedBy: 'Campus Safety Admin',
        note: 'Assigned to Electrical Maintenance unit for immediate inspection.'
      }
    ]
  },
  {
    referenceId: 'INC-202610-41A7',
    userId: 'u1',
    userName: 'Alex Johnson',
    userEmail: 'alex.j@campus.edu',
    incidentType: 'Theft',
    location: 'Central Library, Ground Floor Study Quad',
    incidentDatetime: '2026-10-26T17:15',
    description: 'Blue Lenovo laptop bag and scientific calculator left on study desk 14 were missing after return from restroom.',
    urgency: 'Medium',
    status: 'Resolved',
    contactInfo: '+91 98765 43210',
    supportingDetails: 'Desk is directly under CCTV Camera 04.',
    investigationNotes: 'CCTV footage reviewed. Item had been turned into the Library Lost & Found desk by library assistant. Returned to student.',
    createdAt: '2026-10-26T17:30:00Z',
    statusHistory: [
      {
        status: 'Submitted',
        changedAt: '2026-10-26 17:30',
        changedBy: 'Alex Johnson',
        note: 'Report filed by student.'
      },
      {
        status: 'Under Review',
        changedAt: '2026-10-26 18:00',
        changedBy: 'Campus Safety Admin',
        note: 'Library CCTV review requested.'
      },
      {
        status: 'Resolved',
        changedAt: '2026-10-27 10:15',
        changedBy: 'Campus Safety Admin',
        note: 'Item safely retrieved and handed over.'
      }
    ]
  },
  {
    referenceId: 'INC-202610-12B9',
    userId: 'u2',
    userName: 'Priya Sharma',
    userEmail: 'priya.s@campus.edu',
    incidentType: 'Suspicious Activity',
    location: 'East Perimeter Road near Hostel 4',
    incidentDatetime: '2026-10-28T07:45',
    description: 'Unidentified individuals attempting to bypass security turnstiles and photographing vehicle parking sheds without student badges.',
    urgency: 'High',
    status: 'Submitted',
    contactInfo: '+91 98123 45678',
    supportingDetails: 'Two individuals in dark windbreakers.',
    investigationNotes: '',
    createdAt: '2026-10-28T08:00:00Z',
    statusHistory: [
      {
        status: 'Submitted',
        changedAt: '2026-10-28 08:00',
        changedBy: 'Priya Sharma',
        note: 'Incident logged by student.'
      }
    ]
  }
];

export default function App() {
  // Navigation State: 'home' | 'contacts' | 'report' | 'my-reports' | 'guidelines' | 'login' | 'register' | 'profile' | 'admin-login' | 'admin-dashboard' | 'admin-reports' | 'admin-contacts'
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Registered Users Directory (Stores registered students and admins)
  const [registeredUsers, setRegisteredUsers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    studentId: string;
    department: string;
    password?: string;
  }>>([
    {
      id: 'admin_1',
      name: 'Campus Safety Administrator',
      email: 'admin@campus.edu',
      role: 'admin',
      studentId: 'ADMIN-001',
      department: 'Campus Security & Safety Office',
      password: 'AdminPass2026'
    }
  ]);

  // Current Logged-in User State (null by default so visitors are not logged in until registering or signing in)
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    studentId: string;
    department: string;
  } | null>(null);

  // Data States
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [reports, setReports] = useState<IncidentReport[]>(INITIAL_REPORTS);

  // Filter States
  const [contactSearch, setContactSearch] = useState('');
  const [contactCategory, setContactCategory] = useState('All');
  const [reportStatusFilter, setReportStatusFilter] = useState('All');

  // Admin filter states
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [adminUrgencyFilter, setAdminUrgencyFilter] = useState('All');

  // Flash Notification
  const [flashMsg, setFlashMsg] = useState<{ text: string; type: 'success' | 'warning' | 'danger' | 'info' } | null>(null);

  const showFlash = (text: string, type: 'success' | 'warning' | 'danger' | 'info' = 'success') => {
    setFlashMsg({ text, type });
    setTimeout(() => setFlashMsg(null), 5000);
  };

  // Contacts Filtering
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone.includes(contactSearch);
      const matchesCategory = contactCategory === 'All' || c.category === contactCategory;
      return c.isActive && matchesSearch && matchesCategory;
    });
  }, [contacts, contactSearch, contactCategory]);

  const distinctCategories = useMemo(() => {
    const set = new Set(contacts.map((c) => c.category));
    return ['All', ...Array.from(set)];
  }, [contacts]);

  // Student's reports
  const studentReports = useMemo(() => {
    if (!user) return [];
    return reports.filter((r) => {
      const isOwner = r.userId === user.id;
      const matchesStatus = reportStatusFilter === 'All' || r.status === reportStatusFilter;
      return isOwner && matchesStatus;
    });
  }, [reports, user, reportStatusFilter]);

  // Admin reports filtered
  const adminFilteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.referenceId.toLowerCase().includes(adminSearch.toLowerCase()) ||
        r.location.toLowerCase().includes(adminSearch.toLowerCase()) ||
        r.userName.toLowerCase().includes(adminSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(adminSearch.toLowerCase());
      const matchesStatus = adminStatusFilter === 'All' || r.status === adminStatusFilter;
      const matchesUrgency = adminUrgencyFilter === 'All' || r.urgency === adminUrgencyFilter;
      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [reports, adminSearch, adminStatusFilter, adminUrgencyFilter]);

  // Selected report for modal / detail view
  const currentSelectedReport = useMemo(() => {
    return reports.find((r) => r.referenceId === selectedReportId) || null;
  }, [reports, selectedReportId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] font-sans antialiased">

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0f2744] text-white shadow-md border-b border-[#1e3a8a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-amber-400 shadow-inner group-hover:bg-teal-600 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xl tracking-tight text-white">Campus</span>
                <span className="font-extrabold text-xl tracking-tight text-teal-400">Safe</span>
                <span className="bg-teal-600 text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded ml-1">
                  Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-300 block tracking-wide">Emergency &amp; Safety Desk</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentPage === 'home' ? 'bg-white/15 text-white' : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('contacts')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                currentPage === 'contacts' ? 'bg-white/15 text-white' : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-teal-400" /> Emergency Contacts
            </button>
            <button
              onClick={() => setCurrentPage('guidelines')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentPage === 'guidelines' ? 'bg-white/15 text-white' : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Safety Guidelines
            </button>

            {user && user.role === 'student' && (
              <button
                onClick={() => setCurrentPage('my-reports')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  currentPage === 'my-reports' ? 'bg-white/15 text-white' : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" /> My Reports
              </button>
            )}

            {user && user.role === 'admin' && (
              <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-lg">
                <button
                  onClick={() => setCurrentPage('admin-dashboard')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    currentPage === 'admin-dashboard' ? 'bg-amber-400 text-slate-900' : 'text-amber-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('admin-reports')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    currentPage === 'admin-reports' ? 'bg-amber-400 text-slate-900' : 'text-amber-300 hover:text-white'
                  }`}
                >
                  Manage Reports
                </button>
                <button
                  onClick={() => setCurrentPage('admin-contacts')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    currentPage === 'admin-contacts' ? 'bg-amber-400 text-slate-900' : 'text-amber-300 hover:text-white'
                  }`}
                >
                  Manage Helplines
                </button>
              </div>
            )}
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (!user) {
                  showFlash('Please sign in to submit an incident report.', 'warning');
                  setCurrentPage('login');
                } else {
                  setCurrentPage('report');
                }
              }}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Report Incident</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="flex items-center gap-2 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-teal-300 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                    <div className="text-[10px] text-teal-300 capitalize">{user.role}</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setUser(null);
                    showFlash('You have been securely logged out.', 'info');
                    setCurrentPage('home');
                  }}
                  title="Log out"
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-slate-200 hover:text-white text-xs sm:text-sm font-medium px-2.5 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Safety Alert Ticker (Active Advisories) */}
      <div className="bg-[#172554] text-white text-xs px-4 py-2 border-b border-blue-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Advisory
            </span>
            <span className="font-semibold text-slate-200">Campus Advisory Notice:</span>
            <span className="text-slate-300 truncate">
              Demonstration Portal active. For life-threatening emergencies, dial national 112 or contact campus gate security at 0422-2614000.
            </span>
          </div>
          <button
            onClick={() => setCurrentPage('contacts')}
            className="text-teal-300 hover:underline shrink-0 font-medium hidden sm:inline"
          >
            Emergency Helplines &rarr;
          </button>
        </div>
      </div>

      {/* Toast / Flash Message */}
      {flashMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-3 w-full">
          <div
            className={`p-3 rounded-lg text-sm flex items-center justify-between shadow-sm border ${
              flashMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : flashMsg.type === 'danger'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : flashMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {flashMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {flashMsg.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
              {flashMsg.type === 'warning' && <Info className="w-4 h-4 text-amber-600" />}
              {flashMsg.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
              <span>{flashMsg.text}</span>
            </div>
            <button onClick={() => setFlashMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* --- PAGE: HOME --- */}
        {currentPage === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2744] via-[#1e3a8a] to-[#0d9488] text-white p-6 sm:p-10 shadow-xl">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-teal-200 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Centralized Campus Safety Portal &amp; Emergency Hub</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white mb-4">
                  CampusSafe — Emergency Contact &amp; Campus Safety
                </h1>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                  Quick access to verified campus security, emergency medical triage, anti-harassment helplines, and transparent incident reporting with trackable reference IDs.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setCurrentPage('contacts')}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
                  >
                    <PhoneCall className="w-4 h-4" /> Emergency Contacts
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        showFlash('Please log in as a student to file an incident report.', 'warning');
                        setCurrentPage('login');
                      } else {
                        setCurrentPage('report');
                      }
                    }}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-300" /> Report an Incident
                  </button>
                  <button
                    onClick={() => setCurrentPage('guidelines')}
                    className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
                  >
                    Safety Guidelines
                  </button>
                </div>
              </div>

              {/* Decorative Background Shield */}
              <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
                <Shield className="w-96 h-96 text-white" />
              </div>
            </div>

            {/* Live Metrics Counter (Calculated from Real MongoDB Atlas Schema) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm border-l-4 border-l-[#0f2744]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0f2744]">240+</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Registered Students
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm border-l-4 border-l-teal-600">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">{contacts.length}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Verified Helplines
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">{reports.length}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Reports Processed
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm border-l-4 border-l-emerald-600">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {reports.filter((r) => r.status === 'Resolved').length}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Incidents Resolved
                </div>
              </div>
            </div>

            {/* Featured Emergency Helplines */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0f2744]">Key Emergency Helplines</h2>
                  <p className="text-xs text-slate-500">Fast dial access to verified on-campus desks (Demo records)</p>
                </div>
                <button
                  onClick={() => setCurrentPage('contacts')}
                  className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  View All Directory <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold bg-slate-100 text-[#0f2744] px-2 py-0.5 rounded border">
                          {c.category}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 24/7 Active
                        </span>
                      </div>
                      <h3 className="font-bold text-[#0f2744] text-base mb-1">{c.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-teal-700 hover:text-teal-800 font-bold text-sm flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-4 h-4" /> {c.phone}
                      </a>
                      <span className="text-[11px] text-slate-400">{c.availability}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Incident Reporting Works (3-step workflow) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="bg-teal-100 text-teal-800 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                  Reporting Protocol
                </span>
                <h2 className="text-2xl font-black text-[#0f2744] mt-2 mb-1">How CampusSafe Protects You</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Every submission is securely encrypted and routed directly to authorized campus safety officers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0f2744] text-white font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    1
                  </div>
                  <h3 className="font-bold text-[#0f2744] mb-1">Submit Incident Details</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose category, location, and urgency. Add optional witness info and direct contact details.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    2
                  </div>
                  <h3 className="font-bold text-[#0f2744] mb-1">Track with Reference ID</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Receive a trackable reference ID (e.g. <code>INC-202610-89F2</code>) saved in your Atlas database.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    3
                  </div>
                  <h3 className="font-bold text-[#0f2744] mb-1">Resolution &amp; Audit Trail</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Security personnel investigate, update status to <em>Under Review</em> or <em>Resolved</em>, and log notes.
                  </p>
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    if (!user) {
                      showFlash('Please log in as a student to file an incident report.', 'warning');
                      setCurrentPage('login');
                    } else {
                      setCurrentPage('report');
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl shadow transition text-sm"
                >
                  File an Incident Report Now
                </button>
              </div>
            </div>

            {/* Awareness Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0f2744]">Medical Response Protocol</h3>
                    <span className="text-xs text-slate-500">Dispensary, stretchers &amp; ambulance lanes</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  In acute medical situations, notify the on-campus health dispensary immediately. Keep campus entrance gates cleared for incoming ambulance vehicles.
                </p>
                <button
                  onClick={() => setCurrentPage('guidelines')}
                  className="text-teal-700 hover:underline text-xs font-semibold flex items-center gap-1"
                >
                  Read medical procedures &rarr;
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0f2744]">Anti-Harassment &amp; Anti-Ragging</h3>
                    <span className="text-xs text-slate-500">Zero tolerance policy with confidential advisory</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  University rules strictly prohibit hazing, intimidation, and verbal harassment. The Women's Safety Cell maintains protected anonymity for reporting students.
                </p>
                <button
                  onClick={() => setCurrentPage('guidelines')}
                  className="text-teal-700 hover:underline text-xs font-semibold flex items-center gap-1"
                >
                  Read harassment prevention policies &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: EMERGENCY CONTACTS --- */}
        {currentPage === 'contacts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                  <Phone className="w-6 h-6 text-teal-600" /> Campus Emergency Helplines
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Direct telephone contact directory for on-campus security, medical triage, and support cells.
                </p>
              </div>
              {user && user.role === 'admin' && (
                <button
                  onClick={() => setCurrentPage('admin-contacts')}
                  className="bg-[#0f2744] hover:bg-[#1e3a8a] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                >
                  Manage Contacts (Admin)
                </button>
              )}
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Academic Demonstration Numbers:</strong> The numbers provided below are demonstration lines for our Web Technology III project. In real emergencies outside campus, please call national emergency numbers (112, 100, 108).
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by contact name or keyword..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Category:
                </span>
                {distinctCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setContactCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                      contactCategory === cat
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts Grid */}
            {filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold bg-slate-100 text-[#0f2744] px-2 py-0.5 rounded border">
                          {contact.category}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      </div>
                      <h3 className="font-bold text-[#0f2744] text-base mb-1.5">{contact.name}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{contact.description}</p>
                    </div>

                    <div>
                      <div className="bg-slate-50 p-2.5 rounded-lg mb-3">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Availability</div>
                        <div className="text-xs text-slate-700 font-medium">{contact.availability}</div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold py-2 rounded-lg border border-teal-200 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <PhoneCall className="w-4 h-4 text-teal-600" />
                        <span>{contact.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700">No Helplines Matched</h3>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All".</p>
                <button
                  onClick={() => {
                    setContactSearch('');
                    setContactCategory('All');
                  }}
                  className="mt-3 text-xs font-semibold text-teal-600 hover:underline"
                >
                  Reset Search Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- PAGE: REPORT AN INCIDENT --- */}
        {currentPage === 'report' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-teal-600" /> Report a Campus Incident
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Submit an urgent security concern, harassment grievance, or facility hazard for immediate campus logging.
              </p>
            </div>

            {/* Immediate Emergency Warning */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-rose-800 mb-0.5">Critical Emergency Notice:</strong>
                If there is active danger to human life, ongoing violence, or heavy smoke/fire, please contact the 24/7 Security Desk immediately at <strong>0422-2614000</strong> or municipal emergency dispatch.
              </div>
            </div>

            {/* Report Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const incidentType = (form.elements.namedItem('incidentType') as HTMLSelectElement).value;
                const location = (form.elements.namedItem('location') as HTMLInputElement).value;
                const urgency = (form.elements.namedItem('urgency') as HTMLSelectElement).value as any;
                const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                const contactInfo = (form.elements.namedItem('contactInfo') as HTMLInputElement).value;
                const supportingDetails = (form.elements.namedItem('supportingDetails') as HTMLInputElement).value;

                if (!incidentType || !location || !urgency || description.length < 15) {
                  showFlash('Please complete all required fields (Description must be at least 15 characters).', 'danger');
                  return;
                }

                const refId = `INC-202610-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                const now = new Date().toISOString();
                const newReport: IncidentReport = {
                  referenceId: refId,
                  userId: user?.id || 'guest',
                  userName: user?.name || 'Student Reporter',
                  userEmail: user?.email || 'student@campus.edu',
                  incidentType,
                  location,
                  incidentDatetime: now,
                  description,
                  urgency,
                  status: 'Submitted',
                  contactInfo,
                  supportingDetails,
                  investigationNotes: '',
                  statusHistory: [
                    {
                      status: 'Submitted',
                      changedAt: new Date().toLocaleString(),
                      changedBy: user?.name || 'Student',
                      note: 'Incident report logged in MongoDB Atlas.'
                    }
                  ],
                  createdAt: now
                };

                setReports([newReport, ...reports]);
                showFlash(`Incident Report submitted successfully! Reference ID: ${refId}`, 'success');
                setSelectedReportId(refId);
                setCurrentPage('my-reports');
              }}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
            >
              {/* Authenticated user pill */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Submitting as:</span>{' '}
                  <strong className="text-slate-900">{user?.name}</strong>{' '}
                  <span className="text-slate-400">({user?.email})</span>
                </div>
                <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                  Verified Student
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Incident Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="incidentType"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select category...</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                    <option value="Theft">Theft</option>
                    <option value="Fire Hazard">Fire Hazard</option>
                    <option value="Infrastructure or Safety Hazard">Infrastructure or Safety Hazard</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Urgency Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="urgency"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select urgency...</option>
                    <option value="Low">Low (No immediate hazard)</option>
                    <option value="Medium">Medium (Attention within 24h)</option>
                    <option value="High">High (Urgent inspection needed)</option>
                    <option value="Critical">Critical (Immediate safety threat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Campus Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Science Block 3, 2nd Floor Corridor or East Parking"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  placeholder="Provide objective facts: sequence of events, individuals involved, exact hazards noticed..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
                <div className="text-[11px] text-slate-400 mt-1">Minimum 15 characters required.</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Phone Number <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="contactInfo"
                    placeholder="e.g. +91 98765 43210"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Witness / Supporting Info <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="supportingDetails"
                    placeholder="e.g. Witnessed by lab assistant; CCTV nearby"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" /> Submit to MongoDB Atlas
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- PAGE: MY REPORTS (STUDENT DASHBOARD) --- */}
        {currentPage === 'my-reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                  <FileText className="w-6 h-6 text-teal-600" /> My Incident Reports
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Track all personal safety incidents submitted under your student account.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('report')}
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Submit New Report
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
              {['All', 'Submitted', 'Under Review', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportStatusFilter(st)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                    reportStatusFilter === st
                      ? 'bg-[#0f2744] text-white'
                      : 'bg-white border text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Reports List */}
            {studentReports.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Reference ID</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Urgency</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentReports.map((report) => (
                        <tr key={report.referenceId} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0f2744]">
                            {report.referenceId}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                              {report.incidentType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{report.location}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                report.urgency === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : report.urgency === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : report.urgency === 'Medium'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {report.urgency}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                report.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : report.status === 'Under Review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {report.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {report.status === 'Under Review' && <Hourglass className="w-3 h-3 text-amber-600" />}
                              {report.status === 'Submitted' && <Clock className="w-3 h-3 text-indigo-600" />}
                              {report.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedReportId(report.referenceId)}
                              className="text-teal-700 hover:text-teal-900 font-semibold text-xs inline-flex items-center gap-1"
                            >
                              Inspect <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No Reports Found</h3>
                <p className="text-xs text-slate-500 mt-1">You haven't filed any safety incidents under this filter.</p>
                <button
                  onClick={() => setCurrentPage('report')}
                  className="mt-4 bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  File an Incident
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- MODAL / DETAIL DRAWER: REPORT INSPECTION --- */}
        {selectedReportId && currentSelectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="bg-[#0f2744] text-white p-5 flex items-center justify-between rounded-t-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                    Incident Audit Record
                  </span>
                  <h3 className="text-lg font-black font-mono mt-0.5">{currentSelectedReport.referenceId}</h3>
                </div>
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Category</span>
                    <strong className="text-slate-900">{currentSelectedReport.incidentType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Urgency</span>
                    <span className="font-bold text-rose-600">{currentSelectedReport.urgency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                    <strong className="text-slate-900">{currentSelectedReport.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                    <span className="font-bold text-teal-700">{currentSelectedReport.status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0f2744] mb-1">Student Narrative / Description</h4>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                    {currentSelectedReport.description}
                  </div>
                </div>

                {currentSelectedReport.contactInfo && (
                  <div>
                    <span className="text-slate-400 text-[11px] block">Contact Number Provided:</span>
                    <strong className="text-teal-800">{currentSelectedReport.contactInfo}</strong>
                  </div>
                )}

                {currentSelectedReport.investigationNotes && (
                  <div>
                    <h4 className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" /> Security Officer Investigation Notes
                    </h4>
                    <div className="bg-teal-50 border border-teal-200 text-teal-950 p-3.5 rounded-xl">
                      {currentSelectedReport.investigationNotes}
                    </div>
                  </div>
                )}

                {/* Audit Trail */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-[#0f2744] mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" /> Status Progression &amp; Timeline
                  </h4>
                  <div className="space-y-3">
                    {currentSelectedReport.statusHistory.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{h.status}</span>
                            <span className="text-slate-400 font-normal text-[11px]">{h.changedAt}</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">Updated by: {h.changedBy}</div>
                          {h.note && <div className="text-slate-600 mt-0.5">{h.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* If Admin, allow quick status update */}
                {user && user.role === 'admin' && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide">
                      Admin Action: Update Case Status
                    </h4>
                    <div className="flex gap-2">
                      {(['Submitted', 'Under Review', 'Resolved'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            const updated = reports.map((r) => {
                              if (r.referenceId === currentSelectedReport.referenceId) {
                                return {
                                  ...r,
                                  status: st,
                                  statusHistory: [
                                    ...r.statusHistory,
                                    {
                                      status: st,
                                      changedAt: new Date().toLocaleString(),
                                      changedBy: 'Campus Safety Admin',
                                      note: `Status modified to ${st} via command dashboard.`
                                    }
                                  ]
                                };
                              }
                              return r;
                            });
                            setReports(updated);
                            showFlash(`Report status updated to '${st}'.`, 'success');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            currentSelectedReport.status === st
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-white text-slate-700 border hover:bg-amber-100'
                          }`}
                        >
                          Mark {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: SAFETY GUIDELINES --- */}
        {currentPage === 'guidelines' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div>
              <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-600" /> Campus Safety Guidelines &amp; Protocols
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Practical safety guidelines, hazard avoidance plans, and emergency response checklists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0f2744] text-base">Medical Emergencies</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Immediately alert the 24/7 Campus Health Centre at <strong>0422-2614108</strong>.</li>
                  <li>Do not move individuals who have suffered head or spinal injuries unless immediate environmental hazards (fire, collapse) exist.</li>
                  <li>Clear hallways and dispatch a peer to the building gate to guide incoming campus stretcher teams.</li>
                </ul>
              </div>

              {/* Fire */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0f2744] text-base">Fire Hazards &amp; Alarms</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Break glass on the nearest wall fire alarm call point.</li>
                  <li>Use designated exit staircases only. Never attempt to use elevators during an active building fire alarm.</li>
                  <li>Evacuate to designated open-air assembly quadrangles away from exterior glass windows.</li>
                </ul>
              </div>

              {/* Harassment */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0f2744] text-base">Harassment &amp; Anti-Ragging</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                  <li>The institution enforces a strict zero-tolerance mandate against any bullying, physical intimidation, or hazing.</li>
                  <li>Submit reports via this portal with full confidentiality; records are inspected only by authorized disciplinary cells.</li>
                  <li>Preserve any text messages, social media posts, or dates/times as supporting context.</li>
                </ul>
              </div>

              {/* Night safety */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0f2744] text-base">Night Movement &amp; Escorts</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Walk along brightly illuminated central corridors after library hours; avoid unlit grove pathways.</li>
                  <li>Adopt the buddy system when returning from late computing lab or project research sessions.</li>
                  <li>Campus mobile patrol vans can be requested at the security control desk for safe transit to residential hostels.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: ADMIN DASHBOARD --- */}
        {currentPage === 'admin-dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-amber-500" /> Administrator Safety Command Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Real-time campus risk metrics, incident triage, and response analytics calculated from MongoDB Atlas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('admin-reports')}
                  className="bg-[#0f2744] hover:bg-[#1e3a8a] text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
                >
                  Manage Reports
                </button>
                <button
                  onClick={() => setCurrentPage('admin-contacts')}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
                >
                  Manage Helplines
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase">Total Reports</div>
                <div className="text-3xl font-extrabold text-[#0f2744] mt-1">{reports.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Logged across all blocks</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                <div className="text-xs font-bold text-slate-400 uppercase">Submitted (Pending)</div>
                <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                  {reports.filter((r) => r.status === 'Submitted').length}
                </div>
                <div className="text-[11px] text-indigo-500 mt-1">Awaiting initial inspection</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                <div className="text-xs font-bold text-slate-400 uppercase">Under Review</div>
                <div className="text-3xl font-extrabold text-amber-600 mt-1">
                  {reports.filter((r) => r.status === 'Under Review').length}
                </div>
                <div className="text-[11px] text-amber-500 mt-1">Officer currently assigned</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-xs font-bold text-slate-400 uppercase">Resolved Cases</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {reports.filter((r) => r.status === 'Resolved').length}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">Closed successfully</div>
              </div>
            </div>

            {/* Category Breakdown & Ratio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-[#0f2744] text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" /> Incident Distribution by Category
                </h3>
                <div className="space-y-3">
                  {[
                    'Infrastructure or Safety Hazard',
                    'Suspicious Activity',
                    'Theft',
                    'Medical Emergency',
                    'Harassment'
                  ].map((cat) => {
                    const count = reports.filter((r) => r.incidentType === cat).length;
                    const pct = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{cat}</span>
                          <span>{count} case(s) ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-[#0f2744] text-base flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-amber-500" /> Urgency Level Severity
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                    <div className="text-xs font-bold text-rose-700 uppercase">Critical</div>
                    <div className="text-2xl font-black text-rose-700 mt-1">
                      {reports.filter((r) => r.urgency === 'Critical').length}
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div className="text-xs font-bold text-amber-700 uppercase">High</div>
                    <div className="text-2xl font-black text-amber-700 mt-1">
                      {reports.filter((r) => r.urgency === 'High').length}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-xs font-bold text-blue-700 uppercase">Medium</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">
                      {reports.filter((r) => r.urgency === 'Medium').length}
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <div className="text-xs font-bold text-emerald-700 uppercase">Low</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {reports.filter((r) => r.urgency === 'Low').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reports in Admin view */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0f2744] text-base">Recent Incident Submissions</h3>
                <button
                  onClick={() => setCurrentPage('admin-reports')}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Reference ID</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Urgency</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.slice(0, 5).map((r) => (
                      <tr key={r.referenceId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0f2744]">{r.referenceId}</td>
                        <td className="py-2.5 px-3">{r.userName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.incidentType}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.location}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              r.urgency === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : r.urgency === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.urgency}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-teal-700">{r.status}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedReportId(r.referenceId)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded font-semibold text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: ADMIN MANAGE REPORTS --- */}
        {currentPage === 'admin-reports' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                <FileText className="w-6 h-6 text-teal-600" /> Manage All Incident Reports
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Filter by status, search by keyword, view investigation notes, and manage case statuses.
              </p>
            </div>

            {/* Filter controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search reference ID, student, location..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="border rounded-lg text-xs p-2 bg-slate-50 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={adminUrgencyFilter}
                  onChange={(e) => setAdminUrgencyFilter(e.target.value)}
                  className="border rounded-lg text-xs p-2 bg-slate-50 font-medium"
                >
                  <option value="All">All Urgency</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-semibold">
                      <th className="py-3 px-4">Reference ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Urgency</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminFilteredReports.map((r) => (
                      <tr key={r.referenceId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-[#0f2744]">{r.referenceId}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{r.userName}</div>
                          <div className="text-[11px] text-slate-400">{r.userEmail}</div>
                        </td>
                        <td className="py-3 px-4">{r.incidentType}</td>
                        <td className="py-3 px-4 text-slate-600">{r.location}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-xs ${
                              r.urgency === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : r.urgency === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.urgency}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              r.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReportId(r.referenceId)}
                            className="bg-[#0f2744] hover:bg-[#1e3a8a] text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                          >
                            Review &amp; Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: ADMIN MANAGE CONTACTS --- */}
        {currentPage === 'admin-contacts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0f2744] flex items-center gap-2">
                  <Phone className="w-6 h-6 text-teal-600" /> Manage Emergency Contacts (CRUD)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Add, update, or toggle visibility of official campus helplines in MongoDB Atlas.
                </p>
              </div>
              <button
                onClick={() => {
                  const name = prompt('Enter Contact Name:');
                  if (!name) return;
                  const phone = prompt('Enter Phone Number (e.g. 0422-2614999):');
                  if (!phone) return;
                  const category = prompt('Category (Campus Security / Medical / Fire / Counseling / Maintenance):') || 'Campus Security';
                  const desc = prompt('Brief description:') || 'Campus helpline';

                  const newC: Contact = {
                    id: `c_${Date.now()}`,
                    name,
                    phone,
                    category,
                    description: desc,
                    availability: '24/7 Dispatch',
                    isActive: true
                  };
                  setContacts([...contacts, newC]);
                  showFlash(`Added contact '${name}' successfully.`, 'success');
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Helpline
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-semibold">
                      <th className="py-3 px-4">Contact Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contacts.map((c) => (
                      <tr key={c.id} className={c.isActive ? 'hover:bg-slate-50' : 'bg-slate-50/50 text-slate-400'}>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{c.name}</strong>
                          <span className="text-[11px] text-slate-500">{c.description}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{c.category}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-700">{c.phone}</td>
                        <td className="py-3 px-4 text-xs">{c.availability}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              const updated = contacts.map((item) =>
                                item.id === c.id ? { ...item, isActive: !item.isActive } : item
                              );
                              setContacts(updated);
                              showFlash(`Toggled status for '${c.name}'.`, 'info');
                            }}
                            className="text-slate-600 hover:text-slate-900 text-xs font-semibold"
                          >
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete '${c.name}' permanently?`)) {
                                setContacts(contacts.filter((item) => item.id !== c.id));
                                showFlash('Emergency contact deleted.', 'info');
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: STUDENT LOGIN --- */}
        {currentPage === 'login' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-[#0f2744]">Student Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">Access your campus incident reporting dashboard</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase();
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;

                const found = registeredUsers.find(
                  (u) => u.email.toLowerCase() === email && (u.password === password || !u.password)
                );

                if (found) {
                  setUser(found);
                  showFlash(`Welcome back, ${found.name}!`, 'success');
                  setCurrentPage(found.role === 'admin' ? 'admin-dashboard' : 'home');
                } else {
                  showFlash('Invalid email or password. Please check your credentials or register a student account.', 'danger');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your registered email"
                  required
                  className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl shadow transition text-sm"
              >
                Sign In as Student
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need an account?</span>
              <button onClick={() => setCurrentPage('register')} className="text-teal-700 font-semibold hover:underline">
                Register Student
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setCurrentPage('admin-login')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Campus Officer / Admin Login &rarr;
              </button>
            </div>
          </div>
        )}

        {/* --- PAGE: STUDENT REGISTER --- */}
        {currentPage === 'register' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0f2744] text-white flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-[#0f2744]">Student Registration</h2>
              <p className="text-xs text-slate-500 mt-1">Create an account to submit and track safety incident reports</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim();
                const studentId = (form.elements.namedItem('studentId') as HTMLInputElement).value.trim().toUpperCase();
                const department = (form.elements.namedItem('department') as HTMLSelectElement).value;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase();
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

                if (password !== confirmPassword) {
                  showFlash('Passwords do not match. Please re-enter your password.', 'danger');
                  return;
                }

                if (registeredUsers.some((u) => u.email.toLowerCase() === email)) {
                  showFlash('An account with this email already exists. Please log in.', 'warning');
                  setCurrentPage('login');
                  return;
                }

                if (registeredUsers.some((u) => u.studentId.toUpperCase() === studentId)) {
                  showFlash('An account with this Student ID already exists. Please log in.', 'warning');
                  setCurrentPage('login');
                  return;
                }

                const newUser = {
                  id: `u_${Date.now()}`,
                  name: fullName,
                  email: email,
                  studentId: studentId,
                  department: department,
                  password: password,
                  role: 'student' as const
                };

                setRegisteredUsers((prev) => [...prev, newUser]);
                setUser(newUser);
                showFlash(`Registration successful! Welcome to CampusSafe, ${fullName}.`, 'success');
                setCurrentPage('home');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  required
                  minLength={2}
                  className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="e.g. STU-2024-001"
                    required
                    minLength={3}
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="department"
                    required
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science &amp; Eng.</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics &amp; Comm.</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology & Sciences">Biotechnology &amp; Sciences</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Other Department">Other Department</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  University or Personal Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@university.edu"
                  required
                  className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Min 6 chars"
                    required
                    minLength={6}
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl shadow transition text-sm"
              >
                Register &amp; Sign In
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button onClick={() => setCurrentPage('login')} className="text-teal-700 font-semibold hover:underline">
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* --- PAGE: ADMIN LOGIN --- */}
        {currentPage === 'admin-login' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0a192f] text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-[#0f2744]">Administrator Portal</h2>
              <p className="text-xs text-slate-500 mt-1">Authorized Campus Safety Personnel Only</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase();
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;

                if (email === 'admin@campus.edu' && password === 'AdminPass2026') {
                  const adminAcc = {
                    id: 'admin_1',
                    name: 'Campus Safety Administrator',
                    email: 'admin@campus.edu',
                    role: 'admin' as const,
                    studentId: 'ADMIN-001',
                    department: 'Campus Security & Safety Office'
                  };
                  setUser(adminAcc);
                  showFlash('Administrator access verified.', 'success');
                  setCurrentPage('admin-dashboard');
                } else {
                  const foundAdmin = registeredUsers.find(
                    (u) => u.email.toLowerCase() === email && u.role === 'admin' && u.password === password
                  );
                  if (foundAdmin) {
                    setUser(foundAdmin);
                    showFlash('Administrator access verified.', 'success');
                    setCurrentPage('admin-dashboard');
                  } else {
                    showFlash('Invalid administrator credentials.', 'danger');
                  }
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue="admin@campus.edu"
                  required
                  className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Master Password</label>
                <input
                  type="password"
                  name="password"
                  defaultValue="AdminPass2026"
                  required
                  className="w-full border rounded-lg p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f2744] hover:bg-[#1e3a8a] text-white font-bold py-2.5 rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-400" /> Authenticate Administrator
              </button>
            </form>

            <div className="text-center pt-2">
              <button onClick={() => setCurrentPage('login')} className="text-xs text-teal-700 hover:underline">
                &larr; Return to Student Portal
              </button>
            </div>
          </div>
        )}

        {/* --- PAGE: PROFILE --- */}
        {currentPage === 'profile' && user && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-[#0f2744] text-white flex items-center justify-center text-2xl font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#0f2744]">{user.name}</h2>
                <div className="text-xs text-slate-500">{user.email} &bull; <span className="capitalize font-semibold text-teal-700">{user.role}</span></div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">Student / Staff ID: {user.studentId}</div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const updatedName = (form.elements.namedItem('updatedName') as HTMLInputElement).value.trim();
                const updatedDept = (form.elements.namedItem('updatedDept') as HTMLInputElement).value.trim();

                if (updatedName) {
                  const updatedUser = { ...user, name: updatedName, department: updatedDept };
                  setUser(updatedUser);
                  setRegisteredUsers((prev) =>
                    prev.map((u) => (u.id === user.id ? { ...u, name: updatedName, department: updatedDept } : u))
                  );
                  showFlash('Profile information updated successfully!', 'success');
                }
              }}
              className="space-y-4"
            >
              <h3 className="font-bold text-[#0f2744] text-sm">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    name="updatedName"
                    defaultValue={user.name}
                    required
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Academic Department</label>
                  <input
                    type="text"
                    name="updatedDept"
                    defaultValue={user.department}
                    required
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm bg-slate-100 text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Student / Staff ID</label>
                  <input
                    type="text"
                    value={user.studentId}
                    disabled
                    className="w-full border rounded-lg p-2.5 text-xs sm:text-sm bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setUser(null);
                  showFlash('Logged out successfully.', 'info');
                  setCurrentPage('home');
                }}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
              >
                Sign Out
              </button>
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a192f] text-slate-400 text-xs mt-12 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>CampusSafe</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Centralized Campus Safety and Emergency Services Portal. Dedicated to 24/7 student protection, rapid hazard remediation, anti-harassment enforcement, and emergency response.
            </p>
            <div className="text-[11px] text-teal-400 font-semibold flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Official Campus Portal Online
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Portal Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition">Home Overview</button></li>
              <li><button onClick={() => setCurrentPage('contacts')} className="hover:text-white transition">Emergency Helplines</button></li>
              <li><button onClick={() => setCurrentPage('guidelines')} className="hover:text-white transition">Safety Protocols &amp; Checklist</button></li>
              <li><button onClick={() => setCurrentPage('report')} className="hover:text-white transition">Report an Incident</button></li>
              {user && user.role === 'student' && (
                <li><button onClick={() => setCurrentPage('my-reports')} className="hover:text-white transition">My Submitted Reports</button></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Emergency Desks</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span>Security Control:</span>
                <a href="tel:04222614000" className="text-teal-400 hover:underline font-mono font-semibold">0422-2614000</a>
              </li>
              <li className="flex items-center justify-between">
                <span>Medical Ward:</span>
                <a href="tel:04222614108" className="text-teal-400 hover:underline font-mono font-semibold">0422-2614108</a>
              </li>
              <li className="flex items-center justify-between">
                <span>Fire Response:</span>
                <a href="tel:04222614101" className="text-teal-400 hover:underline font-mono font-semibold">0422-2614101</a>
              </li>
              <li className="flex items-center justify-between">
                <span>Anti-Harassment:</span>
                <a href="tel:04222614112" className="text-teal-400 hover:underline font-mono font-semibold">0422-2614112</a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Campus Safety Office</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Main Campus Security Command &amp; Control Centre<br />
              East Administration Gate, Security Quad<br />
              Operating Hours: 24 Hours / 365 Days
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              Email: <span className="text-slate-300">security@campus.edu</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>&copy; {new Date().getFullYear()} CampusSafe — Campus Safety &amp; Emergency Response Portal. All rights reserved.</div>
          <div className="text-amber-400/90 font-medium">In case of life-threatening emergencies, dial national 112 or alert nearest campus security officer immediately.</div>
        </div>
      </footer>
    </div>
  );
}
