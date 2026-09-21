<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Academic Transcript - {{ $student->full_name }} (Roll: {{ $student->roll_number }})</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            color: #1e293b;
            background: #f8fafc;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border: 2px solid #0f172a;
            padding: 28px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            position: relative;
        }
        /* Top border decorative line */
        .container::before {
            content: "";
            position: absolute;
            top: 4px;
            left: 4px;
            right: 4px;
            bottom: 4px;
            border: 1px solid #94a3b8;
            pointer-events: none;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .header p {
            font-size: 11px;
            color: #475569;
            margin-bottom: 4px;
        }
        .badge-transcript {
            display: inline-block;
            background: #0f172a;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 4px 16px;
            border-radius: 9999px;
            margin-top: 6px;
        }
        .student-info-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
            padding: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 3px 6px;
            font-size: 11px;
        }
        .info-label {
            font-weight: 600;
            color: #64748b;
            width: 110px;
        }
        .info-value {
            font-weight: 700;
            color: #0f172a;
        }
        .grading-legend {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: 8px;
            padding: 4px;
            text-align: center;
        }
        .grading-legend table {
            width: 100%;
            border-collapse: collapse;
        }
        .grading-legend th, .grading-legend td {
            border: 1px solid #e2e8f0;
            padding: 2px;
            font-size: 8px;
        }
        .grading-legend th { background: #f1f5f9; font-weight: 700; }
        .marks-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .marks-table th, .marks-table td {
            border: 1px solid #334155;
            padding: 6px 8px;
            text-align: center;
            font-size: 11px;
        }
        .marks-table th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
        }
        .marks-table .text-left { text-align: left; }
        .marks-table .bold { font-weight: 700; }
        .grade-pill {
            display: inline-block;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .grade-pass { background: #dcfce7; color: #166534; }
        .grade-fail { background: #fee2e2; color: #991b1b; }
        .summary-box {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 24px;
            text-align: center;
        }
        .summary-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 8px;
            border-radius: 4px;
        }
        .summary-label {
            font-size: 10px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .summary-val {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
        }
        .status-pass { color: #16a34a; }
        .status-fail { color: #dc2626; }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 10px;
        }
        .sig-block {
            text-align: center;
            width: 180px;
        }
        .sig-line {
            border-top: 1px dashed #475569;
            margin-bottom: 4px;
        }
        .sig-title {
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
        }
        .print-actions {
            text-align: center;
            margin-bottom: 16px;
        }
        .btn-print {
            background: #2563eb;
            color: white;
            padding: 8px 20px;
            font-size: 13px;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn-print:hover { background: #1d4ed8; }
        @media print {
            body { background: #ffffff; padding: 0; }
            .print-actions { display: none; }
            .container {
                border: 2px solid #000000;
                box-shadow: none;
                max-width: 100%;
                width: 100%;
                padding: 16px;
            }
            .container::before { border-color: #000000; }
            @page { size: A4 portrait; margin: 10mm; }
        }
    </style>
</head>
<body>

    <div class="print-actions">
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="container">
        <!-- School Header -->
        <div class="header">
            <h1>{{ $schoolName }}</h1>
            @if(!empty($schoolAddress))
                <p>{{ $schoolAddress }}</p>
            @endif
            @if(!empty($schoolPhone) || !empty($schoolEmail))
                <p>Phone: {{ $schoolPhone }} | Email: {{ $schoolEmail }}</p>
            @endif
            <div class="badge-transcript">Academic Transcript / Marksheet</div>
        </div>

        <!-- Student & Exam Information -->
        <div class="student-info-grid">
            <table class="info-table">
                <tr>
                    <td class="info-label">Student Name:</td>
                    <td class="info-value">{{ $student->full_name }}</td>
                </tr>
                <tr>
                    <td class="info-label">Roll Number:</td>
                    <td class="info-value">{{ $student->roll_number }}</td>
                </tr>
                <tr>
                    <td class="info-label">Class & Section:</td>
                    <td class="info-value">
                        {{ $student->schoolClass->name ?? 'N/A' }} 
                        @if($student->section) - {{ $student->section->name }} @endif
                    </td>
                </tr>
                <tr>
                    <td class="info-label">Admission No:</td>
                    <td class="info-value">{{ $student->admission_number ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Examination:</td>
                    <td class="info-value">{{ $result->exam->name ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Academic Year:</td>
                    <td class="info-value">{{ $result->exam->academicYear->name ?? date('Y') }}</td>
                </tr>
            </table>

            <!-- Grading Scale Reference Box -->
            <div class="grading-legend">
                <div style="font-weight: 700; margin-bottom: 2px;">GRADING SCALE</div>
                <table>
                    <thead>
                        <tr><th>Marks</th><th>Grade</th><th>GP</th></tr>
                    </thead>
                    <tbody>
                        @if(isset($gradeSettings) && $gradeSettings->isNotEmpty())
                            @foreach($gradeSettings as $gs)
                                <tr>
                                    <td>{{ (int)$gs->min_marks }}-{{ (int)$gs->max_marks }}</td>
                                    <td><strong>{{ $gs->grade_name }}</strong></td>
                                    <td>{{ number_format($gs->grade_point, 2) }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr><td>80-100</td><td><strong>A+</strong></td><td>5.00</td></tr>
                            <tr><td>70-79</td><td><strong>A</strong></td><td>4.00</td></tr>
                            <tr><td>60-69</td><td><strong>A-</strong></td><td>3.50</td></tr>
                            <tr><td>50-59</td><td><strong>B</strong></td><td>3.00</td></tr>
                            <tr><td>40-49</td><td><strong>C</strong></td><td>2.00</td></tr>
                            <tr><td>33-39</td><td><strong>D</strong></td><td>1.00</td></tr>
                            <tr><td>0-32</td><td><strong>F</strong></td><td>0.00</td></tr>
                        @endif
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Subject Marks Table -->
        <table class="marks-table">
            <thead>
                <tr>
                    <th style="width: 5%;">SL</th>
                    <th class="text-left" style="width: 35%;">Subject Name</th>
                    <th style="width: 10%;">Full Marks</th>
                    <th style="width: 10%;">Theory</th>
                    <th style="width: 10%;">Practical</th>
                    <th style="width: 10%;">Obtained</th>
                    <th style="width: 10%;">Grade</th>
                    <th style="width: 10%;">GP</th>
                </tr>
            </thead>
            <tbody>
                @php $sl = 1; @endphp
                @forelse($marks as $mark)
                    <tr>
                        <td>{{ $sl++ }}</td>
                        <td class="text-left bold">{{ $mark->subject->name ?? 'Subject' }}</td>
                        <td>{{ (int)($mark->total_marks > 0 ? $mark->total_marks : 100) }}</td>
                        <td>{{ $mark->is_absent ? 'AB' : ($mark->theory_marks !== null ? $mark->theory_marks : '-') }}</td>
                        <td>{{ $mark->is_absent ? 'AB' : ($mark->practical_marks !== null ? $mark->practical_marks : '-') }}</td>
                        <td class="bold">{{ $mark->is_absent ? '0' : $mark->obtained_marks }}</td>
                        <td>
                            <span class="grade-pill {{ ($mark->grade === 'F' || $mark->is_absent) ? 'grade-fail' : 'grade-pass' }}">
                                {{ $mark->grade ?? '-' }}
                            </span>
                        </td>
                        <td class="bold">{{ $mark->is_absent ? '0.00' : number_format($mark->grade_point ?? 0, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" style="padding: 16px; color: #64748b;">No subject marks recorded for this examination.</td>
                    </tr>
                @endforelse
                <!-- Total Row -->
                <tr style="background: #f8fafc; font-weight: 700;">
                    <td colspan="2" class="text-left">TOTAL</td>
                    <td>{{ (int)$result->total_marks }}</td>
                    <td colspan="2">-</td>
                    <td class="bold">{{ (float)$result->obtained_marks }}</td>
                    <td>{{ $result->grade }}</td>
                    <td>{{ number_format((float)$result->gpa, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Result Summary Box -->
        <div class="summary-box">
            <div class="summary-card">
                <div class="summary-label">GPA (Out of 5.0)</div>
                <div class="summary-val {{ $result->result_status === 'pass' ? 'status-pass' : 'status-fail' }}">
                    {{ number_format((float)$result->gpa, 2) }}
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Overall Grade</div>
                <div class="summary-val {{ $result->grade === 'F' ? 'status-fail' : 'status-pass' }}">
                    {{ $result->grade }}
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Class Position</div>
                <div class="summary-val">
                    {{ $result->class_position ? '#' . $result->class_position : '-' }}
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Result Status</div>
                <div class="summary-val {{ $result->result_status === 'pass' ? 'status-pass' : 'status-fail' }}">
                    {{ strtoupper($result->result_status ?? 'PASS') }}
                </div>
            </div>
        </div>

        @if(!empty($result->remarks))
            <div style="font-size: 11px; margin-bottom: 20px; padding: 6px 12px; background: #f1f5f9; border-left: 3px solid #0f172a;">
                <strong>Remarks:</strong> {{ $result->remarks }}
            </div>
        @endif

        <!-- Signatures Area -->
        <div class="signatures">
            <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Class Teacher</div>
            </div>
            <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Exam Controller</div>
            </div>
            <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Principal / Headmaster</div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 9px; color: #94a3b8;">
            Generated on {{ date('d M, Y h:i A') }} • System Powered by Porua.app
        </div>
    </div>

</body>
</html>
