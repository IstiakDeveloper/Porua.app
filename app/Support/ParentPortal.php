<?php

namespace App\Support;

use App\Models\BookIssue;
use App\Models\Event;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\TeacherSubject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ParentPortal
{
    public static function parent(User $user): StudentParent
    {
        return StudentParent::firstOrCreate(
            ['user_id' => $user->id],
            [
                'father_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
            ]
        );
    }

    public static function children(StudentParent $parent): Collection
    {
        $pivotIds = $parent->students()->pluck('students.id');

        return Student::query()
            ->where(function ($query) use ($parent, $pivotIds) {
                $query->where('parent_id', $parent->id);

                if ($parent->student_id) {
                    $query->orWhere('id', $parent->student_id);
                }

                if ($pivotIds->isNotEmpty()) {
                    $query->orWhereIn('id', $pivotIds);
                }
            })
            ->with([
                'schoolClass',
                'section.teacher.user',
                'batches' => function ($query) {
                    $query->where('batches.status', 'active')
                        ->wherePivot('status', 'active')
                        ->with(['course', 'teacher.user']);
                },
            ])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();
    }

    public static function childOption(Student $student): array
    {
        return [
            'id' => $student->id,
            'full_name' => $student->full_name,
            'photo' => $student->photo_url,
            'class_name' => $student->schoolClass->name ?? 'N/A',
            'section_name' => $student->section->name ?? 'N/A',
            'roll_number' => $student->roll_number,
        ];
    }

    public static function photoUrl(?string $photo): ?string
    {
        if (! $photo) {
            return null;
        }

        if (str_starts_with($photo, 'http') || str_starts_with($photo, '/')) {
            return $photo;
        }

        return asset('storage/'.$photo);
    }

    public static function todayClass(Student $student): ?array
    {
        $dayKey = now()->format('D');
        $dayFull = now()->format('l');

        $batch = $student->batches
            ->filter(function ($batch) use ($dayKey, $dayFull) {
                $days = is_array($batch->days_of_week) ? $batch->days_of_week : [];

                return in_array($dayKey, $days, true) || in_array($dayFull, $days, true);
            })
            ->sortBy(fn ($batch) => $batch->start_time ?? '99:99')
            ->first();

        if (! $batch) {
            return null;
        }

        return [
            'name' => $batch->course?->name ?: $batch->name,
            'batch_name' => $batch->name,
            'teacher_name' => $batch->teacher?->user?->name,
            'room_no' => $batch->room_no,
            'start_time' => self::clock($batch->start_time),
            'end_time' => self::clock($batch->end_time),
        ];
    }

    public static function issuedBooks(Student $student): array
    {
        return BookIssue::query()
            ->where('issueable_type', Student::class)
            ->where('issueable_id', $student->id)
            ->whereNull('return_date')
            ->where('status', '!=', 'returned')
            ->with('book')
            ->orderBy('due_date')
            ->get()
            ->map(function (BookIssue $issue) {
                $overdue = $issue->status === 'overdue'
                    || ($issue->due_date && $issue->due_date->copy()->endOfDay()->isPast());

                return [
                    'id' => $issue->id,
                    'title' => $issue->book->title ?? 'Book',
                    'due_date' => $issue->due_date?->format('d M Y'),
                    'is_overdue' => $overdue,
                    'fine_amount' => (float) $issue->fine_amount,
                ];
            })
            ->values()
            ->all();
    }

    public static function nextEvent(): ?array
    {
        $event = Event::query()
            ->whereDate('start_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->orderBy('start_time')
            ->first();

        return $event ? self::eventPayload($event) : null;
    }

    public static function eventsForMonth(int $year, int $month): array
    {
        return Event::query()
            ->whereYear('start_date', $year)
            ->whereMonth('start_date', $month)
            ->orderBy('start_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn (Event $event) => self::eventPayload($event))
            ->all();
    }

    public static function contacts(Collection $children, int $parentUserId): array
    {
        $office = self::officeUser();
        if ($office && $office->id === $parentUserId) {
            $office = null;
        }

        $officePayload = $office ? ['id' => $office->id, 'name' => $office->name] : null;

        return $children->map(function (Student $student) use ($officePayload, $parentUserId) {
            $teacher = self::classTeacherUser($student);
            if ($teacher && $teacher->id === $parentUserId) {
                $teacher = null;
            }

            return [
                'student_id' => $student->id,
                'student_name' => $student->full_name,
                'teacher' => $teacher ? ['id' => $teacher->id, 'name' => $teacher->name] : null,
                'office' => $officePayload,
            ];
        })->values()->all();
    }

    public static function allowedReceiverIds(array $contacts): array
    {
        return collect($contacts)
            ->flatMap(fn (array $contact) => array_filter([
                $contact['teacher']['id'] ?? null,
                $contact['office']['id'] ?? null,
            ]))
            ->unique()
            ->values()
            ->all();
    }

    public static function classTeacherUser(Student $student): ?User
    {
        $assignments = TeacherSubject::query()
            ->where('is_class_teacher', true)
            ->where('class_id', $student->class_id)
            ->where(function ($query) use ($student) {
                if ($student->section_id) {
                    $query->where('section_id', $student->section_id)->orWhereNull('section_id');
                } else {
                    $query->whereNull('section_id');
                }
            })
            ->with('teacher.user')
            ->get();

        $assignment = $assignments->firstWhere('section_id', $student->section_id) ?? $assignments->first();
        $user = $assignment?->teacher?->user;
        if ($user) {
            return $user;
        }

        $sectionUser = $student->section?->teacher?->user;
        if ($sectionUser) {
            return $sectionUser;
        }

        $batch = $student->relationLoaded('batches')
            ? $student->batches->first()
            : $student->batches()->wherePivot('status', 'active')->with('teacher.user')->first();

        return $batch?->teacher?->user;
    }

    public static function officeUser(): ?User
    {
        return User::query()
            ->active()
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Principal', 'Super Admin'])
                    ->orWhereIn('slug', ['admin', 'principal', 'super-admin', 'super_admin']);
            })
            ->orderBy('id')
            ->first();
    }

    private static function eventPayload(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'type' => $event->type,
            'is_holiday' => (bool) $event->is_holiday,
            'event_date' => $event->start_date?->format('Y-m-d'),
            'event_date_formatted' => $event->start_date?->format('D, d M Y'),
            'start_time' => self::clock($event->start_time),
            'end_time' => self::clock($event->end_time),
            'location' => $event->location,
        ];
    }

    private static function clock(mixed $time): ?string
    {
        if (! $time) {
            return null;
        }

        try {
            return Carbon::parse($time)->format('g:i A');
        } catch (\Throwable) {
            return is_string($time) ? $time : null;
        }
    }
}
