const bcrypt = require('bcryptjs');

const defaultDepartments = [
  { id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE', hod: 'Dr. Asha Kumar', studentCount: 0 },
  { id: 'dept-it', name: 'Information Technology', code: 'IT', hod: 'Dr. Prakash Rao', studentCount: 0 },
  { id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE', hod: 'Dr. Meera Iyer', studentCount: 0 },
  { id: 'dept-eee', name: 'Electrical and Electronics Engineering', code: 'EEE', hod: 'Dr. Vishal Nair', studentCount: 0 },
  { id: 'dept-mech', name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. Sanjay Reddy', studentCount: 0 },
  { id: 'dept-civil', name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. Lakshmi Narayan', studentCount: 0 },
];

const defaultUsers = [];

const defaultFaculty = [
  { id: 'FAC-101', name: 'Dr. Asha Kumar', email: 'asha.kumar@rkv.edu.in', phone: '9876543210', department: 'CSE', designation: 'Professor', joiningDate: '2020-06-12', status: 'Active' },
  { id: 'FAC-102', name: 'Mr. Prakash Rao', email: 'prakash.rao@rkv.edu.in', phone: '9876543211', department: 'IT', designation: 'Associate Professor', joiningDate: '2019-08-19', status: 'Active' },
  { id: 'FAC-103', name: 'Dr. Meera Iyer', email: 'meera.iyer@rkv.edu.in', phone: '9876543212', department: 'ECE', designation: 'Professor', joiningDate: '2018-04-15', status: 'Active' },
];

const defaultStudents = [
  { id: 'STU-1001', registrationNumber: 'RKV-2024-001', fullName: 'Ananya Reddy', profilePhoto: '', dob: '2005-02-18', gender: 'Female', email: 'ananya.reddy@rkv.edu.in', phone: '9123456780', address: 'Hyderabad', department: 'CSE', course: 'B.Tech', academicYear: '2024-2025', semester: 3, admissionDate: '2024-08-10', status: 'Active', guardianName: 'Suresh Reddy', guardianPhone: '9876543210' },
  { id: 'STU-1002', registrationNumber: 'RKV-2024-002', fullName: 'Rahul Verma', profilePhoto: '', dob: '2004-11-25', gender: 'Male', email: 'rahul.verma@rkv.edu.in', phone: '9123456781', address: 'Vijayawada', department: 'IT', course: 'B.Tech', academicYear: '2024-2025', semester: 3, admissionDate: '2024-08-11', status: 'Active', guardianName: 'Arun Verma', guardianPhone: '9876543211' },
  { id: 'STU-1003', registrationNumber: 'RKV-2024-003', fullName: 'Sanjana Patel', profilePhoto: '', dob: '2005-01-12', gender: 'Female', email: 'sanjana.patel@rkv.edu.in', phone: '9123456782', address: 'Warangal', department: 'ECE', course: 'B.Tech', academicYear: '2024-2025', semester: 3, admissionDate: '2024-08-12', status: 'Inactive', guardianName: 'Nitin Patel', guardianPhone: '9876543212' },
  { id: 'STU-1004', registrationNumber: 'RKV-2023-014', fullName: 'Karthik Naidu', profilePhoto: '', dob: '2003-09-30', gender: 'Male', email: 'karthik.naidu@rkv.edu.in', phone: '9123456783', address: 'Guntur', department: 'EEE', course: 'B.Tech', academicYear: '2023-2024', semester: 6, admissionDate: '2023-08-09', status: 'Graduated', guardianName: 'Sudhakar Naidu', guardianPhone: '9876543213' },
  { id: 'STU-1005', registrationNumber: 'RKV-2023-021', fullName: 'Madhavi Nair', profilePhoto: '', dob: '2004-07-17', gender: 'Female', email: 'madhavi.nair@rkv.edu.in', phone: '9123456784', address: 'Khammam', department: 'CSE', course: 'B.Tech', academicYear: '2023-2024', semester: 6, admissionDate: '2023-08-10', status: 'Active', guardianName: 'Ramesh Nair', guardianPhone: '9876543214' },
];

const defaultAttendance = [
  { id: 'ATT-1', studentId: 'STU-1001', studentName: 'Ananya Reddy', department: 'CSE', academicYear: '2024-2025', semester: 3, date: '2025-02-01', status: 'Present' },
  { id: 'ATT-2', studentId: 'STU-1002', studentName: 'Rahul Verma', department: 'IT', academicYear: '2024-2025', semester: 3, date: '2025-02-01', status: 'Absent' },
  { id: 'ATT-3', studentId: 'STU-1003', studentName: 'Sanjana Patel', department: 'ECE', academicYear: '2024-2025', semester: 3, date: '2025-02-01', status: 'On Leave' },
  { id: 'ATT-4', studentId: 'STU-1001', studentName: 'Ananya Reddy', department: 'CSE', academicYear: '2024-2025', semester: 3, date: '2025-02-02', status: 'Present' },
  { id: 'ATT-5', studentId: 'STU-1002', studentName: 'Rahul Verma', department: 'IT', academicYear: '2024-2025', semester: 3, date: '2025-02-02', status: 'Present' },
];

const store = {
  departments: [...defaultDepartments],
  faculty: [...defaultFaculty],
  students: [...defaultStudents],
  attendance: [...defaultAttendance],
  users: [...defaultUsers],
};

const matchesDepartment = (studentDepartment, department) => {
  const value = studentDepartment.toLowerCase();
  return value === department.name.toLowerCase() || value === department.code.toLowerCase();
};

const syncDepartmentStudentCounts = () => {
  for (const department of store.departments) {
    department.studentCount = store.students.filter((student) => matchesDepartment(student.department, department)).length;
  }
};

const createInitialAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rkv.edu.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = store.users.find((user) => user.email === adminEmail);
  if (!existingAdmin) {
    store.users.push({
      id: 'USR-ADMIN',
      name: 'System Administrator',
      email: adminEmail,
      password: passwordHash,
      role: 'admin',
      phone: '9999999999',
      createdAt: new Date().toISOString(),
    });
  }

  syncDepartmentStudentCounts();
};

const getDashboardStats = () => {
  const totalStudents = store.students.length;
  const totalDepartments = store.departments.length;
  const totalFaculty = store.faculty.length;
  const activeStudents = store.students.filter((student) => student.status === 'Active').length;
  const inactiveStudents = store.students.filter((student) => student.status === 'Inactive').length;
  const graduatedStudents = store.students.filter((student) => student.status === 'Graduated').length;

  const departmentDistribution = store.departments.map((department) => ({
    name: department.name,
    value: store.students.filter((student) => matchesDepartment(student.department, department)).length,
  }));

  const yearDistribution = Array.from(
    new Set(store.students.map((student) => student.academicYear))
  ).map((year) => ({
    name: year,
    value: store.students.filter((student) => student.academicYear === year).length,
  }));

  const recentStudents = [...store.students].sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate)).slice(0, 5);
  const recentActivities = [
    { id: 1, title: 'New student admitted', detail: 'Ananya Reddy added to CSE', timestamp: '2 hours ago' },
    { id: 2, title: 'Department updated', detail: 'IT department head changed', timestamp: '5 hours ago' },
    { id: 3, title: 'Attendance submitted', detail: 'Attendance for 2025-02-02 posted', timestamp: '1 day ago' },
  ];

  return {
    totalStudents,
    totalDepartments,
    totalFaculty,
    activeStudents,
    inactiveStudents,
    graduatedStudents,
    departmentDistribution,
    yearDistribution,
    recentStudents,
    recentActivities,
  };
};

module.exports = {
  store,
  createInitialAdmin,
  syncDepartmentStudentCounts,
  getDashboardStats,
  matchesDepartment,
};
