<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'type',
        'priority',
        'target_audience',
        'target_classes',
        'attachment',
        'valid_from',
        'valid_to',
        'send_sms',
        'send_email',
        'is_published',
        'published_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'target_audience' => 'array',
            'target_classes' => 'array',
            'valid_from' => 'date',
            'valid_to' => 'date',
            'send_sms' => 'boolean',
            'send_email' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_published', true)
                     ->where(function($q) {
                         $q->whereNull('valid_from')
                           ->orWhereDate('valid_from', '<=', now());
                     })
                     ->where(function($q) {
                         $q->whereNull('valid_to')
                           ->orWhereDate('valid_to', '>=', now());
                     });
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
