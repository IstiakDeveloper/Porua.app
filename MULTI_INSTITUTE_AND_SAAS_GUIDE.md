# 🏫 Porua.app — Multi-Institute White-Label & SaaS Transition Architecture Guide

This document serves as the complete technical manual for operating **Porua.app** across multiple schools, madrasahs, and coaching centers, covering white-label deployment, dedicated hosting, and the future transition roadmap to a centralized Multi-Tenant SaaS.

---

## 📌 Executive Summary: Dedicated Instance vs. Multi-Tenant SaaS in Bangladesh

When serving educational institutions in Bangladesh, choosing the right software distribution model is critical for both security and operational reliability:

### 1. The Strategy: Dedicated White-Label Instance (Current Architecture - Recommended)
* **Model**: Each client (e.g. *Ideal School*, *Retina Coaching*, *UCC*) runs on its own virtual host or subdomain (e.g., `ideal.porua.app`, `retina.porua.app`, or custom domain `retinabd.org`).
* **Why this is best for 1 to 30 institutions**:
  1. **ZKTeco Biometric Reliability**: Biometric attendance machines installed at campus entrance gates push raw UDP/TCP packets to a specific domain or port. In a single-tenant instance, there is zero risk of student punches cross-contaminating another institution's database.
  2. **100% Data Privacy & Security**: Coaching centers consider their student lists, revenue splits, and exam question papers strictly confidential. Physical database isolation guarantees zero data leakage.
  3. **Customization & Downtime Isolation**: If one school requires a custom receipt format or is undergoing maintenance, no other school is affected.
  4. **Instant Setup with Built-in Wizard**: New instances can be launched in **under 2 minutes** using the built-in Setup Wizard (`/setup`) or CLI command (`php artisan institute:setup`).

### 2. The Future Bridge: Centralized SaaS Engine (Phase 7 Roadmap)
* Once you scale beyond 30-50 institutions, you can transition to a centralized SaaS engine using `stancl/tenancy`.
* Because all database queries throughout Porua.app are now strictly modeled with dynamic settings and clean separation, upgrading to `stancl/tenancy` (separate database per tenant) requires zero schema rewrites.

---

## 🚀 How to Deploy a New School or Coaching Center

You have two rapid deployment workflows for spinning up new clients:

### Method A: Interactive Web Setup Wizard (GUI)
1. Point a new subdomain or domain (e.g. `client.porua.app`) to the webroot (`/public`).
2. Run database migrations:
   ```bash
   php artisan migrate
   php artisan storage:link
   ```
3. Login as Super Admin and navigate to:
   ```
   https://client.porua.app/setup
   ```
4. Complete the 4-step wizard:
   - **Step 1: Institute Mode & Identity**: Select **School / Madrasah**, **Coaching Center**, or **Hybrid**; enter Institution Name, contact info, currency (`৳`), and upload Logo & Favicon.
   - **Step 2: Academic Session**: Define active academic session (e.g., `2026-2027`).
   - **Step 3: Initial Account**: Create the primary cash drawer or bank ledger account.
   - **Step 4: Review & Launch**: Instantly compiles branding, flushes cache, and opens the dashboard.

---

### Method B: Headless Terminal / CLI Setup (Fast SysAdmin Deployment)
For automated server scripts or CI/CD pipelines, run the dedicated artisan command:

```bash
php artisan institute:setup \
  --name="Retina Medical Coaching Center" \
  --type="coaching" \
  --phone="01711000000" \
  --address="Farmgate, Dhaka" \
  --currency="৳" \
  --session="2026-2027"
```

The CLI engine will automatically:
- Set all institute branding keys in the database.
- Configure `institute_type` to `coaching`.
- Create the active academic session.
- Initialize the primary `Main Cash Counter` ledger.
- Invalidate the `global_institute_settings` cache.

---

## 🎨 Three Dynamic Operating Modes Explained

| Feature | School / Madrasah Mode | Coaching Center Mode | Hybrid Mode (Dual) |
| :--- | :---: | :---: | :---: |
| **Class Structure** | Fixed Classes & Sections (Class 1-10) | Multi-Subject Courses & Batches | Both School Classes & Batches |
| **Enrollment** | Yearly Promotion & Roll Numbers | Course-wise Batch Enrollments | Simultaneous Class & Batch Enrollments |
| **Billing Model** | Monthly Tuition, Exam Fees, Annual Fees | Batch Fee, Crash Course Installments | Both Fee Structures Side-by-Side |
| **Teacher Remuneration** | Monthly Payroll / Salary Slips | Revenue Share (% Share, Fixed, Per Class) | Salary Slips + Batch Commission Payouts |
| **Examinations** | Term Exams, Class Marks, Progress Cards | Rapid Model Tests, Daily Quizzes | Term Exams + Model Test Merit Lists |
| **Biometric Attendance** | Daily Student & Staff Punch Logs | Daily Student & Staff Punch Logs | Shared Biometric Device Engine |

---

## 🌐 Nginx Virtual Host Template (Subdomain / Custom Domain)

```nginx
server {
    listen 80;
    server_name client.porua.app coaching1.porua.app customschool.edu.bd;
    root /var/www/porua.app/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## ⚙️ Maintenance & Verification Commands

```bash
# Clear all application and settings cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Recompile frontend assets for production
cmd /c "npm run build"

# Verify all routes
php artisan route:list --name=coaching
php artisan route:list --name=model-tests
php artisan route:list --name=teacher-payouts
```
