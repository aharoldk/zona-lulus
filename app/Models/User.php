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
        'settings',
        'last_login_at',
        'coins',
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
            'settings' => 'array',
            'last_login_at' => 'datetime',
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

    public function coinTransactions()
    {
        return $this->hasMany(CoinTransaction::class);
    }

    // Scopes
    public function scopeActiveUsers($query)
    {
        return $query->where('last_login_at', '>=', now()->subDays(30));
    }

    // Coin methods
    public function addCoins(int $amount, string $description, array $metadata = [])
    {
        $this->increment('coins', $amount);

        return $this->coinTransactions()->create([
            'type' => 'purchase',
            'amount' => $amount,
            'balance_after' => $this->fresh()->coins,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    public function spendCoins(int $amount, string $description, array $metadata = [])
    {
        if ($this->coins < $amount) {
            throw new \Exception('Insufficient coins');
        }

        $this->decrement('coins', $amount);

        return $this->coinTransactions()->create([
            'type' => 'spend',
            'amount' => -$amount,
            'balance_after' => $this->fresh()->coins,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    public function refundCoins(int $amount, string $description, array $metadata = [])
    {
        $this->increment('coins', $amount);

        return $this->coinTransactions()->create([
            'type' => 'refund',
            'amount' => $amount,
            'balance_after' => $this->fresh()->coins,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    public function hasEnoughCoins(int $amount): bool
    {
        return $this->coins >= $amount;
    }
}
