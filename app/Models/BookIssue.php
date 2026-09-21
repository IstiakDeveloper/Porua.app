<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'issueable_type',
        'issueable_id',
        'issue_date',
        'due_date',
        'return_date',
        'status',
        'fine_amount',
        'fine_paid',
        'remarks',
        'issued_by',
        'returned_to',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'return_date' => 'date',
            'fine_amount' => 'decimal:2',
            'fine_paid' => 'boolean',
        ];
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function issueable()
    {
        return $this->morphTo();
    }

    public function student()
    {
        return $this->morphTo('issueable')->where('issueable_type', Student::class);
    }

    public function teacher()
    {
        return $this->morphTo('issueable')->where('issueable_type', Teacher::class);
    }

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function returner()
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function isOverdue()
    {
        return $this->status === 'issued' && $this->due_date->isPast();
    }
}
