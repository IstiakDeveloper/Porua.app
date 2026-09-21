<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_number',
        'fund_id',
        'account_id',
        'transaction_type',
        'amount',
        'transaction_date',
        'description',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
    ];

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
