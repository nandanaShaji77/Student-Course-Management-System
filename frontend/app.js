// Global State Containers
let studentsList = [];
let coursesList = [];
let activePanel = "dashboard-panel";
let isMobileNavOpen = false;

// Base API URI path - routed internally by Nginx reverse proxy
const API_BASE = "/api";

// Initialize the Application on Load
document.addEventListener("DOMContentLoaded", () => {
    console.log("EduManage DevOps Platform Initialized.");
    
    // Initial data fetch and dashboard loading
    loadAllData();
});

// Load All Database Records to Synchronize Global State
async function loadAllData() {
    try {
        await Promise.all([
            fetchStudentsData(),
            fetchCoursesData()
        ]);
        
        // Render panels with updated data
        renderDashboardStats();
        renderStudentsTable(studentsList);
        renderCoursesTable(coursesList);
        renderEnrollmentMatrix();
        populateSelectDropdowns();
    } catch (error) {
        showToast("Error synchronizing with local database nodes.", "error");
        console.error("Data fetch error: ", error);
    }
}

// Fetch Students Catalog
async function fetchStudentsData() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        if (!res.ok) throw new Error("Failed to fetch students catalog");
        studentsList = await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Fetch Courses Catalog
async function fetchCoursesData() {
    try {
        const res = await fetch(`${API_BASE}/courses`);
        if (!res.ok) throw new Error("Failed to fetch courses catalog");
        coursesList = await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// SPA Routing Controller: Handles View panel transitions and sidebar activations
function switchPanel(panelId) {
    // Hide active panel
    document.getElementById(activePanel).classList.add("hidden");
    
    // Remove sidebar styling on active panel button
    const oldBtn = document.getElementById(`nav-${activePanel}`);
    if (oldBtn) {
        oldBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent";
    }

    // Set new active panel
    activePanel = panelId;
    
    // Show new active panel
    document.getElementById(activePanel).classList.remove("hidden");
    
    // Style active panel button
    const newBtn = document.getElementById(`nav-${activePanel}`);
    if (newBtn) {
        newBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border-l-4 border-brand-500 text-brand-400";
    }

    // Update Header Page Title
    const pageTitle = document.getElementById("page-title");
    switch (panelId) {
        case "dashboard-panel":
            pageTitle.innerText = "Admin Dashboard";
            renderDashboardStats();
            break;
        case "students-panel":
            pageTitle.innerText = "Students Catalog";
            renderStudentsTable(studentsList);
            break;
        case "courses-panel":
            pageTitle.innerText = "Academic Courses";
            renderCoursesTable(coursesList);
            break;
        case "register-panel":
            pageTitle.innerText = "Enrollments Center";
            renderEnrollmentMatrix();
            populateSelectDropdowns();
            break;
    }
}

// Mobile Responsive Drawer Toggle
function toggleMobileNav() {
    const mobileSidebar = document.getElementById("mobile-sidebar");
    const menuIcon = document.getElementById("mobile-menu-icon");
    
    isMobileNavOpen = !isMobileNavOpen;
    if (isMobileNavOpen) {
        mobileSidebar.classList.remove("hidden");
        menuIcon.className = "fa-solid fa-xmark text-xl";
    } else {
        mobileSidebar.classList.add("hidden");
        menuIcon.className = "fa-solid fa-bars text-xl";
    }
}

// Compute and Render Dashboard High-Level Statistics Card Elements
function renderDashboardStats() {
    document.getElementById("stat-students").innerText = studentsList.length;
    document.getElementById("stat-courses").innerText = coursesList.length;
    
    // Calculate total registrations inside student records
    let totalRegs = 0;
    studentsList.forEach(student => {
        if (student.courses) {
            totalRegs += student.courses.length;
        }
    });
    
    document.getElementById("stat-registrations").innerText = totalRegs;
}

// Renders the Student Database Catalog in the UI Table
function renderStudentsTable(data) {
    const tbody = document.getElementById("students-table-body");
    const emptyState = document.getElementById("students-empty-state");
    tbody.innerHTML = "";
    
    if (data.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }
    emptyState.classList.add("hidden");

    data.forEach(student => {
        // Build badges representing enrolled courses
        let courseBadges = `<span class="text-xs text-slate-500 italic">No registrations</span>`;
        if (student.courses && student.courses.length > 0) {
            courseBadges = student.courses.map(course => 
                `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 mr-1.5 mb-1">${course.code}</span>`
            ).join("");
        }

        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/40 transition-colors border-b border-slate-850/80";
        row.innerHTML = `
            <td class="py-4 px-6 text-slate-400 font-mono text-xs">${student.id}</td>
            <td class="py-4 px-6 font-semibold text-white">${student.name}</td>
            <td class="py-4 px-6 text-slate-300">${student.email}</td>
            <td class="py-4 px-6"><span class="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700/50 rounded-xl text-xs font-medium">${student.department || 'General'}</span></td>
            <td class="py-4 px-6 max-w-xs flex flex-wrap">${courseBadges}</td>
        `;
        tbody.appendChild(row);
    });
}

// Renders the Course Database Catalog in the UI Table
function renderCoursesTable(data) {
    const tbody = document.getElementById("courses-table-body");
    const emptyState = document.getElementById("courses-empty-state");
    tbody.innerHTML = "";
    
    if (data.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }
    emptyState.classList.add("hidden");

    data.forEach(course => {
        // Calculate dynamic active enrollment totals
        const enrollCount = course.students ? course.students.length : 0;
        
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/40 transition-colors border-b border-slate-850/80";
        row.innerHTML = `
            <td class="py-4 px-6 text-slate-400 font-mono text-xs">${course.id}</td>
            <td class="py-4 px-6 font-mono text-xs font-bold text-indigo-400">${course.code}</td>
            <td class="py-4 px-6 font-semibold text-white">${course.name}</td>
            <td class="py-4 px-6 text-slate-300">${course.instructor}</td>
            <td class="py-4 px-6"><span class="px-2 py-0.5 bg-slate-850 text-slate-400 border border-slate-800/80 rounded-md text-xs font-medium">${course.credits} Cr</span></td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <i class="fa-solid fa-circle text-[6px]"></i> ${enrollCount} Students
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Renders Active Registrations Matrix inside enrollments view
function renderEnrollmentMatrix() {
    const tbody = document.getElementById("enrollments-table-body");
    const emptyState = document.getElementById("enrollments-empty-state");
    tbody.innerHTML = "";
    
    let totalEnrollments = 0;
    
    studentsList.forEach(student => {
        if (student.courses && student.courses.length > 0) {
            student.courses.forEach(course => {
                totalEnrollments++;
                const row = document.createElement("tr");
                row.className = "hover:bg-slate-900/40 transition-colors border-b border-slate-850/80";
                row.innerHTML = `
                    <td class="py-4 px-6">
                        <div class="font-semibold text-white">${student.name}</div>
                        <div class="text-[10px] text-slate-500 font-mono">${student.email}</div>
                    </td>
                    <td class="py-4 px-6"><span class="px-2 py-0.5 bg-slate-850 text-slate-400 rounded-md text-xs">${student.department || 'General'}</span></td>
                    <td class="py-4 px-6">
                        <div class="font-semibold text-indigo-300 font-mono text-xs">${course.code}</div>
                        <div class="text-xs text-slate-300">${course.name}</div>
                    </td>
                    <td class="py-4 px-6 text-slate-400 text-xs">${course.instructor}</td>
                    <td class="py-4 px-6 text-center">
                        <span class="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">ACTIVE</span>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    });

    if (totalEnrollments === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
    }
}

// Populate the selection dropdowns in enrollment linkage view
function populateSelectDropdowns() {
    const studentSelect = document.getElementById("enroll-student-select");
    const courseSelect = document.getElementById("enroll-course-select");
    
    // Clear dynamic options retaining standard placeholder
    studentSelect.innerHTML = '<option value="" disabled selected>Select student...</option>';
    courseSelect.innerHTML = '<option value="" disabled selected>Select course...</option>';

    // Load active students
    studentsList.forEach(student => {
        const opt = document.createElement("option");
        opt.value = student.id;
        opt.innerText = `${student.name} (${student.email})`;
        studentSelect.appendChild(opt);
    });

    // Load active courses
    coursesList.forEach(course => {
        const opt = document.createElement("option");
        opt.value = course.id;
        opt.innerText = `${course.code} - ${course.name}`;
        courseSelect.appendChild(opt);
    });
}

// Client-side quick filter searching for Students
function filterStudents() {
    const query = document.getElementById("search-students").value.toLowerCase();
    const filtered = studentsList.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.email.toLowerCase().includes(query) || 
        (s.department && s.department.toLowerCase().includes(query))
    );
    renderStudentsTable(filtered);
}

// Client-side quick filter searching for Courses
function filterCourses() {
    const query = document.getElementById("search-courses").value.toLowerCase();
    const filtered = coursesList.filter(c => 
        c.code.toLowerCase().includes(query) || 
        c.name.toLowerCase().includes(query) || 
        c.instructor.toLowerCase().includes(query)
    );
    renderCoursesTable(filtered);
}

// Handle Student Creation Form Submission
async function handleStudentSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("student-submit-btn");
    const name = document.getElementById("student-name").value.trim();
    const email = document.getElementById("student-email").value.trim();
    const department = document.getElementById("student-department").value.trim();

    if (!name || !email) {
        showToast("Please fill in name and email coordinates.", "info");
        return;
    }

    setBtnLoading(submitBtn, true, "Creating...");

    try {
        const res = await fetch(`${API_BASE}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, department })
        });

        if (res.status === 409) {
            showToast("A student profile already holds this email signature.", "error");
        } else if (!res.ok) {
            throw new Error("API call returned failure status code.");
        } else {
            showToast("Student profile successfully registered in database.", "success");
            closeModal("student-modal");
            document.getElementById("student-form").reset();
            
            // Reload context state
            await loadAllData();
        }
    } catch (err) {
        showToast("Failed to compile profile record to endpoint.", "error");
        console.error(err);
    } finally {
        setBtnLoading(submitBtn, false, "Create Profile");
    }
}

// Handle Course Catalog Form Submission
async function handleCourseSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("course-submit-btn");
    const code = document.getElementById("course-code").value.trim().toUpperCase();
    const name = document.getElementById("course-name").value.trim();
    const instructor = document.getElementById("course-instructor").value.trim();
    const credits = parseInt(document.getElementById("course-credits").value);

    if (!code || !name || !instructor || isNaN(credits)) {
        showToast("Complete all parameters in the course specification.", "info");
        return;
    }

    setBtnLoading(submitBtn, true, "Adding...");

    try {
        const res = await fetch(`${API_BASE}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, name, instructor, credits })
        });

        if (res.status === 409) {
            showToast("This unique Course Code already exists in registry.", "error");
        } else if (!res.ok) {
            throw new Error("API call returned failure status code.");
        } else {
            showToast("Course track added successfully to academic schema.", "success");
            closeModal("course-modal");
            document.getElementById("course-form").reset();
            
            // Reload context state
            await loadAllData();
        }
    } catch (err) {
        showToast("Failed to write course catalog parameters.", "error");
        console.error(err);
    } finally {
        setBtnLoading(submitBtn, false, "Add Course");
    }
}

