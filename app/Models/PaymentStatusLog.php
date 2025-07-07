<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'old_status',
        'new_status',
        'changed_by',
        'notes'
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
