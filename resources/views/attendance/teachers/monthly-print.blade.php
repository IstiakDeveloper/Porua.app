<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Teacher Attendance - {{ $month }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; margin: 12px; color: #111; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #111; padding-bottom: 8px; }
        .header h1 { margin: 0 0 2px; font-size: 18px; }
        .header h2 { margin: 0 0 2px; font-size: 14px; }
        .header p { margin: 0; color: #555; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 2px; text-align: center; }
        th { background: #f3f4f6; font-size: 8px; }
        .name { text-align: left; min-width: 120px; }
        .cell { font-weight: 700; font-size: 8px; }
        .legend { margin-top: 10px; text-align: center; font-size: 9px; }
        .footer { margin-top: 10px; text-align: center; color: #666; font-size: 8px; }
        .p { background: #dcfce7; color: #166534; }
        .a { background: #fee2e2; color: #991b1b; }
        .l { background: #fef3c7; color: #854d0e; }
        .el { background: #ffedd5; color: #9a3412; }
        .hd { background: #dbeafe; color: #1e40af; }
        .lv { background: #ffedd5; color: #9a3412; }
        .h { background: #f3e8ff; color: #6b21a8; }
        .w { background: #cffafe; color: #155e75; }
        @media print { @page { size: A4 landscape; margin: 8mm; } }
    </style>
</head>
<body>
    @php
        $rows = $teachers['data'] ?? $teachers;
        $monthLabel = \Carbon\Carbon::parse($month.'-01')->format('F Y');
        $codes = ['present'=>'P','absent'=>'A','late'=>'L','early_leave'=>'EL','half_day'=>'HD','leave'=>'LV','holiday'=>'H','weekend'=>'W'];
        $classes = ['present'=>'p','absent'=>'a','late'=>'l','early_leave'=>'el','half_day'=>'hd','leave'=>'lv','holiday'=>'h','weekend'=>'w'];
    @endphp

    <div class="header">
        <h1>{{ $schoolName }}</h1>
        @if(!empty($schoolAddress))<p>{{ $schoolAddress }}</p>@endif
        <h2>{{ ($reportType ?? 'teacher') === 'student' ? 'STUDENT' : 'TEACHER' }} ATTENDANCE — MONTHLY VIEW</h2>
        <p>{{ $monthLabel }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="name">{{ ($reportType ?? 'teacher') === 'student' ? 'Student' : 'Teacher' }}</th>
                @for($day = 1; $day <= $daysInMonth; $day++)
                    <th>{{ $day }}</th>
                @endfor
                <th>P</th><th>A</th><th>L</th><th>EL</th><th>LV</th><th>H</th><th>W</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $teacher)
                <tr>
                    <td class="name">
                        <strong>{{ $teacher['name'] }}</strong><br>
                        <span>{{ $teacher['employee_id'] }}</span>
                    </td>
                    @for($day = 1; $day <= $daysInMonth; $day++)
                        @php $cell = $teacher['attendance'][$day] ?? null; $status = $cell['status'] ?? null; @endphp
                        <td class="cell {{ $status ? ($classes[$status] ?? '') : '' }}">
                            {{ $status ? ($codes[$status] ?? '-') : '-' }}
                        </td>
                    @endfor
                    <td>{{ $teacher['summary']['present'] ?? 0 }}</td>
                    <td>{{ $teacher['summary']['absent'] ?? 0 }}</td>
                    <td>{{ $teacher['summary']['late'] ?? 0 }}</td>
                    <td>{{ $teacher['summary']['early_leave'] ?? 0 }}</td>
                    <td>{{ $teacher['summary']['leave'] ?? 0 }}</td>
                    <td>{{ $teacher['summary']['holiday'] ?? 0 }}</td>
                    <td>{{ $teacher['summary']['weekend'] ?? 0 }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="legend">
        P=Present · A=Absent · L=Late · EL=Early leave · HD=Half day · LV=Leave · H=Holiday · W=Weekend
    </div>
    <div class="footer">Printed on {{ now()->format('d M Y, h:i A') }}</div>

    <script>window.addEventListener('load', function () { window.print(); });</script>
</body>
</html>
