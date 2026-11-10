<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $schoolName }} - Staff Leave Report ({{ $year }})</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; padding: 16px; color: #1e293b; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
        .header h1 { margin: 0 0 3px; font-size: 18px; color: #0f172a; font-weight: bold; }
        .header h2 { margin: 0 0 4px; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        .header p { margin: 2px 0; color: #64748b; font-size: 10px; }
        .meta-bar { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 10px; color: #475569; background: #f8fafc; padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 4px; }
        .stats-grid { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .stats-grid td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; background: #f8fafc; font-size: 10px; }
        .stats-grid td strong { display: block; font-size: 13px; color: #0f172a; margin-top: 2px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
        table.data-table th { background: #f1f5f9; color: #1e293b; font-size: 10px; font-weight: bold; text-align: left; }
        table.data-table td { font-size: 10.5px; }
        table.data-table tr:nth-child(even) { background: #fafafa; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
        .total-row { background: #f1f5f9 !important; font-weight: bold; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
        .sig-block { text-align: center; width: 150px; border-top: 1px solid #94a3b8; padding-top: 4px; }
        @media print {
            @page { size: A4 landscape; margin: 10mm; }
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $schoolName }}</h1>
        @if(!empty($schoolAddress))<p>{{ $schoolAddress }}</p>@endif
        <h2>STAFF LEAVE CONSUMPTION & SUMMARY REPORT</h2>
        <p>Period: {{ $monthName }} {{ $year }} &bull; Department: {{ $department }} &bull; Generated: {{ now()->format('d M, Y h:i A') }}</p>
    </div>

    <table class="stats-grid">
        <tr>
            <td>Total Approved Requests<br><strong>{{ $totalApprovedRequests }}</strong></td>
            <td>Total Leave Days Taken<br><strong>{{ $totalLeaveDays }} days</strong></td>
            <td>Staff on Leave<br><strong>{{ count($rows) }}</strong></td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 40px;" class="text-center">#</th>
                <th style="width: 90px;">Employee ID</th>
                <th>Teacher Name</th>
                <th>Department</th>
                <th>Designation</th>
                @foreach($leaveTypes as $type)
                    <th class="text-center" style="width: 60px;">{{ $type->code }}<br><span style="font-size: 8px; font-weight: normal; color: #64748b;">({{ $type->days_per_year }}d)</span></th>
                @endforeach
                <th class="text-center" style="width: 80px;">Total (Days)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $index => $row)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $row['teacher']->employee_id ?? '—' }}</strong></td>
                    <td>{{ $row['teacher']->full_name }}</td>
                    <td>{{ $row['teacher']->department ?? 'General' }}</td>
                    <td>{{ $row['teacher']->designation ?? 'Teacher' }}</td>
                    @foreach($leaveTypes as $type)
                        <td class="text-center">
                            {{ $row['by_type'][$type->code] > 0 ? $row['by_type'][$type->code] : '—' }}
                        </td>
                    @endforeach
                    <td class="text-center" style="font-weight: bold; color: #0284c7;">
                        {{ $row['total'] > 0 ? $row['total'] : '0' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ 6 + count($leaveTypes) }}" class="text-center" style="padding: 16px; color: #94a3b8;">
                        No staff leave records found for the selected period.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <div>System Generated by Porua &bull; Page 1 of 1</div>
        <div class="sig-block">Prepared By</div>
        <div class="sig-block">Principal / Authority</div>
    </div>

    <script>
        window.addEventListener('load', () => {
            if (window.location.search.includes('print=true')) {
                window.print();
            }
        });
    </script>
</body>
</html>

