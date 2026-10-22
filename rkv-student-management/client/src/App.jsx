import { createContext, useContext, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCircle,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './App.css';

const API_BASE = 'http://localhost:5000/api';
const AUTH_KEY = 'rkv-auth-session';
const AuthContext = createContext(null);

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

async function apiRequest(path, options = {}, requireAuth = true) {
  const auth = getAuthSnapshot();
  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(requireAuth && auth?.access ? { Authorization: 'Bearer ' + auth.access } : {}),
    },
  };

  const response = await fetch(`${API_BASE}${path}`, requestOptions);
  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty', 'student'] },
  { label: 'Students', path: '/students', icon: Users, roles: ['admin', 'faculty'] },
  { label: 'Departments', path: '/departments', icon: Building2, roles: ['admin'] },
  { label: 'Faculty', path: '/faculty', icon: BriefcaseBusiness, roles: ['admin'] },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['admin', 'faculty'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'faculty'] },
  { label: 'Users', path: '/users', icon: Shield, roles: ['admin'] },
  { label: 'Profile', path: '/profile', icon: UserCircle, roles: ['admin', 'faculty', 'student'] },
];

const emptyStudentForm = {
  registrationNumber: '',
  fullName: '',
  dob: '',
  gender: 'Male',
  email: '',
  phone: '',
  address: '',
  department: 'Computer Science and Engineering',
  course: 'B.Tech',
  academicYear: '2024-2025',
  semester: 3,
  admissionDate: '',
  status: 'Active',
  guardianName: '',
  guardianPhone: '',
};

function getAuthSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getAuthSnapshot());

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthSnapshot());
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const value = {
    access: auth?.access,
    user: auth?.user,
    login: (payload) => {
      localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
      setAuth(payload);
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      setAuth(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return auth;
}

function ProtectedRoute({ children, roles = ['admin', 'faculty', 'student'] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleItems = navigation.filter((item) => item.roles.includes(user?.role || 'student'));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-badge"><GraduationCap size={22} /></div>
          <div>
            <p className="brand-label">RKV Engineering College</p>
            <strong>Student Management</strong>
          </div>
        </div>

        <nav className="nav-menu">
          {visibleItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">College administration</span>
            <h2>{navigation.find((item) => item.path === location.pathname)?.label || 'Overview'}</h2>
          </div>

          <div className="topbar-actions">
            <div className="user-pill">
              <UserCircle size={18} />
              <span>{user?.name || 'Admin'}</span>
            </div>
            <button className="ghost-button" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@rkv.edu.in', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      }, false);

      login({ access: response.access, user: response.user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-badge large"><GraduationCap size={28} /></div>
          <div>
            <p className="brand-label">RKV Engineering College</p>
            <h1>Student Management System</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email address
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>

          {error ? <div className="error-banner"><AlertCircle size={16} /> {error}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiRequest('/dashboard/stats');
        setStats(response.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="panel empty-state">Loading dashboard data...</div>;
  }

  const cards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users },
    { title: 'Departments', value: stats.totalDepartments, icon: Building2 },
    { title: 'Faculty', value: stats.totalFaculty, icon: BriefcaseBusiness },
    { title: 'Active Students', value: stats.activeStudents, icon: GraduationCap },
  ];

  return (
    <div className="dashboard-grid">
      <div className="stats-grid">
        {cards.map(({ title, value, icon: Icon }) => (
          <div key={title} className="stat-card">
            <div className="stat-icon"><Icon size={18} /></div>
            <div>
              <p>{title}</p>
              <h3>{value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="panel">
          <h3>Department distribution</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-18} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Year-wise enrollment</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.yearDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="panel">
          <h3>Recently added students</h3>
          <ul className="list-stack">
            {stats.recentStudents.map((student) => (
              <li key={student.id}>
                <div>
                  <strong>{student.fullName}</strong>
                  <small>{student.department}</small>
                </div>
                <span>{student.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3>Recent activity</h3>
          <ul className="list-stack">
            {stats.recentActivities.map((activity) => (
              <li key={activity.id}>
                <div>
                  <strong>{activity.title}</strong>
                  <small>{activity.detail}</small>
                </div>
                <span>{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 8 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: 'all', status: 'all', academicYear: 'all', semester: 'all' });
  const [form, setForm] = useState(emptyStudentForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudents = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      if (search) params.set('search', search);
      if (filters.department !== 'all') params.set('department', filters.department);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.academicYear !== 'all') params.set('academicYear', filters.academicYear);
      if (filters.semester !== 'all') params.set('semester', filters.semester);

      const response = await apiRequest(`/students?${params.toString()}`);
      setStudents(response.students);
      setPagination(response.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(1);
  }, [search, filters]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = { ...form, semester: Number(form.semester) };
      if (editingId) {
        await apiRequest(`/students/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/students', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm(emptyStudentForm);
      setEditingId('');
      loadStudents(pagination.page);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      ...emptyStudentForm,
      ...student,
      dob: student.dob?.slice(0, 10) || '',
      admissionDate: student.admissionDate?.slice(0, 10) || '',
      semester: Number(student.semester || 1),
    });
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Delete this student record?')) return;

    try {
      await apiRequest(`/students/${studentId}`, { method: 'DELETE' });
      loadStudents(pagination.page);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="stack-gap">
      <div className="panel">
        <div className="panel-header">
          <h3>Student management</h3>
          <button className="primary-button small" onClick={() => { setEditingId(''); setForm(emptyStudentForm); }}>
            <Plus size={14} /> Add student
          </button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="field-row two-columns">
            <label>Registration number <input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required /></label>
            <label>Full name <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          </div>
          <div className="field-row two-columns">
            <label>Email <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Phone <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
          </div>
          <div className="field-row two-columns">
            <label>Date of birth <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required /></label>
            <label>Gender
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <div className="field-row two-columns">
            <label>Department
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option>Computer Science and Engineering</option>
                <option>Information Technology</option>
                <option>Electronics and Communication Engineering</option>
                <option>Electrical and Electronics Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
              </select>
            </label>
            <label>Course <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} /></label>
          </div>
          <div className="field-row two-columns">
            <label>Academic year <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></label>
            <label>Semester <input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></label>
          </div>
          <div className="field-row two-columns">
            <label>Admission date <input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} required /></label>
            <label>Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Graduated</option>
              </select>
            </label>
          </div>
          <div className="field-row two-columns">
            <label>Guardian name <input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></label>
            <label>Guardian phone <input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} /></label>
          </div>
          <label>Address <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></label>

          <div className="form-actions">
            <button type="submit" className="primary-button">{editingId ? 'Update student' : 'Save student'}</button>
            {editingId ? <button type="button" className="ghost-button" onClick={() => { setEditingId(''); setForm(emptyStudentForm); }}>Cancel</button> : null}
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header compact">
          <div className="search-box">
            <Search size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student, ID or email" />
          </div>
          <div className="filter-row">
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
              <option value="all">All departments</option>
              <option>Computer Science and Engineering</option>
              <option>Information Technology</option>
              <option>Electronics and Communication Engineering</option>
              <option>Electrical and Electronics Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Civil Engineering</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="all">All status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Graduated</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? <div className="empty-state">Loading student records...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>{student.registrationNumber}</td>
                    <td>{student.department}</td>
                    <td>{student.academicYear}</td>
                    <td><span className="status-badge">{student.status}</span></td>
                    <td className="table-actions">
                      <button className="icon-button" onClick={() => handleEdit(student)}>Edit</button>
                      <button className="icon-button danger" onClick={() => handleDelete(student.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', hod: '' });

  const loadDepartments = async () => {
    const response = await apiRequest('/departments');
    setDepartments(response.departments);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/departments', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', code: '', hod: '' });
      loadDepartments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm('Delete department?')) return;

    try {
      await apiRequest(`/departments/${departmentId}`, { method: 'DELETE' });
      loadDepartments();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="stack-gap">
      <div className="panel">
        <h3>Department management</h3>
        <form onSubmit={handleSubmit} className="inline-form">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Department name" required />
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Department code" required />
          <input value={form.hod} onChange={(e) => setForm({ ...form, hod: e.target.value })} placeholder="Head of department" required />
          <button type="submit" className="primary-button">Add department</button>
        </form>
      </div>

      <div className="panel">
        <div className="cards-grid">
          {departments.map((department) => (
            <div key={department.id} className="detail-card">
              <div className="detail-header">
                <strong>{department.name}</strong>
                <span>{department.code}</span>
              </div>
              <p>HOD: {department.hod}</p>
              <p>Students: {department.studentCount}</p>
              <button className="ghost-button danger" onClick={() => handleDelete(department.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FacultyPage() {
  const [faculty, setFaculty] = useState([]);

  const loadFaculty = async () => {
    const response = await apiRequest('/faculty');
    setFaculty(response.faculty);
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  return (
    <div className="panel">
      <h3>Faculty directory</h3>
      <div className="cards-grid">
        {faculty.map((member) => (
          <div key={member.id} className="detail-card">
            <div className="detail-header">
              <strong>{member.name}</strong>
              <span>{member.designation}</span>
            </div>
            <p>{member.department}</p>
            <p>{member.email}</p>
            <p>{member.phone}</p>
            <p>Status: {member.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendancePage() {
  const [report, setReport] = useState([]);
  const [form, setForm] = useState({ studentId: '', date: '2025-02-02', department: 'Computer Science and Engineering', status: 'Present' });

  const loadAttendance = async () => {
    const reportResponse = await apiRequest('/attendance/report');
    setReport(reportResponse.report);
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/attendance', { method: 'POST', body: JSON.stringify(form) });
      setForm({ ...form, studentId: '' });
      loadAttendance();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="stack-gap">
      <div className="panel">
        <h3>Mark attendance</h3>
        <form onSubmit={handleSubmit} className="inline-form">
          <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="Student ID or registration number" required />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option>Computer Science and Engineering</option>
            <option>Information Technology</option>
            <option>Electronics and Communication Engineering</option>
            <option>Electrical and Electronics Engineering</option>
            <option>Mechanical Engineering</option>
            <option>Civil Engineering</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Present</option>
            <option>Absent</option>
            <option>On Leave</option>
          </select>
          <button type="submit" className="primary-button">Submit</button>
        </form>
      </div>

      <div className="panel">
        <h3>Attendance report</h3>
        <div className="cards-grid compact-grid">
          {report.map((item) => (
            <div key={item.studentId} className="detail-card report-card">
              <strong>{item.name}</strong>
              <p>{item.department}</p>
              <p>{item.present}/{item.total} present</p>
              <div className="progress-bar"><span style={{ width: `${item.percentage}%` }} /></div>
              <small>{item.percentage}% attendance</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiRequest('/dashboard/stats').then((response) => setStats(response.stats)).catch(console.error);
  }, []);

  return (
    <div className="panel">
      <h3>Reports & analytics</h3>
      {stats ? (
        <div className="stats-grid small-grid">
          <div className="stat-card"><p>Active</p><h3>{stats.activeStudents}</h3></div>
          <div className="stat-card"><p>Inactive</p><h3>{stats.inactiveStudents}</h3></div>
          <div className="stat-card"><p>Graduated</p><h3>{stats.graduatedStudents}</h3></div>
          <div className="stat-card"><p>Faculty</p><h3>{stats.totalFaculty}</h3></div>
        </div>
      ) : <div className="empty-state">Loading reports...</div>}
    </div>
  );
}

function UserManagementPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiRequest('/dashboard/users').then((response) => setUsers(response.users)).catch(console.error);
  }, []);

  return (
    <div className="panel">
      <h3>User management</h3>
      <ul className="list-stack">
        {users.map((user) => (
          <li key={user.id}><div><strong>{user.name}</strong><small>{user.email}</small></div><span>{user.role}</span></li>
        ))}
      </ul>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="panel profile-panel">
      <h3>Profile & account settings</h3>
      <div className="profile-card">
        <div className="brand-badge large"><UserCircle size={28} /></div>
        <div>
          <h4>{user?.name}</h4>
          <p>{user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
      </div>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="panel error-box">
      <h3>Unauthorized access</h3>
      <p>You do not have permission to access this page.</p>
      <Link to="/dashboard">Return to dashboard</Link>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="panel error-box">
      <h3>Page not found</h3>
      <p>The page you requested does not exist.</p>
      <Link to="/dashboard">Go home</Link>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell><DashboardPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute roles={['admin', 'faculty']}>
              <AppShell><StudentsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppShell><DepartmentsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppShell><FacultyPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute roles={['admin', 'faculty']}>
              <AppShell><AttendancePage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['admin', 'faculty']}>
              <AppShell><ReportsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppShell><UserManagementPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell><ProfilePage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<AppShell><UnauthorizedPage /></AppShell>} />
        <Route path="*" element={<AppShell><NotFoundPage /></AppShell>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
