<?php

namespace App\Console\Commands;

use App\Models\Exam;
use App\Models\Result;
use Illuminate\Console\Command;

class PublishDueExamResults extends Command
{
    protected $signature = 'exams:publish-due';

    protected $description = 'Publish generated results whose result publish date has arrived';

    public function handle(): int
    {
        $exams = Exam::query()
            ->whereNotNull('result_publish_date')
            ->whereDate('result_publish_date', '<=', today())
            ->where('status', '!=', 'cancelled')
            ->get();

        $published = 0;

        foreach ($exams as $exam) {
            $count = Result::query()
                ->where('exam_id', $exam->id)
                ->where('is_published', false)
                ->update(['is_published' => true]);

            if ($count > 0) {
                $exam->update(['marks_locked' => true]);
                $published += $count;
                $this->info("Published {$count} results for {$exam->name}.");
            }
        }

        $this->info("Done. {$published} result rows published.");

        return self::SUCCESS;
    }
};
