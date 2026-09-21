<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Attendance Report - {{ ($person ?? $teacher)['name'] }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 10px;
            line-height: 1.3;
            color: #0f172a;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }

        /* Compact Header */
        .report-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .report-header-left h1 {
            font-size: 16px;
            font-weight: 800;
            margin: 0 0 2px;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: -0.01em;
        }

        .report-header-left p {
            font-size: 9px;
            color: #475569;
            margin: 0;
        }

        .report-header-right {
            text-align: right;
        }

        .report-header-right h2 {
            font-size: 13px;
            font-weight: 700;
            margin: 0 0 2px;
            color: #0f172a;
            letter-spacing: 0.02em;
        }

        .report-header-right p {
            font-size: 9px;
            font-weight: 600;
            color: #475569;
            margin: 0;
        }

        /* Person Info Card */
        .person-bar {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 5px 8px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .person-bar strong {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
        }

        .person-meta {
            font-size: 9.5px;
            color: #475569;
        }

        /* Compact Summary Stats Grid */
        .stats-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .stats-grid td {
            border: 1px solid #cbd5e1;
            padding: 3px 4px;
            text-align: center;
            width: 11.11%;
        }

        .stats-grid .lbl {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            background: #f1f5f9;
            padding-bottom: 1px;
        }

        .stats-grid .val {
            font-size: 11px;
            font-weight: 800;
            padding-top: 1px;
        }

        /* Continuous Fluid Table */
        table.data {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto !important;
            break-inside: auto !important;
        }

        table.data thead {
            display: table-header-group !important;
        }

        table.data tfoot {
            display: table-footer-group !important;
        }

        table.data tbody {
            page-break-inside: auto !important;
            break-inside: auto !important;
        }

        table.data tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: auto !important;
            break-after: auto !important;
        }

        table.data th {
            background: #f1f5f9 !important;
            color: #334155;
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
            text-align: left;
        }

        table.data td {
            border: 1px solid #cbd5e1;
            padding: 3.5px 6px;
            font-size: 9px;
            color: #1e293b;
            vertical-align: middle;
        }

        /* Status colors */
        .status-pill {
            display: inline-block;
            font-weight: 700;
            font-size: 8.5px;
            text-transform: uppercase;
        }
        .present { color: #15803d; }
        .absent { color: #b91c1c; }
        .late { color: #b45309; }
        .early_leave { color: #c2410c; }
        .half_day { color: #4338ca; }
        .leave { color: #0369a1; }
        .holiday { color: #7e22ce; }
        .weekend { color: #475569; }

        .report-footer {
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
    </style>
</head>
<body>
    @php
        $person = $person ?? $teacher;
    @endphp

    <div class="report-header">
        <div class="report-header-left" style="display: flex; align-items: center; gap: 8px;">
            <img src="/logo.png" alt="Logo" style="width: 32px; height: 32px; object-fit: contain;">
            <div>
                <h1>{{ $schoolName }}</h1>
                @if(!empty($schoolAddress))<p>{{ $schoolAddress }}</p>@endif
            </div>
        </div>
        <div class="report-header-right">
            <h2>{{ $reportTitle ?? 'TEACHER ATTENDANCE REPORT' }}</h2>
            <p>{{ $fromDate }} to {{ $toDate }}</p>
        </div>
    </div>

    <div class="person-bar">
        <div>
            <strong>{{ $person['name'] }}</strong>
            <span class="person-meta">
                · ID: {{ $person['employee_id'] ?? '—' }}
                @if(!empty($person['roll_number'])) · Roll: {{ $person['roll_number'] }} @endif
                @if(!empty($person['designation'])) · {{ $person['designation'] }} @endif
                @if(!empty($person['department']) && empty($person['class_name'])) · {{ $person['department'] }} @endif
                @if(!empty($person['class_name'])) · Class: {{ $person['class_name'] }} - {{ $person['section_name'] ?? '' }} @endif
            </span>
        </div>
        <div class="person-meta">
            Total Days: <strong>{{ count($days) }}</strong>
        </div>
    </div>

    <table class="stats-grid">
        <tr>
            <td class="lbl">Present</td>
            <td class="lbl">Absent</td>
            <td class="lbl">Late</td>
            <td class="lbl">Early</td>
            <td class="lbl">Half Day</td>
            <td class="lbl">Leave</td>
            <td class="lbl">Holiday</td>
            <td class="lbl">Weekend</td>
            <td class="lbl">Attendance %</td>
        </tr>
        <tr>
            <td class="val present">{{ $stats['present'] }}</td>
            <td class="val absent">{{ $stats['absent'] }}</td>
            <td class="val late">{{ $stats['late'] }}</td>
            <td class="val early_leave">{{ $stats['early_leave'] }}</td>
            <td class="val half_day">{{ $stats['half_day'] ?? 0 }}</td>
            <td class="val leave">{{ $stats['leave'] }}</td>
            <td class="val holiday">{{ $stats['holiday'] }}</td>
            <td class="val weekend">{{ $stats['weekend'] }}</td>
            <td class="val" style="color: #0f172a;">{{ $stats['percentage'] ?? 0 }}%</td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 75px;">Date</th>
                <th style="width: 70px;">Day</th>
                <th style="width: 75px;">Status</th>
                <th style="width: 65px;">In</th>
                <th style="width: 65px;">Out</th>
                <th style="width: 55px;">Hours</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($days as $row)
                <tr>
                    <td style="font-family: monospace; font-weight: 600;">{{ $row['date'] }}</td>
                    <td>{{ $row['day'] }}</td>
                    <td class="status-pill {{ $row['status'] }}">
                        {{ $row['status'] ? str_replace('_', ' ', $row['status']) : '—' }}
                    </td>
                    <td style="font-family: monospace;">{{ $row['in_time_formatted'] ?? '—' }}</td>
                    <td style="font-family: monospace;">{{ $row['out_time_formatted'] ?? '—' }}</td>
                    <td style="font-family: monospace;">{{ $row['hours'] ?? '—' }}</td>
                    <td>{{ $row['auto_remarks'] ?? $row['remarks'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="report-footer">
        <span>{{ \App\Models\Setting::get('institute_name', \App\Models\Setting::get('school_name', config('app.name', 'Institute Management System'))) }} · Official Attendance Record</span>
        <span>Generated: {{ now()->format('d M Y, h:i A') }}</span>
    </div>

    <script>
        window.addEventListener('load', function () {
            setTimeout(function() {
                window.print();
            }, 300);
        });
    </script>
</body>
</html>
