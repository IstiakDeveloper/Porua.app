<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $reportTitle ?? 'Teacher Attendance Sheet' }}</title>
    <style>
        * { box-sizing: border-box; }
        html, body { height: auto; margin: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; padding: 12px; color: #111; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 10px; }
        .header h1 { margin: 0 0 2px; font-size: 18px; }
        .header h2 { margin: 0 0 2px; font-size: 14px; }
        .header p { margin: 2px 0; color: #555; }
        .overall { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .overall td { border: 1px solid #ccc; padding: 5px; text-align: center; }
        .date-block { margin: 0 0 10px; page-break-inside: auto; break-inside: auto; }
        .date-title { background: #e5e7eb; border: 1px solid #9ca3af; padding: 5px 8px; font-weight: 700; overflow: hidden; page-break-after: avoid; break-after: avoid; }
        .date-title span:last-child { float: right; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data th, table.data td { border: 1px solid #333; padding: 3px 5px; }
        table.data th { background: #f3f4f6; font-size: 9px; }
        table.data thead { display: table-header-group; }
        table.data tr { page-break-inside: avoid; break-inside: avoid; }
        .present { color: #166534; } .absent { color: #991b1b; } .late { color: #854d0e; }
        .leave { color: #9a3412; } .holiday { color: #6b21a8; } .weekend { color: #155e75; }
        .footer { margin-top: 10px; text-align: center; color: #666; font-size: 8px; }
        @media print {
            @page { size: A4 landscape; margin: 8mm; }
            html, body { height: auto; }
            .date-block { page-break-inside: auto; break-inside: auto; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $schoolName }}</h1>
        @if(!empty($schoolAddress))<p>{{ $schoolAddress }}</p>@endif
        <h2>{{ $reportTitle ?? 'TEACHER ATTENDANCE SHEET' }}</h2>
        <p>{{ $startDate }} to {{ $endDate }}@if(!empty($department)) · {{ $department }}@endif · {{ $teacherCount }} {{ ($reportType ?? 'teacher') === 'student' ? 'students' : 'teachers' }}</p>
    </div>

    <table class="overall">
        <tr>
            <td>Present<br><strong>{{ $stats['present'] }}</strong></td>
            <td>Absent<br><strong>{{ $stats['absent'] }}</strong></td>
            <td>Late<br><strong>{{ $stats['late'] }}</strong></td>
            <td>Early leave<br><strong>{{ $stats['early_leave'] }}</strong></td>
            <td>Leave<br><strong>{{ $stats['leave'] }}</strong></td>
            <td>Holiday<br><strong>{{ $stats['holiday'] }}</strong></td>
            <td>Weekend<br><strong>{{ $stats['weekend'] }}</strong></td>
        </tr>
    </table>

    @foreach($days as $day)
        <div class="date-block">
            <div class="date-title">
                <span>{{ \Carbon\Carbon::parse($day['date'])->format('l, d M Y') }}</span>
                <span>
                    P {{ $day['stats']['present'] }}
                    · A {{ $day['stats']['absent'] }}
                    · L {{ $day['stats']['late'] }}
                    · LV {{ $day['stats']['leave'] }}
                </span>
            </div>
            <table class="data">
                <thead>
                    <tr>
                        <th>{{ $entityLabel ?? 'Teacher' }}</th>
                        <th>ID</th>
                        <th>{{ $groupHeading ?? 'Dept' }}</th>
                        <th>Status</th>
                        <th>In</th>
                        <th>Out</th>
                        <th>Hours</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($day['rows'] as $row)
                        <tr>
                            @php $person = $row['person'] ?? $row['teacher']; @endphp
                            <td>{{ $person['name'] }}</td>
                            <td>{{ $person['employee_id'] ?? '—' }}</td>
                            <td>{{ $person['department'] ?? $person['class_name'] ?? '—' }}</td>
                            <td class="{{ $row['status'] }}">{{ $row['status'] ? str_replace('_', ' ', $row['status']) : '—' }}</td>
                            <td>{{ $row['in_time_formatted'] ?? '—' }}</td>
                            <td>{{ $row['out_time_formatted'] ?? '—' }}</td>
                            <td>{{ $row['hours'] ?? '—' }}</td>
                            <td>{{ $row['auto_remarks'] ?? $row['remarks'] ?? '—' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach

    <div class="footer">Printed on {{ now()->format('d M Y, h:i A') }}</div>
    <script>window.addEventListener('load', function () { window.print(); });</script>
</body>
</html>