// Handle Student Course Enrollment Linkage Form
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("enrollment-submit-btn");
    const studentId = document.getElementById("enroll-student-select").value;
    const courseId = document.getElementById("enroll-course-select").value;

    if (!studentId || !courseId) {
        showToast("Select both student and target course to bind linkage.", "info");
        return;
    }

    setBtnLoading(submitBtn, true, "Enrolling...");

    try {
        const res = await fetch(`${API_BASE}/students/${studentId}/register/${courseId}`, {
            method: "POST"
        });

        if (res.status === 409) {
            showToast("Selected student already registered in this track.", "error");
        } else if (!res.ok) {
            throw new Error("Enrollment linkage failed at gateway.");
        } else {
            showToast("Student enrollment successfully bound and persisted.", "success");
            document.getElementById("enrollment-form").reset();
            
            // Reload state
            await loadAllData();
        }
    } catch (err) {
        showToast("Encountered gateway exception binding enrollment.", "error");
        console.error(err);
    } finally {
        setBtnLoading(submitBtn, false, "Link Enrollment");
    }
}

// Manage Button Async Spinner state
function setBtnLoading(btn, isLoading, placeholderText) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-2"></i> ${placeholderText}`;
        btn.classList.add("opacity-80", "cursor-not-allowed");
    } else {
        btn.disabled = false;
        btn.innerHTML = placeholderText;
        btn.classList.remove("opacity-80", "cursor-not-allowed");
    }
}

