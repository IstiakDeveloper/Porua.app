import React from 'react';
import { Student } from './Show';
import { useInstitute } from '@/hooks/useInstitute';

interface StudentIDCardProps {
    student: Student;
    appName?: string;
    schoolLogo?: string;
}

export default function StudentIDCard({ student, appName, schoolLogo }: StudentIDCardProps) {
    const institute = useInstitute();
    const effectiveAppName = appName || institute.name;
    const effectiveLogo = schoolLogo || institute.logo_url || '/logo.png';
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = generateIDCardHTML();
        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    };

    const generateIDCardHTML = () => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ID Card - ${student.first_name} ${student.last_name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4 landscape;
            margin: 20mm;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            padding: 0;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .cards-container {
            display: flex;
            flex-direction: row;
            gap: 15mm;
            align-items: center;
            justify-content: center;
            padding: 10mm;
        }

        .id-card {
            width: 85.6mm;
            height: 53.98mm;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
            position: relative;
            page-break-inside: avoid;
            border: 2px solid #1e293b;
        }

        /* Front Card */
        .card-front {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 8px;
            display: flex;
            flex-direction: column;
            height: 100%;
            border: 2px solid #1e3a8a;
        }

        .card-front::before {
            content: '';
            position: absolute;
            top: -15px;
            right: -15px;
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.08);
            border-radius: 50%;
        }

        .card-front::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: -20px;
            width: 90px;
            height: 90px;
            background: rgba(255,255,255,0.08);
            border-radius: 50%;
        }

        .card-header {
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.4);
            padding-bottom: 6px;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }

        .card-header h1 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
            letter-spacing: 0.3px;
        }

        .card-header p {
            font-size: 7px;
            opacity: 0.95;
        }

        .card-body {
            display: flex;
            gap: 10px;
            flex: 1;
            position: relative;
            z-index: 1;
        }

        .photo-section {
            flex-shrink: 0;
        }

        .student-photo {
            width: 50px;
            height: 60px;
            object-fit: cover;
            border: 2px solid white;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
        }

        .photo-placeholder {
            width: 50px;
            height: 60px;
            border: 2px solid white;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .info-section {
            flex: 1;
            font-size: 8px;
            line-height: 1.3;
        }

        .student-name {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
            line-height: 1.1;
        }

        .student-name-bn {
            font-size: 9px;
            opacity: 0.95;
            margin-bottom: 4px;
        }

        .info-row {
            margin-bottom: 2px;
        }

        .info-row strong {
            font-weight: 600;
        }

        .card-footer {
            text-align: center;
            font-size: 6px;
            opacity: 0.9;
            padding-top: 6px;
            border-top: 1px solid rgba(255,255,255,0.4);
            position: relative;
            z-index: 1;
        }

        /* Back Card */
        .card-back {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            color: #1f2937;
            padding: 8px;
            display: flex;
            flex-direction: column;
            height: 100%;
            border: 2px solid #64748b;
        }

        .info-box {
            background: white;
            border-radius: 4px;
            padding: 6px;
            margin-bottom: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }

        .info-box h3 {
            font-size: 7px;
            font-weight: bold;
            margin-bottom: 4px;
            padding-bottom: 3px;
            border-bottom: 1px solid #e5e7eb;
        }

        .info-box.contact h3 {
            color: #1e40af;
            border-color: #bfdbfe;
        }

        .info-box.emergency h3 {
            color: #b91c1c;
            border-color: #fecaca;
        }

        .info-box p {
            font-size: 7px;
            margin-bottom: 2px;
            line-height: 1.2;
        }

        .medical-alert {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 4px;
            padding: 5px;
            margin-bottom: 6px;
        }

        .medical-alert h3 {
            font-size: 7px;
            font-weight: bold;
            color: #b91c1c;
            margin-bottom: 3px;
        }

        .medical-alert p {
            font-size: 6px;
            margin-bottom: 1px;
        }

        .signature-area {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 6px;
            margin-top: auto;
            padding-top: 6px;
            border-top: 1px solid #9ca3af;
        }

        .signature-line {
            border-top: 1px solid #4b5563;
            width: 45px;
            margin-bottom: 2px;
        }

        .disclaimer {
            text-align: center;
            font-size: 5px;
            color: #6b7280;
            margin-top: 3px;
            line-height: 1.2;
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            .cards-container {
                padding: 0;
                page-break-inside: avoid;
            }
            .id-card {
                box-shadow: none;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="cards-container">
        <!-- Front Card -->
        <div class="id-card">
            <div class="card-front">
                <div class="card-header">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <img src="${effectiveLogo}" style="width: 22px; height: 22px; object-fit: contain; background: white; border-radius: 4px; padding: 1.5px;" alt="Logo" />
                        <div>
                            <h1>${effectiveAppName}</h1>
                            <p>STUDENT IDENTITY CARD</p>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="photo-section">
                        ${student.photo_url
                            ? `<img src="${student.photo_url}" alt="Student" class="student-photo" />`
                            : `<div class="photo-placeholder">👤</div>`
                        }
                    </div>

                    <div class="info-section">
                        <div class="student-name">${student.first_name} ${student.last_name}</div>
                        ${(student.name_bn || student.first_name_bengali)
                            ? `<div class="student-name-bn">${student.name_bn || `${student.first_name_bengali || ''} ${student.last_name_bengali || ''}`.trim()}</div>`
                            : ''
                        }

                        ${student.student_id ? `<div class="info-row"><strong>Student ID:</strong> ${student.student_id}</div>` : `<div class="info-row"><strong>ID:</strong> ${student.admission_number}</div>`}
                        ${student.roll_number ? `<div class="info-row"><strong>Roll:</strong> ${student.roll_number}</div>` : ''}
                        <div class="info-row"><strong>Class:</strong> ${student.school_class?.name || 'N/A'} ${student.section?.name ? `(${student.section.name})` : ''}</div>
                        ${student.blood_group ? `<div class="info-row"><strong>Blood:</strong> <strong style="color: #fef08a;">${student.blood_group}</strong></div>` : ''}
                        <div class="info-row"><strong>Session:</strong> ${student.academic_year?.name || 'Current'}</div>
                    </div>
                </div>

                <div class="card-footer">
                    Valid for Academic Year ${student.academic_year?.name || 'Current'}
                </div>
            </div>
        </div>

        <!-- Back Card -->
        <div class="id-card">
            <div class="card-back">
                <div class="info-box contact">
                    <h3>📞 CONTACT INFORMATION</h3>
                    <p><strong>Phone:</strong> ${student.user?.phone || student.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${student.user?.email || student.email}</p>
                    ${student.present_address_district
                        ? `<p><strong>Address:</strong> ${student.present_address_district}, ${student.present_address_division}</p>`
                        : ''
                    }
                </div>

                <div class="info-box emergency">
                    <h3>🚨 EMERGENCY CONTACT</h3>
                    ${(student.father_name || student.father_name_en)
                        ? `<p><strong>Father:</strong> ${student.father_name_en || student.father_name}</p>
                           ${student.father_mobile ? `<p><strong>Mobile:</strong> ${student.father_mobile}</p>` : ''}`
                        : ''
                    }
                    ${(student.mother_name || student.mother_name_en)
                        ? `<p><strong>Mother:</strong> ${student.mother_name_en || student.mother_name}</p>
                           ${student.mother_mobile ? `<p><strong>Mobile:</strong> ${student.mother_mobile}</p>` : ''}`
                        : ''
                    }
                    ${(student.guardian_phone && !student.father_mobile && !student.mother_mobile)
                        ? `<p><strong>Guardian:</strong> ${student.guardian_phone}</p>`
                        : ''
                    }
                </div>

                ${(student.blood_group || student.medical_conditions || student.allergies)
                    ? `<div class="medical-alert">
                        <h3>⚕️ MEDICAL INFORMATION</h3>
                        ${student.blood_group ? `<p><strong>Blood Group:</strong> ${student.blood_group}</p>` : ''}
                        ${student.medical_conditions ? `<p><strong>Condition:</strong> ${student.medical_conditions}</p>` : ''}
                        ${student.allergies ? `<p><strong>Allergies:</strong> ${student.allergies}</p>` : ''}
                    </div>`
                    : ''
                }

                <div class="signature-area">
                    <div>
                        <div class="signature-line"></div>
                        <strong>Student Sign</strong>
                    </div>
                    <div style="text-align: center;">
                        <div class="signature-line"></div>
                        <strong>${institute.type === 'coaching' ? 'Authority Sign' : 'Principal Sign'}</strong>
                    </div>
                    <div style="text-align: right;">
                        <strong>Issued:</strong><br/>${formatDate(student.admission_date)}
                    </div>
                </div>

                <div class="disclaimer">
                    If found, please return to ${effectiveAppName}
                    ${institute.phone ? `<br/>Phone: ${institute.phone}` : ''}
                </div>
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
                💳 Open ID Card Preview
            </button>
            <p className="text-sm text-gray-600 mt-2">Click to open printable ID card in new tab (Front & Back)</p>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Printing Instructions:</h3>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside text-left">
                    <li>Click the button above to open print preview in new tab</li>
                    <li><strong>Front and Back cards will appear side by side</strong> on one page</li>
                    <li>Set printer to <strong>Landscape</strong> orientation</li>
                    <li>Use <strong>A4 paper</strong> size</li>
                    <li>Enable <strong>Background graphics</strong> in print settings</li>
                    <li>Standard ID card size: <strong>85.6mm × 53.98mm</strong></li>
                    <li>Each card has <strong>complete border</strong> for professional look</li>
                    <li>Shows <strong>Student ID</strong> (if available) or Admission Number</li>
                    <li>Recommended: Use card stock paper (200-250 GSM)</li>
                    <li>Cut along the card edges and laminate for durability</li>
                </ul>
            </div>
        </div>
    );
}
