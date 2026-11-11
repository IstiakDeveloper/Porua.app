<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Support\ParentPortal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentCalendarController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        if ($month < 1 || $month > 12) {
            $month = (int) Carbon::now()->month;
        }

        if ($year < 2000 || $year > 2100) {
            $year = (int) Carbon::now()->year;
        }

        $cursor = Carbon::create($year, $month, 1);

        return Inertia::render('Parent/Calendar/Index', [
            'events' => ParentPortal::eventsForMonth($year, $month),
            'filters' => [
                'month' => $month,
                'year' => $year,
                'label' => $cursor->format('F Y'),
            ],
        ]);
    }
}
