import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { ArrowLeft, Save, Users, User, Mail, Phone, GraduationCap, Calendar, DollarSign, Upload, Trash2, BookOpen } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    blood_group: string | null;
    religion: string | null;
    nationality: string | null;
    designation: string | null;
    department: string | null;
    nid_no: string | null;
    emergency_contact: string | null;
    present_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    qualification: string;
    specialization: string | null;
    experience_years: number;
    previous_experience: string | null;
    joining_date: string;
    leaving_date: string | null;
    salary: number;
    bank_name: string | null;
    bank_account_no: string | null;
    bank_branch: string | null;
    employment_type: string | null;
    status: string;
    photo: string | null;
    notes: string | null;
    subjects: Subject[];
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface EditProps {
    teacher: Teacher;
}

export default function Edit({ teacher }: EditProps) {
    const [data, setData] = useState({
        employee_id: teacher.employee_id,
        name: teacher.user?.name || `${teacher.first_name} ${teacher.last_name}`,
        email: teacher.user?.email || teacher.email,
        phone: teacher.user?.phone || teacher.phone,
        date_of_birth: teacher.date_of_birth || '',
        gender: teacher.gender,
        blood_group: teacher.blood_group || '',
        religion: teacher.religion || '',
        nationality: teacher.nationality || '',
        designation: teacher.designation || '',
        department: teacher.department || '',
        nid_no: teacher.nid_no || '',
        emergency_contact: teacher.emergency_contact || '',
        present_address: teacher.present_address || '',
        permanent_address: teacher.permanent_address || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        experience_years: teacher.experience_years ? teacher.experience_years.toString() : '0',
        previous_experience: teacher.previous_experience || '',
        joining_date: teacher.joining_date || '',
        leaving_date: teacher.leaving_date || '',
        salary: teacher.salary ? teacher.salary.toString() : '',
        bank_name: teacher.bank_name || '',
        bank_account_no: teacher.bank_account_no || '',
        bank_branch: teacher.bank_branch || '',
        employment_type: teacher.employment_type || 'permanent',
        status: teacher.status,
        notes: teacher.notes || '',
        photo: null as File | null,
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photo);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value) {
                formData.append(key, value as File);
            } else if (value !== null && value !== '') {
                formData.append(key, value.toString());
            }
        });

        router.post(`/teachers/${teacher.id}`, formData, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${teacher.first_name} ${teacher.last_name}"?`)) {
            router.delete(`/teachers/${teacher.id}`);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData({ ...data, photo: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Teacher" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/teachers')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Edit Teacher
                            </h1>
                            <p className="text-gray-600 mt-1">Update teacher information</p>
                        </div>
                    </div>
                    <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="w-5 h-5" />}>
                        Delete Teacher
                    </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">
                            Editing: {teacher.first_name} {teacher.last_name} ({teacher.employee_id})
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                        </h3>

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}
                                <label className="cursor-pointer">
                                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Change Photo
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Employee ID"
                                value={data.employee_id}
                                onChange={(e) => setData({ ...data, employee_id: e.target.value })}
                                error={errors.employee_id}
                                required
                                placeholder="T0001"
                            />
                            <Input
                                label="Full Name (for login)"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                error={errors.email}
                                required
                                placeholder="teacher@school.com"
                                icon={<Mail className="w-5 h-5" />}
                            />
                            <Input
                                label="Phone"
                                value={data.phone}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                error={errors.phone}
                                required
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Date of Birth"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                                error={errors.date_of_birth}
                                required
                                icon={<Calendar className="w-5 h-5" />}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                <select
                                    value={data.blood_group}
                                    onChange={(e) => setData({ ...data, blood_group: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                                {errors.blood_group && <p className="text-red-600 text-sm mt-1">{errors.blood_group}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                                <select
                                    value={data.religion}
                                    onChange={(e) => setData({ ...data, religion: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Religion</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Hinduism">Hinduism</option>
                                    <option value="Buddhism">Buddhism</option>
                                    <option value="Christianity">Christianity</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.religion && <p className="text-red-600 text-sm mt-1">{errors.religion}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                                <select
                                    value={data.nationality}
                                    onChange={(e) => setData({ ...data, nationality: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Nationality</option>
                                    <option value="Bangladeshi">Bangladeshi</option>
                                    <option value="Indian">Indian</option>
                                    <option value="Pakistani">Pakistani</option>
                                    <option value="Nepali">Nepali</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.nationality && <p className="text-red-600 text-sm mt-1">{errors.nationality}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="NID Number"
                                value={data.nid_no}
                                onChange={(e) => setData({ ...data, nid_no: e.target.value })}
                                error={errors.nid_no}
                                placeholder="1234567890"
                            />
                            <Input
                                label="Emergency Contact"
                                value={data.emergency_contact}
                                onChange={(e) => setData({ ...data, emergency_contact: e.target.value })}
                                error={errors.emergency_contact}
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Present Address</label>
                            <textarea
                                value={data.present_address}
                                onChange={(e) => setData({ ...data, present_address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Current residential address..."
                            />
                            {errors.present_address && <p className="text-red-600 text-sm mt-1">{errors.present_address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                            <textarea
                                value={data.permanent_address}
                                onChange={(e) => setData({ ...data, permanent_address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Permanent residential address..."
                            />
                            {errors.permanent_address && <p className="text-red-600 text-sm mt-1">{errors.permanent_address}</p>}
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            Professional Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                <select
                                    value={data.designation}
                                    onChange={(e) => setData({ ...data, designation: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Designation</option>
                                    <option value="Head Teacher">Head Teacher</option>
                                    <option value="Assistant Head Teacher">Assistant Head Teacher</option>
                                    <option value="Senior Teacher">Senior Teacher</option>
                                    <option value="Assistant Teacher">Assistant Teacher</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Physical Education Teacher">Physical Education Teacher</option>
                                    <option value="Computer Operator">Computer Operator</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.designation && <p className="text-red-600 text-sm mt-1">{errors.designation}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select
                                    value={data.department}
                                    onChange={(e) => setData({ ...data, department: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Science">Science</option>
                                    <option value="Arts">Arts</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="English">English</option>
                                    <option value="Bangla">Bangla</option>
                                    <option value="Social Science">Social Science</option>
                                    <option value="Physical Education">Physical Education</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Qualification"
                                value={data.qualification}
                                onChange={(e) => setData({ ...data, qualification: e.target.value })}
                                error={errors.qualification}
                                placeholder="B.Sc in Mathematics"
                                icon={<GraduationCap className="w-5 h-5" />}
                            />
                            <Input
                                label="Specialization"
                                value={data.specialization}
                                onChange={(e) => setData({ ...data, specialization: e.target.value })}
                                error={errors.specialization}
                                placeholder="Pure Mathematics"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Experience (Years)"
                                type="number"
                                value={data.experience_years}
                                onChange={(e) => setData({ ...data, experience_years: e.target.value })}
                                error={errors.experience_years}
                                min="0"
                                placeholder="5"
                            />
                            <Input
                                label="Joining Date"
                                type="date"
                                value={data.joining_date}
                                onChange={(e) => setData({ ...data, joining_date: e.target.value })}
                                error={errors.joining_date}
                                required
                                icon={<Calendar className="w-5 h-5" />}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Previous Experience</label>
                            <textarea
                                value={data.previous_experience}
                                onChange={(e) => setData({ ...data, previous_experience: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Details of previous teaching experience..."
                            />
                            {errors.previous_experience && <p className="text-red-600 text-sm mt-1">{errors.previous_experience}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                                <select
                                    value={data.employment_type}
                                    onChange={(e) => setData({ ...data, employment_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="permanent">Permanent</option>
                                    <option value="contract">Contract</option>
                                    <option value="part_time">Part Time</option>
                                </select>
                                {errors.employment_type && <p className="text-red-600 text-sm mt-1">{errors.employment_type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData({ ...data, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="resigned">Resigned</option>
                                    <option value="retired">Retired</option>
                                </select>
                                {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Salary"
                                type="number"
                                value={data.salary}
                                onChange={(e) => setData({ ...data, salary: e.target.value })}
                                error={errors.salary}
                                min="0"
                                placeholder="50000"
                                icon={<DollarSign className="w-5 h-5" />}
                            />
                            <Input
                                label="Leaving Date (if applicable)"
                                type="date"
                                value={data.leaving_date}
                                onChange={(e) => setData({ ...data, leaving_date: e.target.value })}
                                error={errors.leaving_date}
                                icon={<Calendar className="w-5 h-5" />}
                            />
                        </div>
                    </div>

                    {/* Bank Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            Bank Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Bank Name"
                                value={data.bank_name}
                                onChange={(e) => setData({ ...data, bank_name: e.target.value })}
                                error={errors.bank_name}
                                placeholder="Dutch-Bangla Bank"
                            />
                            <Input
                                label="Account Number"
                                value={data.bank_account_no}
                                onChange={(e) => setData({ ...data, bank_account_no: e.target.value })}
                                error={errors.bank_account_no}
                                placeholder="1234567890"
                            />
                            <Input
                                label="Branch Name"
                                value={data.bank_branch}
                                onChange={(e) => setData({ ...data, bank_branch: e.target.value })}
                                error={errors.bank_branch}
                                placeholder="Mirpur Branch"
                            />
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData({ ...data, notes: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Any additional information or notes about the teacher..."
                        />
                        {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
                    </div>

                    {/* Note about Subject Assignment */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-5">
                        <div className="flex gap-3">
                            <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-2">📚 Subject Assignment</h4>
                                <p className="text-sm text-blue-800 mb-2">
                                    Subjects are assigned to this teacher with class and section information separately.
                                </p>
                                <p className="text-sm text-blue-700">
                                    <strong>How to manage:</strong> Go to{' '}
                                    <strong className="text-blue-900">Teachers → Teacher Subjects</strong> menu to view, add, or remove subject assignments along with classes and sections.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.visit('/teachers')}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            icon={<Save className="w-5 h-5" />}
                        >
                            {processing ? 'Updating...' : 'Update Teacher'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
