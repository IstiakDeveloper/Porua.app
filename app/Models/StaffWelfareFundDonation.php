<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffWelfareFundDonation extends Model
{
    use HasFactory;

    protected $fillable = [
        'donation_number',
        'account_id',
        'amount',
        'donation_date',
        'donor_name',
        'payment_method',
        'reference_number',
        'remarks',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'donation_date' => 'date',
        ];
    }

    // Relationships
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
