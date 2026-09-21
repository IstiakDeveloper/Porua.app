<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Investor extends Model
{
    use HasFactory;

    protected $fillable = [
        'investor_code',
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'investor_type',
        'status',
        'notes',
    ];

    public function funds()
    {
        return $this->hasMany(Fund::class);
    }

    public function totalInvestment()
    {
        return $this->funds()->sum('current_balance');
    }

    public function activeInvestment()
    {
        return $this->funds()->where('status', 'active')->sum('current_balance');
    }
}
