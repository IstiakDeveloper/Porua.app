<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FixedAsset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'asset_name',
        'asset_code',
        'category',
        'account_id',
        'purchase_price',
        'purchase_date',
        'depreciation_rate',
        'current_value',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'depreciation_rate' => 'decimal:2',
            'current_value' => 'decimal:2',
            'purchase_date' => 'date',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(FixedAssetItem::class);
    }
}
