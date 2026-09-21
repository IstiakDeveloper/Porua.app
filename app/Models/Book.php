<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'isbn',
        'author',
        'publisher',
        'edition',
        'publication_year',
        'category',
        'description',
        'total_copies',
        'available_copies',
        'shelf_location',
        'cover_image',
        'price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'publication_year' => 'integer',
            'total_copies' => 'integer',
            'available_copies' => 'integer',
            'price' => 'decimal:2',
        ];
    }

    public function bookIssues()
    {
        return $this->hasMany(BookIssue::class);
    }

    public function issues()
    {
        return $this->hasMany(BookIssue::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('available_copies', '>', 0);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function isAvailable()
    {
        return $this->available_copies > 0;
    }
}
