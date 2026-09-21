<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabulation Sheet - {{ $exam->name }} ({{ $schoolClass->name }})</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10px;
            color: #0f172a;
            background: #f8fafc;
            padding: 12px;
        }
        .container {
            width: 100%;
            background: #ffffff;
            padding: 14px;
            border: 1px solid #cbd5e1;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header h1 {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
        }
        .header h2 {
            font-size: 13px;
            font-weight: 700;
            color: #2563eb;
            margin-top: 2px;
        }
        .header p {
            font-size: 10px;
            color: #475569;
        }
        .meta-bar {
            display: flex;
            justify-content: space-between;
            background: #f1f5f9;
            padding: 6px 12px;
            border: 1px solid #cbd5e1;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 10px;
        }
        table.tabulation-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }
        table.tabulation-table th, table.tabulation-table td {
            border: 1px solid #334155;
            padding: 4px 3px;
            text-align: center;
            white-space: nowrap;
        }
        table.tabulation-table th {
            background: #e2e8f0;
            color: #0f172a;
            font-weight: 700;
        }
        .sub-header th {
            font-size: 8px;
            background: #f8fafc;
            font-weight: 600;
        }
        .name-cell {
            text-align: left !important;
            padding-left: 6px !important;
            font-weight: 600;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .bold { font-weight: 700; }
        .fail-text { color: #dc2626; font-weight: 700; }
        .pass-text { color: #16a34a; font-weight: 700; }
        .print-btn {
            background: #2563eb;
            color: white;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 600;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 12px;
        }
        .footer-stats {
            margin-top: 14px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 600;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 8px 14px;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 8px;
        }
        .sig-block {
            text-align: center;
            width: 160px;
        }
        .sig-line {
            border-top: 1px dashed #334155;
            margin-bottom: 4px;
        }
        .sig-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
        }
        @media print {
            body { background: #ffffff; padding: 0; }
            .print-btn { display: none; }
            .container { border: none; padding: 0; }
            @page { size: A4 landscape; margin: 8mm; }
        }
    </style>
</head>
<body>

    <button class="print-btn" onclick="window.print()">🖨️ Print Tabulation Sheet (A4 Landscape)</button>

    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $schoolName }}</h1>
            @if(!empty($schoolAddress))
                <p>{{ $schoolAddress }}</p>
            @endif
            <h2>TABULATION SHEET / BROADSHEET</h2>
            <p>{{ $exam->name }} • Academic Year: {{ $exam->academicYear->name ?? date('Y') }}</p>
        </div>

        <div class="meta-bar">
            <span><strong>Class:</strong> {{ $schoolClass->name }}</span>
            <span><strong>Section:</strong> {{ $section_id ? ($schoolClass->sections->firstWhere('id', $section_id)->name ?? 'Selected') : 'All Sections' }}</span>
            <span><strong>Date Generated:</strong> {{ date('d-m-Y') }}</span>
            <span><strong>Total Examinees:</strong> {{ count($rows) }}</span>
        </div>

        @php
            $passedCount = 0;
            $failedCount = 0;
        @endphp

        <!-- Main Tabulation Matrix -->
        <table class="tabulation-table">
            <thead>
                <tr>
                    <th rowspan="2" style="width: 30px;">Roll</th>
                    <th rowspan="2" style="width: 130px;">Student Name</th>
                    <th rowspan="2" style="width: 45px;">Sec</th>
                    @foreach($subjects as $sub)
                        <th colspan="3">{{ $sub->name }}</th>
                    @endforeach
                    <th rowspan="2" style="width: 45px;">Total Marks</th>
                    <th rowspan="2" style="width: 45px;">Total Obtd</th>
                    <th rowspan="2" style="width: 40px;">GPA</th>
                    <th rowspan="2" style="width: 35px;">Grd</th>
                    <th rowspan="2" style="width: 35px;">Rank</th>
                    <th rowspan="2" style="width: 45px;">Status</th>
                </tr>
                <tr class="sub-header">
                    @foreach($subjects as $sub)
                        <th style="width: 28px;">Mark</th>
                        <th style="width: 24px;">GP</th>
                        <th style="width: 20px;">Grd</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @forelse($rows as $row)
                    @php
                        if ($row['result_status'] === 'pass') $passedCount++;
                        elseif ($row['result_status'] === 'fail') $failedCount++;
                    @endphp
                    <tr>
                        <td class="bold">{{ $row['roll_number'] }}</td>
                        <td class="name-cell">{{ $row['student_name'] }}</td>
                        <td>{{ $row['section_name'] }}</td>
                        @foreach($subjects as $sub)
                            @php
                                $sm = $row['subject_marks'][$sub->id] ?? null;
                            @endphp
                            <td>
                                @if($sm && $sm['is_absent'])
                                    <span class="fail-text">AB</span>
                                @elseif($sm && $sm['obtained_marks'] !== null)
                                    {{ $sm['obtained_marks'] }}
                                @else
                                    -
                                @endif
                            </td>
                            <td>{{ $sm ? (is_numeric($sm['grade_point']) ? number_format((float)$sm['grade_point'], 2) : $sm['grade_point']) : '-' }}</td>
                            <td class="{{ ($sm && $sm['grade'] === 'F') ? 'fail-text' : '' }}">
                                {{ $sm ? $sm['grade'] : '-' }}
                            </td>
                        @endforeach
                        <td>{{ $row['total_marks'] ?? '-' }}</td>
                        <td class="bold">{{ $row['obtained_marks'] ?? '-' }}</td>
                        <td class="bold {{ $row['result_status'] === 'pass' ? 'pass-text' : 'fail-text' }}">
                            {{ $row['gpa'] !== null ? number_format((float)$row['gpa'], 2) : '-' }}
                        </td>
                        <td class="bold {{ $row['grade'] === 'F' ? 'fail-text' : 'pass-text' }}">
                            {{ $row['grade'] ?? '-' }}
                        </td>
                        <td class="bold">{{ $row['class_position'] ? '#' . $row['class_position'] : '-' }}</td>
                        <td>
                            @if($row['result_status'] === 'pass')
                                <span class="pass-text">PASS</span>
                            @elseif($row['result_status'] === 'fail')
                                <span class="fail-text">FAIL</span>
                            @elseif($row['result_status'] === 'absent')
                                <span class="fail-text">ABSENT</span>
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ 9 + (count($subjects) * 3) }}" style="padding: 18px; color: #64748b;">
                            No results found for this exam and class. Please generate results first.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Summary Statistics -->
        <div class="footer-stats">
            <span>Total Students: <strong>{{ count($rows) }}</strong></span>
            <span>Passed: <strong style="color: #16a34a;">{{ $passedCount }}</strong></span>
            <span>Failed: <strong style="color: #dc2626;">{{ $failedCount }}</strong></span>
            <span>Pass Percentage: <strong>{{ count($rows) > 0 ? round(($passedCount / count($rows)) * 100, 2) : 0 }}%</strong></span>
        </div>

        <!-- Signature Blocks -->
        <div class="signatures">
            <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Tabulator</div>
            </div>
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
    </div>

</body>
</html>
