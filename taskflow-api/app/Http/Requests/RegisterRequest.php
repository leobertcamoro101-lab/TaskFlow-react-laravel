<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birthday' => 'required|date|before:-13 years',
            'gender' => 'required|in:male,female,other,prefer_not_to_say',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised(),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'birthday.before' => 'You must be at least 13 years old to register.',
        ];
    }
}
