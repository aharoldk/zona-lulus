<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'birth_date',
        'address',
        'education',
        'target',
        'avatar',
        'two_factor_enabled',
        'login_alerts',
        'email_course_updates',
        'email_study_reminders',
        'email_tryout_results',
        'push_deadline_reminders',
        'push_achievements',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'two_factor_enabled' => 'boolean',
            'login_alerts' => 'boolean',
            'email_course_updates' => 'boolean',
            'email_study_reminders' => 'boolean',
            'email_tryout_results' => 'boolean',
            'push_deadline_reminders' => 'boolean',
            'push_achievements' => 'boolean',
        ];
    }

    // Relationships
    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function courseProgress()
    {
        return $this->hasMany(CourseProgress::class);
    }
}
