<?php

namespace App\Console\Commands;

use App\Models\Mark;
use Illuminate\Console\Command;

class RecalculateGrades extends Command
{
    protected $signature = 'marks:recalculate-grades';
    protected $description = 'Recalculate grades for all existing marks based on total marks';

    public function handle()
    {
        $this->info('Starting grade recalculation...');

        // Get all marks that have total_marks set but might have wrong grades
        $marks = Mark::whereNotNull('total_marks')
            ->where('total_marks', '>', 0)
            ->get();

        $this->info("Found {$marks->count()} marks to process.");

        $updated = 0;
        foreach ($marks as $mark) {
            // Calculate percentage
            $percentage = ($mark->obtained_marks / $mark->total_marks) * 100;

            // Determine grade based on percentage
            if ($percentage >= 80) {
                $grade = ['grade' => 'A+', 'gp' => 5.0];
            } elseif ($percentage >= 70) {
                $grade = ['grade' => 'A', 'gp' => 4.0];
            } elseif ($percentage >= 60) {
                $grade = ['grade' => 'A-', 'gp' => 3.5];
            } elseif ($percentage >= 50) {
                $grade = ['grade' => 'B', 'gp' => 3.0];
            } elseif ($percentage >= 40) {
                $grade = ['grade' => 'C', 'gp' => 2.0];
            } elseif ($percentage >= 33) {
                $grade = ['grade' => 'D', 'gp' => 1.0];
            } else {
                $grade = ['grade' => 'F', 'gp' => 0.0];
            }

            // Update if grade changed
            if ($mark->grade !== $grade['grade'] || $mark->grade_point != $grade['gp']) {
                $mark->update([
                    'grade' => $grade['grade'],
                    'grade_point' => $grade['gp'],
                ]);
                $updated++;
            }
        }

        $this->info("Successfully updated {$updated} marks.");
        $this->info('Grade recalculation completed!');

        return 0;
    }
}
