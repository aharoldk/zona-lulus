<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'test_id',
        'score',
        'status',
        'started_at',
        'completed_at',
        'scheduled_at',
        'time_taken',
        'answers'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'answers' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function getDateFormattedAttribute()
    {
        return $this->completed_at ? $this->completed_at->format('d F Y') : '';
    }

    public function getRankAttribute()
    {
        // Calculate rank based on score compared to other attempts for the same test
        return TestAttempt::where('test_id', $this->test_id)
            ->where('score', '>', $this->score)
            ->count() + 1;
    }
}
