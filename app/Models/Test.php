<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'difficulty',
        'time_limit',
        'attempts_allowed',
        'price',
        'is_active',
        'is_free',
        'show_result',
        'randomize_questions',
        'type',
        'exam_date',
        'registration_deadline',
        'location'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_free' => 'boolean',
        'show_result' => 'boolean',
        'randomize_questions' => 'boolean',
        'exam_date' => 'datetime',
        'registration_deadline' => 'datetime',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function getPriceFormattedAttribute()
    {
        return $this->is_free ? 'Gratis' : 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public function getParticipantsCountAttribute()
    {
        return $this->testAttempts()->distinct('user_id')->count();
    }

    public function getAverageScoreAttribute()
    {
        return round($this->testAttempts()->where('status', 'completed')->avg('score') ?? 0, 1);
    }

    public function getQuestionsCountAttribute()
    {
        return $this->questions()->count();
    }
}
