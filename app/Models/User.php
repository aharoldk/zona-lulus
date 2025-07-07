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
        // Admin fields
        'is_admin',
        'role',
        'experience_level',
        'study_time',
        'newsletter_subscription',
        'registration_completed_at',
        'last_login_at',
        // Settings fields
        'notifications_email',
        'notifications_push',
        'notifications_sms',
        'notifications_study_reminders',
        'notifications_achievement_alerts',
        'notifications_weekly_reports',
        'privacy_profile_visibility',
        'privacy_show_progress',
        'privacy_show_achievements',
        'privacy_allow_messages',
        'preferences_language',
        'preferences_timezone',
        'preferences_theme',
        'preferences_auto_save',
        'preferences_sound_effects'
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

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function processedRefunds()
    {
        return $this->hasMany(Payment::class, 'refund_processed_by');
    }

    public function statusUpdates()
    {
        return $this->hasMany(Payment::class, 'status_updated_by');
    }

    public function paymentStatusLogs()
    {
        return $this->hasMany(PaymentStatusLog::class, 'changed_by');
    }

    // Admin-related methods
    public function isAdmin()
    {
        return $this->is_admin || $this->role === 'admin';
    }

    public function canManagePayments()
    {
        return $this->isAdmin() || in_array($this->role, ['admin', 'finance']);
    }

    // Scopes
    public function scopeAdmins($query)
    {
        return $query->where('is_admin', true)->orWhere('role', 'admin');
    }

    public function scopeActiveUsers($query)
    {
        return $query->where('last_login_at', '>=', now()->subDays(30));
    }
}
