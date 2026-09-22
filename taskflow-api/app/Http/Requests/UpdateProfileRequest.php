<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birthday' => 'required|date|before:-13 years',
            'gender' => 'required|in:male,female,other,prefer_not_to_say',
            'email' => 'required|string|email|max:255|unique:users,email,' . $this->user()->id,
            'avatar' => 'nullable|mimes:jpeg,jpg,png,gif,webp|max:2048', // 2MB; raster formats only — excludes svg (can embed scripts)
        ];
    }

    public function messages(): array
    {
        return [
            'birthday.before' => 'You must be at least 13 years old.',
        ];
    }
}