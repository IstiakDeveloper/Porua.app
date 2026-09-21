<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaryPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'staff_id' => ['required', 'exists:teachers,id'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'payment_date' => ['required', 'date'],
            'account_id' => ['required', 'exists:accounts,id'],
            'payment_method' => ['required', 'in:cash,bank_transfer,cheque'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'staff_id.required' => 'Please select a teacher.',
            'base_salary.required' => 'Salary amount is required.',
            'payment_date.required' => 'Payment date is required.',
            'account_id.required' => 'Please select an account.',
        ];
    }
}
