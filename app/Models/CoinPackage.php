<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoinPackage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'coins',
        'price',
        'bonus',
        'popular',
        'active',
        'features',
        'sort_order'
    ];

    protected $casts = [
        'popular' => 'boolean',
        'active' => 'boolean',
        'features' => 'array'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Scope to get only active packages
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get packages ordered by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    /**
     * Get total coins including bonus
     */
    public function getTotalCoinsAttribute()
    {
        return $this->coins + $this->bonus;
    }

    /**
     * Get formatted price in rupiah
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }
}
