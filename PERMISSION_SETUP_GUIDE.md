# 🔐 Permission Assignment Setup Guide
## School Management System - Laravel 12 + React 19

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Database Structure](#database-structure)
3. [Permission Assignment Steps](#permission-assignment-steps)
4. [Testing Permissions](#testing-permissions)
5. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 System Overview

### **Built-in Roles:**
1. **Super Admin** - Full system access
2. **Principal** - School-wide management
3. **Teacher** - Academic and student management
4. **Accountant** - Financial operations
5. **Librarian** - Library management
6. **Student** - Limited access
7. **Parent** - View child information

### **Permission Modules:**
- **users** - User management
- **roles** - Role management
- **students** - Student operations
- **teachers** - Teacher operations
- **academic** - Academic year, classes, sections, subjects
- **attendance** - Student and teacher attendance
- **exams** - Exams, schedules, marks, results
- **fees** - Fee types, collections, waivers
- **library** - Books, issues, returns
- **reports** - System reports

---

## 🗄️ Database Structure

### **Tables:**
```
users
├── id
├── name
├── email
├── password
└── status

roles
├── id
├── name
├── slug
└── description

permissions
├── id
├── name
├── slug
├── description
└── module (users, students, teachers, etc.)

role_user (pivot)
├── role_id
└── user_id

permission_role (pivot)
├── permission_id
└── role_id
```

---

## 🚀 Permission Assignment Steps

### **Step 1: Initial Database Setup**

```bash
# Run migrations and seeders
php artisan migrate:fresh --seed
```

This creates:
- ✅ 7 default roles
- ✅ All system permissions (100+ permissions)
- ✅ Default Super Admin user (admin@example.com / password)

---

### **Step 2: Login as Super Admin**

```
URL: http://localhost:8000/login
Email: admin@example.com
Password: password
```

---

### **Step 3: Navigate to Permissions**

**Sidebar Menu:**
```
Dashboard
└── Users
    ├── All Users
    ├── Roles  ← Click here
    └── Permissions ← Or here
```

---

### **Step 4: View Existing Permissions**

**Go to:** `Users > Permissions`

You'll see permissions grouped by modules:
- 📘 **users** - view_users, create_users, edit_users, delete_users
- 🛡️ **roles** - view_roles, create_roles, edit_roles, delete_roles
- 🎓 **students** - view_students, create_students, edit_students, etc.
- 👨‍🏫 **teachers** - view_teachers, create_teachers, edit_teachers, etc.
- 📚 **academic** - manage_academic_years, manage_classes, etc.
- ✅ **attendance** - view_attendance, mark_attendance, etc.
- 📝 **exams** - view_exams, create_exams, grade_exams, etc.
- 💰 **fees** - view_fees, collect_fees, manage_fees, etc.
- 📖 **library** - view_books, issue_books, return_books, etc.
- 📊 **reports** - view_reports, generate_reports, etc.

---

### **Step 5: Create or Edit a Role**

#### **Option A: Create New Role**

1. **Navigate:** `Users > Roles > Create Role`
2. **Enter Role Name:** e.g., "Vice Principal"
3. **Select Permissions by Module:**
   - Click **"Select All"** on a module header to select all permissions in that module
   - Or click individual permission cards
   - Selected permissions show gradient background
4. **Save Role**

#### **Option B: Edit Existing Role**

1. **Navigate:** `Users > Roles`
2. **Click "Edit"** on any role (e.g., "Teacher")
3. **Modify Permissions:**
   - Blue checkmarks = currently assigned
   - Click to toggle on/off
   - Use "Select All" / "Deselect All" per module
4. **Update Role**

---

### **Step 6: Assign Roles to Users**

#### **Method 1: Create New User with Role**

1. **Navigate:** `Users > All Users > Create User`
2. **Fill in Basic Info:**
   - Name: John Doe
   - Email: john@school.com
   - Phone: +8801712345678
   - Password: ********
3. **Select Role(s):**
   - Click on role cards (e.g., "Teacher")
   - Multiple roles can be selected
4. **Set Status:** Active
5. **Create User**

#### **Method 2: Edit Existing User**

1. **Navigate:** `Users > All Users`
2. **Click "Edit"** on a user
3. **Change Role Assignment:**
   - Select/deselect role cards
4. **Update User**

---

## 🔍 Testing Permissions

### **Test Flow:**

1. **Logout as Super Admin**
2. **Login as Test User** (with specific role)
3. **Verify Access:**
   - ✅ Accessible pages show in sidebar
   - ❌ Unauthorized pages show 403 error
   - ✅ Allowed actions (Create, Edit, Delete) work
   - ❌ Forbidden actions are hidden or disabled

### **Example Test Cases:**

#### **Teacher Role:**
```
✅ Can view students
✅ Can mark attendance
✅ Can enter exam marks
✅ Can view class schedules
❌ Cannot create/delete users
❌ Cannot access fee management
❌ Cannot manage academic years
```

#### **Accountant Role:**
```
✅ Can view fee collections
✅ Can collect fees
✅ Can generate financial reports
✅ Can view students (for fee purposes)
❌ Cannot mark attendance
❌ Cannot enter exam marks
❌ Cannot manage users
```

#### **Librarian Role:**
```
✅ Can add/edit books
✅ Can issue books to students
✅ Can process returns
✅ Can view library reports
❌ Cannot access exams
❌ Cannot manage students
❌ Cannot collect fees
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: Permissions Not Showing in Role Create/Edit**

**Cause:** Backend not sending permissions data

**Solution:**
```php
// Check app/Http/Controllers/RoleController.php

public function create()
{
    $permissions = Permission::all()->groupBy('module');
    return Inertia::render('Roles/Create', [
        'permissions' => $permissions,
    ]);
}

public function edit(Role $role)
{
    $role->load('permissions');
    $permissions = Permission::all()->groupBy('module');
    return Inertia::render('Roles/Edit', [
        'role' => $role,
        'permissions' => $permissions,
    ]);
}
```

---

### **Issue 2: Permission Changes Not Saving**

**Cause:** Form data not being sent correctly

**Solution:**
```typescript
// In Roles/Create.tsx or Edit.tsx
const submit = (e: FormEvent) => {
    e.preventDefault();
    router.post('/roles', {
        name: data.name,
        permission_ids: data.permission_ids, // Array of IDs
    });
};
```

---

### **Issue 3: User Cannot Access Allowed Pages**

**Cause:** Middleware authorization check failing

**Solution:**
```php
// Check routes/web.php
Route::middleware(['auth', 'role:Teacher'])->group(function () {
    Route::get('/students', [StudentController::class, 'index']);
});

// Or in Controller:
public function index()
{
    $this->authorize('view_students'); // Check permission
    // ...
}
```

---

### **Issue 4: Role/Permission Mismatch After Seeding**

**Cause:** Seeders creating inconsistent data

**Solution:**
```bash
# Re-run migrations and seeders
php artisan migrate:fresh --seed

# Or manually sync a role's permissions:
php artisan tinker
>>> $role = Role::find(3); // Teacher role
>>> $permissions = Permission::whereIn('slug', [
...   'view_students', 'view_attendance', 'mark_attendance'
... ])->pluck('id');
>>> $role->permissions()->sync($permissions);
```

---

## 🎯 Quick Permission Setup Checklist

### **For New School Setup:**

- [ ] Run migrations: `php artisan migrate:fresh --seed`
- [ ] Login as Super Admin (admin@example.com)
- [ ] Navigate to `Users > Permissions` - verify all permissions exist
- [ ] Navigate to `Users > Roles` - verify all 7 roles exist
- [ ] Edit **Principal** role:
  - [ ] Assign: users, students, teachers, academic, attendance, exams, reports
- [ ] Edit **Teacher** role:
  - [ ] Assign: students (view), attendance (all), exams (view, grade), reports (view)
- [ ] Edit **Accountant** role:
  - [ ] Assign: students (view), fees (all), reports (financial)
- [ ] Edit **Librarian** role:
  - [ ] Assign: students (view), library (all), reports (library)
- [ ] Create test users for each role
- [ ] Test login and access for each role

---

## 📞 Support & Troubleshooting

### **Check System Logs:**
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Permission check logs
php artisan tinker
>>> activity()->all() // View all activity logs
```

### **Verify User Permissions:**
```bash
php artisan tinker
>>> $user = User::find(1);
>>> $user->roles; // See user's roles
>>> $user->roles->first()->permissions; // See role's permissions
```

### **Re-sync All Permissions:**
```bash
php artisan permission:sync
# or manually through web interface: Users > Permissions > Sync Permissions
```

---

## ✅ System is Ready When:

1. ✅ All 7 roles visible in `Users > Roles`
2. ✅ 100+ permissions visible in `Users > Permissions`
3. ✅ Can create new role and assign permissions
4. ✅ Can edit existing role and modify permissions
5. ✅ Can create user and assign roles
6. ✅ Can edit user and change roles
7. ✅ Permissions menu shows in sidebar under Users
8. ✅ Test user with Teacher role can access allowed pages only
9. ✅ Test user with Accountant role sees different sidebar menu
10. ✅ Permission checks work throughout the system

---

**🎉 Your Permission System is Now Fully Configured!**

**Default Super Admin Credentials:**
- Email: `admin@example.com`
- Password: `password`
- Has all permissions automatically

Start by assigning appropriate permissions to your staff roles, then create users and assign them to those roles!
