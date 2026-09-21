<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalaryPaymentRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
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

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'staff_id.required' => 'Please select a teacher.',
            'staff_id.exists' => 'Selected teacher not found.',
            'month.between' => 'Month must be between 1 and 12.',
            'year.min' => 'Year must be at least 2020.',
            'base_salary.required' => 'Salary amount is required.',
            'payment_date.required' => 'Payment date is required.',
            'account_id.required' => 'Please select an account.',
            'payment_method.in' => 'Payment method must be cash, bank transfer, or cheque.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Add unique validation for staff_id + month + year combination
        $this->merge([
            'staff_id' => $this->input('staff_id'),
        ]);
    }

}

