<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'explanation',
        'points'
    ];

    protected $casts = [
        'options' => 'array',
        'points' => 'integer',
    ];

    /**
     * Get the test that owns the question
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Scope for multiple choice questions
     */
    public function scopeMultipleChoice($query)
    {
        return $query->where('question_type', 'multiple_choice');
    }

    /**
     * Scope for true/false questions
     */
    public function scopeTrueFalse($query)
    {
        return $query->where('question_type', 'true_false');
    }

    /**
     * Scope for essay questions
     */
    public function scopeEssay($query)
    {
        return $query->where('question_type', 'essay');
    }
}
