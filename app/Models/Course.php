<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'level',
        'price',
        'is_free',
        'is_active',
        'instructor_id',
        'duration_hours',
        'thumbnail',
        'order',
        'metadata'
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'price' => 'decimal:2'
    ];

    // Relationships
    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function tests()
    {
        return $this->hasMany(Test::class);
    }

    public function courseProgress()
    {
        return $this->hasMany(CourseProgress::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    // Accessors
    public function getPriceFormattedAttribute()
    {
        return $this->is_free ? 'Gratis' : 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public function getStudentsCountAttribute()
    {
        return $this->courseProgress()->distinct('user_id')->count();
    }

    public function getModulesCountAttribute()
    {
        return $this->modules()->count();
    }

    public function getTestsCountAttribute()
    {
        return $this->tests()->count();
    }
}
