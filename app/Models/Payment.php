<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'course_id',
        'test_id',
        'invoice_number',
        'amount',
        'payment_method',
        'status',
        'order_id',
        'transaction_id',
        'transaction_status',
        'payment_channel',
        'paid_at',
        'expires_at',
        'description',
        'admin_notes',
        'refund_amount',
        'refund_reason',
        'refund_processed_by',
        'refund_processed_at',
        'status_updated_by',
        'status_updated_at',
        'metadata'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
        'refund_processed_at' => 'datetime',
        'status_updated_at' => 'datetime',
        'metadata' => 'array'
    ];

    protected $dates = [
        'paid_at',
        'expires_at',
        'refund_processed_at',
        'status_updated_at'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function refundProcessor()
    {
        return $this->belongsTo(User::class, 'refund_processed_by');
    }

    public function statusUpdater()
    {
        return $this->belongsTo(User::class, 'status_updated_by');
    }

    public function statusLogs()
    {
        return $this->hasMany(PaymentStatusLog::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeForTest($query, $testId)
    {
        return $query->where('test_id', $testId);
    }

    // Accessors & Mutators
    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    public function getFormattedRefundAmountAttribute()
    {
        return $this->refund_amount ? 'Rp ' . number_format($this->refund_amount, 0, ',', '.') : null;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['color' => 'warning', 'text' => 'Menunggu'],
            'completed' => ['color' => 'success', 'text' => 'Berhasil'],
            'failed' => ['color' => 'error', 'text' => 'Gagal'],
            'cancelled' => ['color' => 'default', 'text' => 'Dibatalkan'],
            'refunded' => ['color' => 'processing', 'text' => 'Refund'],
        ];

        return $badges[$this->status] ?? ['color' => 'default', 'text' => 'Unknown'];
    }

    public function getPaymentMethodNameAttribute()
    {
        $methods = [
            'bank_transfer' => 'Transfer Bank',
            'virtual_account' => 'Virtual Account',
            'credit_card' => 'Kartu Kredit',
            'ewallet' => 'E-Wallet',
            'qr_code' => 'QR Code',
            'retail_outlet' => 'Retail Outlet'
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }

    // Methods
    public function generateInvoiceNumber()
    {
        $prefix = 'ZL';
        $date = now()->format('Ymd');
        $sequence = str_pad(Payment::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $date . $sequence;
    }

    public function markAsPaid($xenditPaymentId = null)
    {
        $this->update([
            'status' => 'completed',
            'paid_at' => now(),
            'xendit_payment_id' => $xenditPaymentId
        ]);

        // Grant course access to user
        if ($this->course) {
            $this->user->courseProgress()->firstOrCreate(
                ['course_id' => $this->course_id],
                [
                    'progress_percentage' => 0,
                    'started_at' => now(),
                    'status' => 'active'
                ]
            );
        }

        return $this;
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => 'failed',
            'admin_notes' => $reason
        ]);

        return $this;
    }

    public function canBeRefunded()
    {
        return $this->status === 'completed' && !$this->refund_amount;
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at < now();
    }
}
