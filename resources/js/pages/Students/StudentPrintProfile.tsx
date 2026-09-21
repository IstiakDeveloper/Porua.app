import React from 'react';
import { Student } from './Show';
import { useInstitute } from '@/hooks/useInstitute';

interface StudentPrintProfileProps {
    student: Student;
    appName?: string;
}

export default function StudentPrintProfile({ student, appName }: StudentPrintProfileProps) {
    const institute = useInstitute();
    const effectiveAppName = appName || institute.name;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFullAddress = (prefix: 'present' | 'permanent') => {
        const parts = [
            student[`${prefix}_address_house_number`],
            student[`${prefix}_address_village`],
            student[`${prefix}_address_ward`] ? `Ward ${student[`${prefix}_address_ward`]}` : null,
            student[`${prefix}_address_upazila`],
            student[`${prefix}_address_district`],
            student[`${prefix}_address_division`],
            student[`${prefix}_address_post`] ? `Post: ${student[`${prefix}_address_post`]}` : null,
            student[`${prefix}_address_post_code`] ? `Postcode: ${student[`${prefix}_address_post_code`]}` : null,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : student[`${prefix}_address`] || 'Not provided';
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = generatePrintHTML();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for images to load then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    };

    const generatePrintHTML = () => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Profile - ${student.first_name} ${student.last_name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4 portrait;
            margin: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: white;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            background: white;
        }

        .header {
            text-align: center;
            border-bottom: 4px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 28px;
            color: #1e40af;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 12px;
            color: #6b7280;
        }

        .student-header {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }

        .photo-container {
            flex-shrink: 0;
        }

        .photo {
            width: 120px;
            height: 140px;
            object-fit: cover;
            border: 4px solid #bfdbfe;
            border-radius: 8px;
        }

        .photo-placeholder {
            width: 120px;
            height: 140px;
            background: #e5e7eb;
            border: 4px solid #bfdbfe;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
        }

        .student-info {
            flex: 1;
        }

        .student-info h2 {
            font-size: 22px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
        }

        .student-info .name-bn {
            font-size: 18px;
            color: #4b5563;
            margin-bottom: 10px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 12px;
        }

        .info-grid strong {
            font-weight: 600;
        }

        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            padding: 8px 12px;
            margin-bottom: 12px;
            border-left: 4px solid;
        }

        .section-title.blue {
            background: #dbeafe;
            border-color: #2563eb;
            color: #1e40af;
        }

        .section-title.green {
            background: #d1fae5;
            border-color: #10b981;
            color: #047857;
        }

        .section-title.pink {
            background: #fce7f3;
            border-color: #ec4899;
            color: #be185d;
        }

        .section-title.purple {
            background: #e9d5ff;
            border-color: #a855f7;
            color: #7e22ce;
        }

        .section-title.red {
            background: #fee2e2;
            border-color: #ef4444;
            color: #b91c1c;
        }

        .section-title.cyan {
            background: #cffafe;
            border-color: #06b6d4;
            color: #0e7490;
        }

        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
        }

        .data-grid div {
            padding: 4px 0;
        }

        .data-grid strong {
            font-weight: 600;
            color: #374151;
        }

        .box {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 12px;
        }

        .box.blue {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
        }

        .box.pink {
            background: #fdf2f8;
            border-left: 4px solid #ec4899;
        }

        .box.yellow {
            background: #fefce8;
            border-left: 4px solid #eab308;
        }

        .box.green {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
        }

        .box.red {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
        }

        .box.purple {
            background: #faf5ff;
            border-left: 4px solid #a855f7;
        }

        .box h4 {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .badge {
            font-size: 9px;
            padding: 2px 8px;
            border-radius: 4px;
            background: #fee2e2;
            color: #991b1b;
        }

        .address-box {
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 10px;
            font-size: 11px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
        }

        .footer strong {
            font-weight: 600;
        }

        .signature-line {
            border-top: 1px solid #374151;
            width: 150px;
            margin-bottom: 5px;
            margin-top: 60px;
        }

        .alert-box {
            padding: 8px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 11px;
        }

        .alert-box.yellow {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
        }

        .alert-box.purple {
            background: #ede9fe;
            border-left: 4px solid #8b5cf6;
        }

        .status-active {
            color: #047857;
            font-weight: 700;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .page {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            ${institute.logo_url ? `<img src="${institute.logo_url}" style="height: 48px; max-width: 140px; margin: 0 auto 6px; object-fit: contain;" alt="Logo" />` : ''}
            <h1>${effectiveAppName}</h1>
            ${institute.address ? `<p style="font-size: 11px; color: #4b5563; margin-bottom: 2px;">${institute.address}</p>` : ''}
            <p>Student Profile & Official Academic Record</p>
        </div>

        <div class="student-header">
            <div class="photo-container">
                ${student.photo_url
                    ? `<img src="${student.photo_url}" alt="Student Photo" class="photo" />`
                    : `<div class="photo-placeholder">👤</div>`
                }
            </div>
            <div class="student-info">
                <h2>${student.first_name} ${student.last_name}</h2>
                ${(student.name_bn || student.first_name_bengali)
                    ? `<div class="name-bn">${student.name_bn || `${student.first_name_bengali || ''} ${student.last_name_bengali || ''}`.trim()}</div>`
                    : ''
                }
                <div class="info-grid">
                    <div><strong>Admission No:</strong> ${student.admission_number}</div>
                    ${student.student_id ? `<div><strong>Student ID:</strong> ${student.student_id}</div>` : ''}
                    ${student.roll_number ? `<div><strong>Roll Number:</strong> ${student.roll_number}</div>` : ''}
                    ${student.form_number ? `<div><strong>Form Number:</strong> ${student.form_number}</div>` : ''}
                    <div><strong>Class:</strong> ${student.school_class?.name || 'N/A'}</div>
                    <div><strong>Section:</strong> ${student.section?.name || 'N/A'}</div>
                    <div><strong>Academic Year:</strong> ${student.academic_year?.name || 'N/A'}</div>
                    <div><strong>Status:</strong> <span class="status-active">${student.status.toUpperCase()}</span></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title blue">PERSONAL INFORMATION</div>
            <div class="data-grid">
                <div><strong>Date of Birth:</strong> ${formatDate(student.date_of_birth)}</div>
                <div><strong>Gender:</strong> ${student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}</div>
                ${student.blood_group ? `<div><strong>Blood Group:</strong> ${student.blood_group}</div>` : ''}
                ${student.religion ? `<div><strong>Religion:</strong> ${student.religion}</div>` : ''}
                <div><strong>Nationality:</strong> ${student.nationality || 'Bangladeshi'}</div>
                ${student.birth_place_district ? `<div><strong>Birth Place:</strong> ${student.birth_place_district}</div>` : ''}
                ${student.birth_certificate_no ? `<div><strong>Birth Certificate:</strong> ${student.birth_certificate_no}</div>` : ''}
                ${student.birth_certificate_number ? `<div><strong>Birth Certificate (Alt):</strong> ${student.birth_certificate_number}</div>` : ''}
            </div>
            ${student.minorities ? `
                <div class="alert-box yellow">
                    <strong>Minority Community:</strong> ${student.minority_name || 'Yes'}
                </div>
            ` : ''}
            ${student.handicap ? `
                <div class="alert-box purple">
                    <strong>Disability/Special Needs:</strong> ${student.handicap}
                </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title green">CONTACT INFORMATION</div>
            <div style="font-size: 11px; margin-bottom: 12px;">
                <div style="margin-bottom: 6px;"><strong>Email:</strong> ${student.user?.email || student.email}</div>
                ${(student.user?.phone || student.phone) ? `<div><strong>Phone:</strong> ${student.user?.phone || student.phone}</div>` : ''}
            </div>
            <div class="address-box box blue">
                <strong>Present Address:</strong><br/>
                ${getFullAddress('present')}
            </div>
            <div class="address-box box green">
                <strong>Permanent Address:</strong><br/>
                ${getFullAddress('permanent')}
            </div>
        </div>

        <div class="section">
            <div class="section-title pink">PARENT/GUARDIAN INFORMATION</div>

            <div class="box blue">
                <h4>
                    <span>Father's Information</span>
                    ${student.father_dead ? '<span class="badge">Deceased</span>' : ''}
                </h4>
                <div class="data-grid">
                    ${(student.father_name_en || student.father_name) ? `<div><strong>Name (English):</strong> ${student.father_name_en || student.father_name}</div>` : ''}
                    ${student.father_name_bn ? `<div><strong>Name (Bengali):</strong> ${student.father_name_bn}</div>` : ''}
                    ${student.father_nid ? `<div><strong>NID:</strong> ${student.father_nid}</div>` : ''}
                    ${student.father_dob ? `<div><strong>DOB:</strong> ${formatDate(student.father_dob)}</div>` : ''}
                    ${student.father_occupation ? `<div><strong>Occupation:</strong> ${student.father_occupation}</div>` : ''}
                    ${student.father_phone ? `<div><strong>Phone:</strong> ${student.father_phone}</div>` : ''}
                    ${student.father_mobile ? `<div><strong>Mobile:</strong> ${student.father_mobile}</div>` : ''}
                </div>
            </div>

            <div class="box pink">
                <h4>
                    <span>Mother's Information</span>
                    ${student.mother_dead ? '<span class="badge">Deceased</span>' : ''}
                </h4>
                <div class="data-grid">
                    ${(student.mother_name_en || student.mother_name) ? `<div><strong>Name (English):</strong> ${student.mother_name_en || student.mother_name}</div>` : ''}
                    ${student.mother_name_bn ? `<div><strong>Name (Bengali):</strong> ${student.mother_name_bn}</div>` : ''}
                    ${student.mother_nid ? `<div><strong>NID:</strong> ${student.mother_nid}</div>` : ''}
                    ${student.mother_dob ? `<div><strong>DOB:</strong> ${formatDate(student.mother_dob)}</div>` : ''}
                    ${student.mother_occupation ? `<div><strong>Occupation:</strong> ${student.mother_occupation}</div>` : ''}
                    ${student.mother_phone ? `<div><strong>Phone:</strong> ${student.mother_phone}</div>` : ''}
                    ${student.mother_mobile ? `<div><strong>Mobile:</strong> ${student.mother_mobile}</div>` : ''}
                </div>
            </div>

            ${(student.guardian_name || student.guardian_phone) ? `
                <div class="box yellow">
                    <h4>Legal Guardian</h4>
                    <div class="data-grid">
                        ${student.guardian_name ? `<div><strong>Name:</strong> ${student.guardian_name}</div>` : ''}
                        ${student.guardian_phone ? `<div><strong>Phone:</strong> ${student.guardian_phone}</div>` : ''}
                        ${student.guardian_relation ? `<div><strong>Relation:</strong> ${student.guardian_relation.charAt(0).toUpperCase() + student.guardian_relation.slice(1)}</div>` : ''}
                    </div>
                </div>
            ` : ''}
        </div>

        ${(student.previous_school || student.previous_class || student.previous_exam_result) ? `
            <div class="section">
                <div class="section-title purple">PREVIOUS EDUCATION</div>
                <div class="data-grid">
                    ${student.previous_school ? `<div><strong>Previous School:</strong> ${student.previous_school}</div>` : ''}
                    ${student.previous_class ? `<div><strong>Previous Class:</strong> ${student.previous_class}</div>` : ''}
                    ${student.previous_exam_result ? `<div><strong>Previous Result:</strong> ${student.previous_exam_result}</div>` : ''}
                </div>
            </div>
        ` : ''}

        ${(student.medical_conditions || student.allergies || student.special_notes) ? `
            <div class="section">
                <div class="section-title red">HEALTH & MEDICAL INFORMATION</div>
                ${student.medical_conditions ? `
                    <div class="box red" style="margin-bottom: 8px;">
                        <strong>Medical Conditions:</strong> ${student.medical_conditions}
                    </div>
                ` : ''}
                ${student.allergies ? `
                    <div class="box red" style="margin-bottom: 8px;">
                        <strong>Allergies:</strong> ${student.allergies}
                    </div>
                ` : ''}
                ${student.special_notes ? `
                    <div class="box red" style="margin-bottom: 8px;">
                        <strong>Special Notes:</strong> ${student.special_notes}
                    </div>
                ` : ''}
            </div>
        ` : ''}

        ${student.monthly_fee ? `
            <div class="section">
                <div class="section-title cyan">FEE INFORMATION</div>
                <div class="box" style="background: #ecfeff; border-left: 4px solid #06b6d4; display: inline-block; padding: 12px 20px;">
                    <strong>Monthly Fee:</strong> <span style="font-size: 18px; font-weight: bold; color: #0e7490;">৳ ${student.monthly_fee}</span>
                </div>
            </div>
        ` : ''}

        <div class="footer">
            <div>
                <div><strong>Admission Date:</strong> ${formatDate(student.admission_date)}</div>
                ${student.information_correct ? '<div style="color: #047857; margin-top: 5px;">✓ Information Verified</div>' : ''}
            </div>
            <div style="text-align: right;">
                <div class="signature-line"></div>
                <div><strong>Authorized Signature</strong></div>
                <div style="font-size: 9px; color: #6b7280; margin-top: 5px;">Printed on: ${new Date().toLocaleDateString('en-US')}</div>
            </div>
        </div>
    </div>
</body>
</html>
        `.trim();
    };

    return (
        <div className="text-center">
            <button
                onClick={handlePrint}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-lg font-semibold"
            >
                🖨️ Open Print Preview
            </button>
            <p className="text-sm text-gray-600 mt-2">Click to open printable A4 profile in new tab</p>
        </div>
    );
}
