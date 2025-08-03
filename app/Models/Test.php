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

    public function payments()
    {
        return $this->hasMany(Payment::class, 'test_id');
    }

    public function userAccess()
    {
        return $this->belongsToMany(User::class, 'test_access')
                    ->withPivot(['purchased_at', 'expires_at', 'payment_id'])
                    ->withTimestamps();
    }

    public function isAccessibleBy(User $user)
    {
        // Free tests are always accessible
        if ($this->is_free) {
            return true;
        }

        // Check if user has purchased access
        return $this->userAccess()
                    ->where('user_id', $user->id)
                    ->where(function($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    })
                    ->exists();
    }

    public function getPurchaseStatusFor(User $user)
    {
        if ($this->is_free) {
            return 'free';
        }

        $access = $this->userAccess()
                       ->where('user_id', $user->id)
                       ->first();

        if (!$access) {
            return 'not_purchased';
        }

        if ($access->pivot->expires_at && $access->pivot->expires_at < now()) {
            return 'expired';
        }

        return 'active';
    }

    public function canUserAttempt(User $user)
    {
        // Check if user has access to the test
        if (!$this->isAccessibleBy($user)) {
            return false;
        }

        // Check attempt limits
        if ($this->attempts_allowed > 0) {
            $userAttempts = $this->testAttempts()
                                ->where('user_id', $user->id)
                                ->count();

            return $userAttempts < $this->attempts_allowed;
        }

        return true;
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
