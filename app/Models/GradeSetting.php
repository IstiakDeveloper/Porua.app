<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradeSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'grade_name',
        'min_marks',
        'max_marks',
        'grade_point',
        'remarks',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'min_marks' => 'decimal:2',
            'max_marks' => 'decimal:2',
            'grade_point' => 'decimal:2',
            'order' => 'integer',
        ];
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public static function getGradeForMarks($marks, $academicYearId = null)
    {
        $query = self::query();
        
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }
        
        return $query->where('min_marks', '<=', $marks)
                     ->where('max_marks', '>=', $marks)
                     ->first();
    }
}
