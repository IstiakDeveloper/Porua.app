<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Marksheet - {{ $student->full_name }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 16px; background: #e2e8f0; color: #0f172a; font-family: "Segoe UI", Tahoma, sans-serif; font-size: 11px; }
        .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border: 2px solid #0f172a; padding: 16px 18px 14px; }
        .sheet-inner { border: 1px solid #94a3b8; padding: 14px 14px 10px; }
        .top { display: flex; gap: 12px; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
        .logo, .photo { width: 64px; height: 64px; object-fit: cover; border: 1px solid #cbd5e1; background: #f8fafc; }
        .photo { border-radius: 2px; }
        .logo-fallback, .photo-fallback { width: 64px; height: 64px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #64748b; text-align: center; }
        .school { flex: 1; text-align: center; }
        .school h1 { margin: 0; font-size: 22px; letter-spacing: 0.4px; text-transform: uppercase; }
        .school p { margin: 2px 0 0; color: #334155; font-size: 11px; }
        .doc-title { margin: 8px 0 0; text-align: center; }
        .doc-title span { display: inline-block; background: #0f172a; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; padding: 4px 14px; }
        .exam-line { text-align: center; margin-top: 6px; font-weight: 700; font-size: 12px; }
        .meta { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .meta td { padding: 2px 6px; vertical-align: top; width: 25%; }
        .k { color: #64748b; font-size: 10px; display: block; }
        .v { font-weight: 700; }
        table.marks { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.marks th, table.marks td { border: 1px solid #334155; padding: 4px 3px; text-align: center; }
        table.marks th { background: #f1f5f9; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; }
        table.marks td.left { text-align: left; padding-left: 6px; font-weight: 600; }
        table.marks tr.total td { background: #f8fafc; font-weight: 800; }
        .fail { color: #b91c1c; font-weight: 800; }
        .pass { color: #166534; font-weight: 800; }
        .summary { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-top: 10px; }
        .card { border: 1px solid #cbd5e1; text-align: center; padding: 6px 4px; }
        .card .k { font-size: 9px; text-transform: uppercase; }
        .card .v { font-size: 14px; }
        .note, .failed { margin-top: 8px; padding: 6px 8px; background: #f8fafc; border-left: 3px solid #0f172a; }
        .failed { border-left-color: #b91c1c; }
        table.scale { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.scale th, table.scale td { border: 1px solid #334155; padding: 3px 4px; text-align: center; font-size: 10px; }
        table.scale th { background: #0f172a; color: #fff; font-size: 9px; }
        .rule { margin-top: 6px; font-size: 10px; color: #334155; }
        .signs { display: flex; justify-content: space-between; margin-top: 28px; }
        .sign { width: 22%; text-align: center; font-size: 10px; font-weight: 700; }
        .sign .line { border-top: 1px solid #0f172a; margin-bottom: 4px; }
        .sign .who { font-weight: 500; color: #475569; min-height: 14px; }
        .foot { margin-top: 10px; text-align: center; font-size: 9px; color: #64748b; }
        .actions { text-align: center; margin-bottom: 10px; }
        .actions button { background: #0f172a; color: #fff; border: 0; border-radius: 6px; padding: 8px 16px; font-weight: 700; cursor: pointer; }
        @media print {
            body { background: #fff; padding: 0; }
            .actions { display: none; }
            .sheet { border: none; max-width: none; }
            @page { size: A4 portrait; margin: 8mm; }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button type="button" onclick="window.print()">Print / Save PDF</button>
    </div>

    @php
        $father = $student->father_name ?: ($student->father_name_en ?: '—');
        $mother = $student->mother_name ?: ($student->mother_name_en ?: '—');
        $dob = $student->date_of_birth ? $student->date_of_birth->format('d M Y') : '—';
        $session = $result->exam->academicYear->name ?? '—';
        $issued = $result->exam->result_publish_date
            ? $result->exam->result_publish_date->format('d M Y')
            : now()->format('d M Y');
        $failed = $marks->filter(fn ($mark) => $mark->is_absent || $mark->grade === 'F');
    @endphp

    <article class="sheet">
        <div class="sheet-inner">
            <header class="top">
                @if(!empty($schoolLogo))
                    <img class="logo" src="{{ $schoolLogo }}" alt="School logo">
                @else
                    <div class="logo-fallback">LOGO</div>
                @endif
                <div class="school">
                    <h1>{{ $schoolName }}</h1>
                    @if($schoolAddress)<p>{{ $schoolAddress }}</p>@endif
                    <p>
                        @if($establishedYear) Estd. {{ $establishedYear }} @endif
                        @if($schoolCode) · Code {{ $schoolCode }} @endif
                        @if($schoolPhone) · {{ $schoolPhone }} @endif
                        @if($schoolEmail) · {{ $schoolEmail }} @endif
                    </p>
                    @if($schoolWebsite)<p>{{ $schoolWebsite }}</p>@endif
                </div>
                @if($student->photo_url)
                    <img class="photo" src="{{ $student->photo_url }}" alt="Student photo">
                @else
                    <div class="photo-fallback">PHOTO</div>
                @endif
            </header>

            <div class="doc-title"><span>ACADEMIC TRANSCRIPT</span></div>
            <div class="exam-line">{{ $result->exam->name ?? 'Examination' }} · Session {{ $session }}</div>

            <table class="meta">
                <tr>
                    <td><span class="k">Student</span><span class="v">{{ $student->full_name }}</span></td>
                    <td><span class="k">Father</span><span class="v">{{ $father }}</span></td>
                    <td><span class="k">Mother</span><span class="v">{{ $mother }}</span></td>
                    <td><span class="k">Date of birth</span><span class="v">{{ $dob }}</span></td>
                </tr>
                <tr>
                    <td><span class="k">Class / Section</span><span class="v">{{ $student->schoolClass->name ?? '—' }} / {{ $student->section->name ?? '—' }}</span></td>
                    <td><span class="k">Roll</span><span class="v">{{ $student->roll_number ?: '—' }}</span></td>
                    <td><span class="k">Admission no.</span><span class="v">{{ $student->admission_number ?: '—' }}</span></td>
                    <td><span class="k">Gender</span><span class="v">{{ $student->gender ? ucfirst($student->gender) : '—' }}</span></td>
                </tr>
                <tr>
                    <td><span class="k">Attendance</span><span class="v">{{ $attendance['percent'] !== null ? $attendance['attended'].'/'.$attendance['days'].' ('.$attendance['percent'].'%)' : 'Not recorded' }}</span></td>
                    <td><span class="k">Result date</span><span class="v">{{ $issued }}</span></td>
                    <td><span class="k">Exam</span><span class="v">{{ $result->exam->kindLabel() }}</span></td>
                    <td><span class="k">Status</span><span class="v {{ $result->result_status === 'pass' ? 'pass' : 'fail' }}">{{ strtoupper($result->result_status ?? '—') }}</span></td>
                </tr>
            </table>

            <table class="marks">
                <thead>
                    <tr>
                        <th>SL</th>
                        <th>Code</th>
                        <th style="text-align:left; padding-left:6px;">Subject</th>
                        <th>Full</th>
                        <th>Pass</th>
                        <th>Theory</th>
                        <th>Practical</th>
                        <th>Obtained</th>
                        <th>Highest</th>
                        <th>Grade</th>
                        <th>GP</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($marks as $index => $mark)
                        @php
                            $full = (float) ($mark->total_marks > 0 ? $mark->total_marks : ($mark->subject->total_marks ?? 100));
                            $pass = $mark->subject->pass_marks ?? round($full * 0.33);
                            $absent = (bool) $mark->is_absent;
                            $grade = $absent ? 'F' : ($mark->grade ?: '—');
                            $failedRow = $absent || $grade === 'F';
                        @endphp
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>{{ $mark->subject->code ?? '—' }}</td>
                            <td class="left">{{ $mark->subject->name ?? 'Subject' }}</td>
                            <td>{{ rtrim(rtrim(number_format($full, 2), '0'), '.') }}</td>
                            <td>{{ $pass }}</td>
                            <td>{{ $absent ? 'AB' : ($mark->theory_marks === null ? '—' : $mark->theory_marks) }}</td>
                            <td>{{ $absent ? 'AB' : ($mark->practical_marks === null ? '—' : $mark->practical_marks) }}</td>
                            <td><strong>{{ $absent ? '0' : $mark->obtained_marks }}</strong></td>
                            <td>{{ $highest[$mark->subject_id] ?? '—' }}</td>
                            <td class="{{ $failedRow ? 'fail' : 'pass' }}">{{ $grade }}</td>
                            <td>{{ $absent ? '0.00' : number_format((float) ($mark->grade_point ?? 0), 2) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="11">No subject marks recorded.</td></tr>
                    @endforelse
                    <tr class="total">
                        <td colspan="3" style="text-align:left; padding-left:6px;">TOTAL</td>
                        <td>{{ rtrim(rtrim(number_format((float) $result->total_marks, 2), '0'), '.') }}</td>
                        <td>—</td>
                        <td colspan="2">—</td>
                        <td>{{ rtrim(rtrim(number_format((float) $result->obtained_marks, 2), '0'), '.') }}</td>
                        <td>—</td>
                        <td class="{{ $result->grade === 'F' ? 'fail' : 'pass' }}">{{ $result->grade }}</td>
                        <td>{{ number_format((float) $result->gpa, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="summary">
                <div class="card"><span class="k">Obtained</span><div class="v">{{ rtrim(rtrim(number_format((float) $result->obtained_marks, 2), '0'), '.') }}</div></div>
                <div class="card"><span class="k">Percentage</span><div class="v">{{ number_format((float) $result->percentage, 2) }}%</div></div>
                <div class="card"><span class="k">GPA / 5.00</span><div class="v {{ $result->result_status === 'pass' ? 'pass' : 'fail' }}">{{ number_format((float) $result->gpa, 2) }}</div></div>
                <div class="card"><span class="k">Letter grade</span><div class="v">{{ $result->grade ?: '—' }}</div></div>
                <div class="card"><span class="k">Class merit</span><div class="v">{{ $result->class_position ? $result->class_position : '—' }}</div></div>
                <div class="card"><span class="k">Section merit</span><div class="v">{{ $result->section_position ? $result->section_position : '—' }}</div></div>
            </div>

            @if($failed->isNotEmpty())
                <div class="failed">
                    <strong>Not passed:</strong>
                    {{ $failed->map(fn ($mark) => ($mark->subject->name ?? 'Subject').($mark->is_absent ? ' (Absent)' : ''))->implode(', ') }}
                </div>
            @endif

            @if($result->remarks)
                <div class="note"><strong>Remarks:</strong> {{ $result->remarks }}</div>
            @endif

            <table class="scale">
                <thead>
                    <tr>
                        <th>Marks %</th>
                        <th>Letter</th>
                        <th>Grade point</th>
                        <th>Meaning</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($gradeSettings as $grade)
                        <tr>
                            <td>{{ rtrim(rtrim(number_format((float) $grade->min_marks, 2), '0'), '.') }} – {{ rtrim(rtrim(number_format((float) $grade->max_marks, 2), '0'), '.') }}</td>
                            <td><strong>{{ $grade->grade_name }}</strong></td>
                            <td>{{ number_format((float) $grade->grade_point, 2) }}</td>
                            <td>{{ $grade->remarks ?: '—' }}</td>
                        </tr>
                    @empty
                        <tr><td>80 – 100</td><td><strong>A+</strong></td><td>5.00</td><td>Outstanding</td></tr>
                        <tr><td>70 – 79.99</td><td><strong>A</strong></td><td>4.00</td><td>Excellent</td></tr>
                        <tr><td>60 – 69.99</td><td><strong>A-</strong></td><td>3.50</td><td>Very Good</td></tr>
                        <tr><td>50 – 59.99</td><td><strong>B</strong></td><td>3.00</td><td>Good</td></tr>
                        <tr><td>40 – 49.99</td><td><strong>C</strong></td><td>2.00</td><td>Satisfactory</td></tr>
                        <tr><td>33 – 39.99</td><td><strong>D</strong></td><td>1.00</td><td>Pass</td></tr>
                        <tr><td>0 – 32.99</td><td><strong>F</strong></td><td>0.00</td><td>Fail</td></tr>
                    @endforelse
                </tbody>
            </table>
            <p class="rule">
                Subject grade comes from obtained marks as a percentage of full marks. GPA is the average of subject grade points.
                Below the subject pass mark, or absent, is F. One F makes the overall result Fail and GPA 0.00.
                @if($result->exam->isAnnual() && $result->exam->min_attendance_percent)
                    Annual pass also needs {{ $result->exam->min_attendance_percent }}% attendance.
                @endif
            </p>

            <div class="signs">
                <div class="sign">
                    <div class="who">{{ $classTeacher ?: '' }}</div>
                    <div class="line"></div>
                    Class teacher
                </div>
                <div class="sign">
                    <div class="who">&nbsp;</div>
                    <div class="line"></div>
                    Prepared by
                </div>
                <div class="sign">
                    <div class="who">&nbsp;</div>
                    <div class="line"></div>
                    Controller of exams
                </div>
                <div class="sign">
                    <div class="who">&nbsp;</div>
                    <div class="line"></div>
                    Principal
                </div>
            </div>

            <p class="foot">
                Issued {{ $issued }} · Computer-generated transcript from Porua · Valid with the school seal and principal’s signature
            </p>
        </div>
    </article>
</body>
</html>