// Modal Controllers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("hidden");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add("hidden");
}

// Dynamic Floating Toast Alert notifications
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    
    // Create new alert elements
    const toast = document.createElement("div");
    toast.className = "flex items-center gap-3 p-4 rounded-2xl border text-xs font-semibold shadow-2xl transition-all duration-300 transform translate-y-6 opacity-0 animate-scale-up";
    
    let iconClass = "";
    let borderTheme = "";
    let textTheme = "text-white";
    
    if (type === "success") {
        borderTheme = "bg-slate-900 border-emerald-500/30 shadow-emerald-950/20";
        iconClass = "fa-solid fa-circle-check text-emerald-400";
    } else if (type === "error") {
        borderTheme = "bg-slate-900 border-rose-500/30 shadow-rose-950/20";
        iconClass = "fa-solid fa-triangle-exclamation text-rose-400";
    } else {
        borderTheme = "bg-slate-900 border-indigo-500/30 shadow-indigo-950/20";
        iconClass = "fa-solid fa-circle-info text-indigo-400";
    }
    
    toast.className += ` ${borderTheme} ${textTheme}`;
    toast.innerHTML = `
        <i class="${iconClass} text-base shrink-0"></i>
        <div class="flex-1">${message}</div>
        <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-slate-200 transition-all shrink-0"><i class="fa-solid fa-xmark"></i></button>
    `;
    
    container.appendChild(toast);
    
    // Style layout transition properties
    setTimeout(() => {
        toast.classList.remove("translate-y-6", "opacity-0");
    }, 50);

    // Auto-dismiss duration settings
    setTimeout(() => {
        toast.className += " translate-y-2 opacity-0 scale-95";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4500);
}
