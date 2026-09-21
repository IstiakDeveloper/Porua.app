import React, { FormEvent, useState, useEffect } from 'react';
import { formatAmount } from '@/lib/formatCurrency';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { ArrowLeft, Save, User, Mail, Phone, GraduationCap, Calendar, Upload, Users, MapPin, FileText, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import addressData from '@/data/bangladeshAddresses.json';

interface AcademicYear {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
    fee_structures?: Array<{
        id: number;
        fee_type_id: number;
        fee_type_name: string;
        frequency: string;
        amount: number;
    }>;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface CreateProps {
    academicYears: AcademicYear[];
    classes: SchoolClass[];
}

export default function Create({ academicYears, classes }: CreateProps) {
    const [data, setData] = useState({
        academic_year_id: '',
        class_id: '',
        section_id: '',
        parent_id: '',
        admission_number: '',
        student_id: '',
        form_number: '',
        monthly_fee: '',
        roll_number: '',
        admission_date: '',
        first_name: '',
        last_name: '',
        first_name_bengali: '',
        last_name_bengali: '',
        name_bn: '',
        name_en: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        date_of_birth: '',
        birth_place_district: 'Naogaon',
        gender: 'male',
        blood_group: '',
        birth_certificate_no: '',
        birth_certificate_number: '',
        religion: 'Islam',
        nationality: 'Bangladeshi',
        minorities: false,
        minority_name: '',
        handicap: '',
        present_address: '',
        present_address_division: 'Rajshahi',
        present_address_district: 'Naogaon',
        present_address_upazila: 'Naogaon Sadar',
        present_address_city: '',
        present_address_ward: '',
        present_address_village: '',
        present_address_house_number: '',
        present_address_post: '',
        present_address_post_code: '',
        permanent_address: '',
        permanent_address_division: 'Rajshahi',
        permanent_address_district: 'Naogaon',
        permanent_address_upazila: 'Naogaon Sadar',
        permanent_address_city: '',
        permanent_address_ward: '',
        permanent_address_village: '',
        permanent_address_house_number: '',
        permanent_address_post: '',
        permanent_address_post_code: '',
        father_name: '',
        father_name_bn: '',
        father_name_en: '',
        father_phone: '',
        father_mobile: '',
        father_nid: '',
        father_dob: '',
        father_occupation: '',
        father_dead: false,
        mother_name: '',
        mother_name_bn: '',
        mother_name_en: '',
        mother_phone: '',
        mother_mobile: '',
        mother_nid: '',
        mother_dob: '',
        mother_occupation: '',
        mother_dead: false,
        guardian_name: '',
        guardian_phone: '',
        guardian_relation: 'father',
        previous_school: '',
        previous_class: '',
        previous_exam_result: '',
        medical_conditions: '',
        allergies: '',
        special_notes: '',
        information_correct: false,
        status: 'active',
        photo: null as File | null,
    });

    const [sections, setSections] = useState<Section[]>([]);
    const [classFees, setClassFees] = useState<any[]>([]);
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [sameAsPresentAddress, setSameAsPresentAddress] = useState(false);
    const [presentDistricts, setPresentDistricts] = useState<string[]>(addressData.districtsByDivision['Rajshahi'] || []);
    const [presentUpazilas, setPresentUpazilas] = useState<string[]>(addressData.upazilasByDistrict['Naogaon'] || []);
    const [permanentDistricts, setPermanentDistricts] = useState<string[]>(addressData.districtsByDivision['Rajshahi'] || []);
    const [permanentUpazilas, setPermanentUpazilas] = useState<string[]>(addressData.upazilasByDistrict['Naogaon'] || []);

    // Auto-generate admission number on component mount
    useEffect(() => {
        const generateAdmissionNumber = () => {
            const year = new Date().getFullYear();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `ADM${year}${random}`;
        };
        setData(prev => ({ ...prev, admission_number: generateAdmissionNumber() }));
    }, []);

    // Load sections and fees when class changes
    useEffect(() => {
        if (data.class_id) {
            // Load sections
            axios.get(`/students/sections/${data.class_id}`)
                .then(response => setSections(response.data))
                .catch(() => setSections([]));

            // Load all fees for this class
            const selectedClass = classes.find(c => c.id.toString() === data.class_id);

            if (selectedClass?.fee_structures) {
                setClassFees(selectedClass.fee_structures);

                // Set monthly fee if available
                const monthlyFee = selectedClass.fee_structures.find(f =>
                    f.frequency === 'monthly' || f.fee_type_name.toLowerCase().includes('monthly')
                );

                if (monthlyFee) {
                    setData(prev => ({ ...prev, monthly_fee: monthlyFee.amount.toString() }));
                } else {
                    setData(prev => ({ ...prev, monthly_fee: '' }));
                }
            } else {
                setClassFees([]);
                setData(prev => ({ ...prev, monthly_fee: '' }));
            }
        } else {
            setSections([]);
            setClassFees([]);
            setData(prev => ({ ...prev, monthly_fee: '' }));
        }
    }, [data.class_id, classes]);

    // Update districts when division changes for present address
    useEffect(() => {
        const districts = addressData.districtsByDivision[data.present_address_division as keyof typeof addressData.districtsByDivision] || [];
        setPresentDistricts(districts);
        if (districts.length > 0 && !districts.includes(data.present_address_district)) {
            setData(prev => ({ ...prev, present_address_district: districts[0], present_address_upazila: '' }));
        }
    }, [data.present_address_division]);

    // Update upazilas when district changes for present address
    useEffect(() => {
        const upazilas = addressData.upazilasByDistrict[data.present_address_district as keyof typeof addressData.upazilasByDistrict] || [];
        setPresentUpazilas(upazilas);
        if (upazilas.length > 0 && !upazilas.includes(data.present_address_upazila)) {
            setData(prev => ({ ...prev, present_address_upazila: upazilas[0] || '' }));
        }
    }, [data.present_address_district]);

    // Update districts when division changes for permanent address
    useEffect(() => {
        const districts = addressData.districtsByDivision[data.permanent_address_division as keyof typeof addressData.districtsByDivision] || [];
        setPermanentDistricts(districts);
        if (districts.length > 0 && !districts.includes(data.permanent_address_district)) {
            setData(prev => ({ ...prev, permanent_address_district: districts[0], permanent_address_upazila: '' }));
        }
    }, [data.permanent_address_division]);

    // Update upazilas when district changes for permanent address
    useEffect(() => {
        const upazilas = addressData.upazilasByDistrict[data.permanent_address_district as keyof typeof addressData.upazilasByDistrict] || [];
        setPermanentUpazilas(upazilas);
        if (upazilas.length > 0 && !upazilas.includes(data.permanent_address_upazila)) {
            setData(prev => ({ ...prev, permanent_address_upazila: upazilas[0] || '' }));
        }
    }, [data.permanent_address_district]);

    // Copy present address to permanent address
    useEffect(() => {
        if (sameAsPresentAddress) {
            setData(prev => ({
                ...prev,
                permanent_address: prev.present_address,
                permanent_address_division: prev.present_address_division,
                permanent_address_district: prev.present_address_district,
                permanent_address_upazila: prev.present_address_upazila,
                permanent_address_city: prev.present_address_city,
                permanent_address_ward: prev.present_address_ward,
                permanent_address_village: prev.present_address_village,
                permanent_address_house_number: prev.present_address_house_number,
                permanent_address_post: prev.present_address_post,
                permanent_address_post_code: prev.present_address_post_code,
            }));
        }
    }, [sameAsPresentAddress]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value) {
                formData.append(key, value as File);
            } else if (value !== null && value !== '' && typeof value !== 'boolean') {
                formData.append(key, value.toString());
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            }
        });

        router.post('/students', formData, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
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
            <Head title="Create Student" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/students')}>
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Create Student
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new student to the school</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Admission Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            Admission Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                                <select
                                    value={data.academic_year_id}
                                    onChange={(e) => setData({ ...data, academic_year_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    {academicYears.map(year => (
                                        <option key={year.id} value={year.id}>{year.name}</option>
                                    ))}
                                </select>
                                {errors.academic_year_id && <p className="text-red-600 text-sm mt-1">{errors.academic_year_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                {errors.class_id && <p className="text-red-600 text-sm mt-1">{errors.class_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                                <select
                                    value={data.section_id}
                                    onChange={(e) => setData({ ...data, section_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={!data.class_id}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>{section.name}</option>
                                    ))}
                                </select>
                                {errors.section_id && <p className="text-red-600 text-sm mt-1">{errors.section_id}</p>}
                            </div>

                            <Input
                                label="Admission Date *"
                                type="date"
                                value={data.admission_date}
                                onChange={(e) => setData({ ...data, admission_date: e.target.value })}
                                error={errors.admission_date}
                                required
                                icon={<Calendar className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Number *</label>
                                <input
                                    type="text"
                                    value={data.admission_number}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                    placeholder="Auto-generated"
                                />
                                {errors.admission_number && <p className="text-red-600 text-sm mt-1">{errors.admission_number}</p>}
                            </div>
                            <Input
                                label="Student ID"
                                value={data.student_id}
                                onChange={(e) => setData({ ...data, student_id: e.target.value })}
                                error={errors.student_id}
                                placeholder="STD001"
                            />
                            <Input
                                label="Form Number"
                                value={data.form_number}
                                onChange={(e) => setData({ ...data, form_number: e.target.value })}
                                error={errors.form_number}
                                placeholder="FRM001"
                            />
                            <Input
                                label="Roll Number"
                                value={data.roll_number}
                                onChange={(e) => setData({ ...data, roll_number: e.target.value })}
                                error={errors.roll_number}
                                placeholder="001"
                            />
                        </div>

                        {/* Class Fees Display */}
                        {classFees.length > 0 ? (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                    Fee Structure for Selected Class (Will be auto-generated as Pending)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {classFees.map((fee, index) => (
                                        <div key={index} className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-md hover:shadow-lg transition">
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-base">{fee.fee_type_name}</p>
                                                        <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 capitalize">
                                                            {fee.frequency.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-auto pt-2 border-t border-gray-200">
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="text-xs text-gray-500">Amount:</span>
                                                        <span className="text-2xl font-bold text-indigo-600">
                                                            ৳{formatAmount(fee.amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        All {classFees.length} fee(s) will be automatically created as "Pending" status for this student
                                    </p>
                                </div>
                            </div>
                        ) : (
                            data.class_id && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                                    <p className="text-gray-600">No fees configured for this class. Please set up fee structures first.</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                        <User className="w-12 h-12 text-blue-400" />
                                    </div>
                                )}
                                <label className="cursor-pointer">
                                    <div className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors flex items-center gap-2 font-medium">
                                        <Upload className="w-4 h-4" />
                                        Upload Photo
                                    </div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                            {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                        </div>

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                English Name (Required)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name (English) *"
                                    value={data.first_name}
                                    onChange={(e) => {
                                        const firstName = e.target.value;
                                        setData({
                                            ...data,
                                            first_name: firstName,
                                            name_en: firstName + (data.last_name ? ' ' + data.last_name : '')
                                        });
                                    }}
                                    error={errors.first_name}
                                    required
                                    placeholder="John"
                                />
                                <Input
                                    label="Last Name (English) *"
                                    value={data.last_name}
                                    onChange={(e) => {
                                        const lastName = e.target.value;
                                        setData({
                                            ...data,
                                            last_name: lastName,
                                            name_en: (data.first_name ? data.first_name + ' ' : '') + lastName
                                        });
                                    }}
                                    error={errors.last_name}
                                    required
                                    placeholder="Doe"
                                />
                            </div>
                            <div className="mt-3">
                                <Input
                                    label="Full Name (English) *"
                                    value={data.name_en}
                                    onChange={(e) => setData({ ...data, name_en: e.target.value })}
                                    error={errors.name_en}
                                    required
                                    placeholder="Auto-filled or enter manually"
                                    className="bg-white font-medium"
                                />
                                <p className="text-xs text-gray-600 mt-1">✓ Full name is auto-generated from first and last name</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-green-600" />
                                বাংলা নাম (Optional)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name (বাংলা)"
                                    value={data.first_name_bengali}
                                    onChange={(e) => {
                                        const firstNameBn = e.target.value;
                                        setData({
                                            ...data,
                                            first_name_bengali: firstNameBn,
                                            name_bn: firstNameBn + (data.last_name_bengali ? ' ' + data.last_name_bengali : '')
                                        });
                                    }}
                                    error={errors.first_name_bengali}
                                    placeholder="জন"
                                />
                                <Input
                                    label="Last Name (বাংলা)"
                                    value={data.last_name_bengali}
                                    onChange={(e) => {
                                        const lastNameBn = e.target.value;
                                        setData({
                                            ...data,
                                            last_name_bengali: lastNameBn,
                                            name_bn: (data.first_name_bengali ? data.first_name_bengali + ' ' : '') + lastNameBn
                                        });
                                    }}
                                    error={errors.last_name_bengali}
                                    placeholder="ডো"
                                />
                            </div>
                            <div className="mt-3">
                                <Input
                                    label="Full Name (বাংলা)"
                                    value={data.name_bn}
                                    onChange={(e) => setData({ ...data, name_bn: e.target.value })}
                                    error={errors.name_bn}
                                    placeholder="Auto-filled or enter manually"
                                    className="bg-white font-medium"
                                />
                                <p className="text-xs text-gray-600 mt-1">✓ সম্পূর্ণ নাম স্বয়ংক্রিয়ভাবে তৈরি হয়েছে</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Date of Birth *"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                                error={errors.date_of_birth}
                                required
                                icon={<Calendar className="w-5 h-5" />}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Birth Place (District)</label>
                                <select
                                    value={data.birth_place_district}
                                    onChange={(e) => setData({ ...data, birth_place_district: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {Object.values(addressData.districtsByDivision).flat().sort().map((district: string) => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                <select
                                    value={data.blood_group}
                                    onChange={(e) => setData({ ...data, blood_group: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    {addressData.bloodGroups.map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                                <select
                                    value={data.religion}
                                    onChange={(e) => setData({ ...data, religion: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {addressData.religions.map(rel => (
                                        <option key={rel} value={rel}>{rel}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Nationality"
                                value={data.nationality}
                                onChange={(e) => setData({ ...data, nationality: e.target.value })}
                                error={errors.nationality}
                                placeholder="Bangladeshi"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Birth Certificate No."
                                value={data.birth_certificate_no}
                                onChange={(e) => setData({ ...data, birth_certificate_no: e.target.value })}
                                error={errors.birth_certificate_no}
                                placeholder="1234567890123456"
                            />
                            <Input
                                label="Birth Certificate Number (Alt)"
                                value={data.birth_certificate_number}
                                onChange={(e) => setData({ ...data, birth_certificate_number: e.target.value })}
                                error={errors.birth_certificate_number}
                                placeholder="Alternative format"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="minorities"
                                    checked={data.minorities}
                                    onChange={(e) => setData({ ...data, minorities: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="minorities" className="text-sm font-medium text-gray-700">
                                    Belongs to Minority Community
                                </label>
                            </div>
                            {data.minorities && (
                                <Input
                                    label="Minority Name"
                                    value={data.minority_name}
                                    onChange={(e) => setData({ ...data, minority_name: e.target.value })}
                                    error={errors.minority_name}
                                    placeholder="Specify minority community"
                                />
                            )}
                        </div>

                        <Input
                            label="Handicap / Disability"
                            value={data.handicap}
                            onChange={(e) => setData({ ...data, handicap: e.target.value })}
                            error={errors.handicap}
                            placeholder="Any physical or learning disability"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email *"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                error={errors.email}
                                required
                                placeholder="student@school.com"
                                icon={<Mail className="w-5 h-5" />}
                            />
                            <Input
                                label="Phone"
                                value={data.phone}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                error={errors.phone}
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Password *"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                error={errors.password}
                                required
                                placeholder="Min. 8 characters"
                            />
                            <Input
                                label="Confirm Password *"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                error={errors.password_confirmation}
                                required
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Address Information
                        </h3>

                        {/* Present Address */}
                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Present Address
                            </h4>

                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                                <p className="text-xs font-medium text-blue-800 mb-2">📍 Location Details (Required)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Division *
                                        </label>
                                        <select
                                            value={data.present_address_division}
                                            onChange={(e) => setData({ ...data, present_address_division: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            {addressData.divisions.map(div => (
                                                <option key={div} value={div}>{div}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            District *
                                        </label>
                                        <select
                                            value={data.present_address_district}
                                            onChange={(e) => setData({ ...data, present_address_district: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            {presentDistricts.map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upazila/Thana *
                                        </label>
                                        <select
                                            value={data.present_address_upazila}
                                            onChange={(e) => setData({ ...data, present_address_upazila: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            {presentUpazilas.length > 0 ? (
                                                presentUpazilas.map(upz => (
                                                    <option key={upz} value={upz}>{upz}</option>
                                                ))
                                            ) : (
                                                <option value="">No upazilas available</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                                <p className="text-xs font-medium text-blue-800 mb-2">🏘️ Area Details (Optional)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="City/Municipality"
                                        value={data.present_address_city}
                                        onChange={(e) => setData({ ...data, present_address_city: e.target.value })}
                                        error={errors.present_address_city}
                                        placeholder="e.g., Naogaon"
                                    />
                                    <Input
                                        label="Ward No."
                                        value={data.present_address_ward}
                                        onChange={(e) => setData({ ...data, present_address_ward: e.target.value })}
                                        error={errors.present_address_ward}
                                        placeholder="e.g., Ward 5"
                                    />
                                    <Input
                                        label="Village/Area"
                                        value={data.present_address_village}
                                        onChange={(e) => setData({ ...data, present_address_village: e.target.value })}
                                        error={errors.present_address_village}
                                        placeholder="e.g., Dhamoirhat"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                                <p className="text-xs font-medium text-blue-800 mb-2">🏠 Detailed Address (Optional)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="House/Road No."
                                        value={data.present_address_house_number}
                                        onChange={(e) => setData({ ...data, present_address_house_number: e.target.value })}
                                        error={errors.present_address_house_number}
                                        placeholder="e.g., House 123, Road 4"
                                    />
                                    <Input
                                        label="Post Office"
                                        value={data.present_address_post}
                                        onChange={(e) => setData({ ...data, present_address_post: e.target.value })}
                                        error={errors.present_address_post}
                                        placeholder="e.g., Naogaon Sadar"
                                    />
                                    <Input
                                        label="Post Code"
                                        value={data.present_address_post_code}
                                        onChange={(e) => setData({ ...data, present_address_post_code: e.target.value })}
                                        error={errors.present_address_post_code}
                                        placeholder="e.g., 6500"
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                                    <FileText className="w-4 h-4 text-yellow-700" />
                                    Full Address *
                                    <span className="text-xs font-normal text-yellow-700">(Complete address required)</span>
                                </label>
                                <textarea
                                    value={data.present_address}
                                    onChange={(e) => setData({ ...data, present_address: e.target.value })}
                                    rows={2}
                                    required
                                    className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                                    placeholder="Write complete address: House/Road, Village/Area, Post Office, Upazila, District, Division"
                                />
                                {errors.present_address && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.present_address}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Same as Present Address Checkbox */}
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                            <input
                                type="checkbox"
                                id="sameAddress"
                                checked={sameAsPresentAddress}
                                onChange={(e) => setSameAsPresentAddress(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="sameAddress" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                Permanent Address same as Present Address
                            </label>
                        </div>

                        {/* Permanent Address */}
                        <div className="space-y-4 p-4 bg-green-50 rounded-lg border-2 border-green-300">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                Permanent Address
                            </h4>

                            <div className="bg-white p-3 rounded-lg border border-green-200">
                                <p className="text-xs font-medium text-green-800 mb-2">📍 Location Details (Required)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Division *
                                        </label>
                                        <select
                                            value={data.permanent_address_division}
                                            onChange={(e) => setData({ ...data, permanent_address_division: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            disabled={sameAsPresentAddress}
                                            required
                                        >
                                            {addressData.divisions.map(div => (
                                                <option key={div} value={div}>{div}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            District *
                                        </label>
                                        <select
                                            value={data.permanent_address_district}
                                            onChange={(e) => setData({ ...data, permanent_address_district: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            disabled={sameAsPresentAddress}
                                            required
                                        >
                                            {permanentDistricts.map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upazila/Thana *
                                        </label>
                                        <select
                                            value={data.permanent_address_upazila}
                                            onChange={(e) => setData({ ...data, permanent_address_upazila: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            disabled={sameAsPresentAddress}
                                            required
                                        >
                                            {permanentUpazilas.length > 0 ? (
                                                permanentUpazilas.map(upz => (
                                                    <option key={upz} value={upz}>{upz}</option>
                                                ))
                                            ) : (
                                                <option value="">No upazilas available</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-green-200">
                                <p className="text-xs font-medium text-green-800 mb-2">🏘️ Area Details (Optional)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="City/Municipality"
                                        value={data.permanent_address_city}
                                        onChange={(e) => setData({ ...data, permanent_address_city: e.target.value })}
                                        error={errors.permanent_address_city}
                                        placeholder="e.g., Naogaon"
                                        disabled={sameAsPresentAddress}
                                    />
                                    <Input
                                        label="Ward No."
                                        value={data.permanent_address_ward}
                                        onChange={(e) => setData({ ...data, permanent_address_ward: e.target.value })}
                                        error={errors.permanent_address_ward}
                                        placeholder="e.g., Ward 5"
                                        disabled={sameAsPresentAddress}
                                    />
                                    <Input
                                        label="Village/Area"
                                        value={data.permanent_address_village}
                                        onChange={(e) => setData({ ...data, permanent_address_village: e.target.value })}
                                        error={errors.permanent_address_village}
                                        placeholder="e.g., Dhamoirhat"
                                        disabled={sameAsPresentAddress}
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-green-200">
                                <p className="text-xs font-medium text-green-800 mb-2">🏠 Detailed Address (Optional)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="House/Road No."
                                        value={data.permanent_address_house_number}
                                        onChange={(e) => setData({ ...data, permanent_address_house_number: e.target.value })}
                                        error={errors.permanent_address_house_number}
                                        placeholder="e.g., House 123, Road 4"
                                        disabled={sameAsPresentAddress}
                                    />
                                    <Input
                                        label="Post Office"
                                        value={data.permanent_address_post}
                                        onChange={(e) => setData({ ...data, permanent_address_post: e.target.value })}
                                        error={errors.permanent_address_post}
                                        placeholder="e.g., Naogaon Sadar"
                                        disabled={sameAsPresentAddress}
                                    />
                                    <Input
                                        label="Post Code"
                                        value={data.permanent_address_post_code}
                                        onChange={(e) => setData({ ...data, permanent_address_post_code: e.target.value })}
                                        error={errors.permanent_address_post_code}
                                        placeholder="e.g., 6500"
                                        disabled={sameAsPresentAddress}
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                                    <FileText className="w-4 h-4 text-yellow-700" />
                                    Full Address *
                                    <span className="text-xs font-normal text-yellow-700">(Complete address required)</span>
                                </label>
                                <textarea
                                    value={data.permanent_address}
                                    onChange={(e) => setData({ ...data, permanent_address: e.target.value })}
                                    rows={2}
                                    required
                                    className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Write complete address: House/Road, Village/Area, Post Office, Upazila, District, Division"
                                    disabled={sameAsPresentAddress}
                                />
                                {errors.permanent_address && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.permanent_address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <Users className="w-5 h-5 text-blue-600" />
                            Parent/Guardian Information
                        </h3>

                        {/* Father Information */}
                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">Father's Information</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="father_dead"
                                        checked={data.father_dead}
                                        onChange={(e) => setData({ ...data, father_dead: e.target.checked })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <label htmlFor="father_dead" className="text-sm text-gray-700">Deceased</label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Name (English)"
                                    value={data.father_name_en}
                                    onChange={(e) => setData({ ...data, father_name_en: e.target.value, father_name: e.target.value })}
                                    error={errors.father_name_en}
                                    placeholder="Father's name in English"
                                />
                                <Input
                                    label="Name (Bengali)"
                                    value={data.father_name_bn}
                                    onChange={(e) => setData({ ...data, father_name_bn: e.target.value })}
                                    error={errors.father_name_bn}
                                    placeholder="বাবার নাম বাংলায়"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="NID Number"
                                    value={data.father_nid}
                                    onChange={(e) => setData({ ...data, father_nid: e.target.value })}
                                    error={errors.father_nid}
                                    placeholder="National ID"
                                />
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={data.father_dob}
                                    onChange={(e) => setData({ ...data, father_dob: e.target.value })}
                                    error={errors.father_dob}
                                    icon={<Calendar className="w-5 h-5" />}
                                />
                                <Input
                                    label="Occupation"
                                    value={data.father_occupation}
                                    onChange={(e) => setData({ ...data, father_occupation: e.target.value })}
                                    error={errors.father_occupation}
                                    placeholder="e.g., Teacher"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Phone"
                                    value={data.father_phone}
                                    onChange={(e) => setData({ ...data, father_phone: e.target.value })}
                                    error={errors.father_phone}
                                    placeholder="01700000000"
                                    icon={<Phone className="w-5 h-5" />}
                                />
                                <Input
                                    label="Mobile (Alt)"
                                    value={data.father_mobile}
                                    onChange={(e) => setData({ ...data, father_mobile: e.target.value })}
                                    error={errors.father_mobile}
                                    placeholder="01800000000"
                                    icon={<Phone className="w-5 h-5" />}
                                />
                            </div>
                        </div>

                        {/* Mother Information */}
                        <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">Mother's Information</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="mother_dead"
                                        checked={data.mother_dead}
                                        onChange={(e) => setData({ ...data, mother_dead: e.target.checked })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <label htmlFor="mother_dead" className="text-sm text-gray-700">Deceased</label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Name (English)"
                                    value={data.mother_name_en}
                                    onChange={(e) => setData({ ...data, mother_name_en: e.target.value, mother_name: e.target.value })}
                                    error={errors.mother_name_en}
                                    placeholder="Mother's name in English"
                                />
                                <Input
                                    label="Name (Bengali)"
                                    value={data.mother_name_bn}
                                    onChange={(e) => setData({ ...data, mother_name_bn: e.target.value })}
                                    error={errors.mother_name_bn}
                                    placeholder="মায়ের নাম বাংলায়"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="NID Number"
                                    value={data.mother_nid}
                                    onChange={(e) => setData({ ...data, mother_nid: e.target.value })}
                                    error={errors.mother_nid}
                                    placeholder="National ID"
                                />
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={data.mother_dob}
                                    onChange={(e) => setData({ ...data, mother_dob: e.target.value })}
                                    error={errors.mother_dob}
                                    icon={<Calendar className="w-5 h-5" />}
                                />
                                <Input
                                    label="Occupation"
                                    value={data.mother_occupation}
                                    onChange={(e) => setData({ ...data, mother_occupation: e.target.value })}
                                    error={errors.mother_occupation}
                                    placeholder="e.g., Housewife"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Phone"
                                    value={data.mother_phone}
                                    onChange={(e) => setData({ ...data, mother_phone: e.target.value })}
                                    error={errors.mother_phone}
                                    placeholder="01700000000"
                                    icon={<Phone className="w-5 h-5" />}
                                />
                                <Input
                                    label="Mobile (Alt)"
                                    value={data.mother_mobile}
                                    onChange={(e) => setData({ ...data, mother_mobile: e.target.value })}
                                    error={errors.mother_mobile}
                                    placeholder="01800000000"
                                    icon={<Phone className="w-5 h-5" />}
                                />
                            </div>
                        </div>

                        {/* Guardian Information */}
                        <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">Legal Guardian (If Different)</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Guardian Name"
                                    value={data.guardian_name}
                                    onChange={(e) => setData({ ...data, guardian_name: e.target.value })}
                                    error={errors.guardian_name}
                                    placeholder="Guardian's full name"
                                />
                                <Input
                                    label="Guardian Phone"
                                    value={data.guardian_phone}
                                    onChange={(e) => setData({ ...data, guardian_phone: e.target.value })}
                                    error={errors.guardian_phone}
                                    placeholder="01700000000"
                                    icon={<Phone className="w-5 h-5" />}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                                    <select
                                        value={data.guardian_relation}
                                        onChange={(e) => setData({ ...data, guardian_relation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {addressData.guardianRelations.map(rel => (
                                            <option key={rel} value={rel}>{rel.charAt(0).toUpperCase() + rel.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previous Education & Medical */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Previous Education & Medical Information
                        </h3>

                        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">Previous Academic Background</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Previous School"
                                    value={data.previous_school}
                                    onChange={(e) => setData({ ...data, previous_school: e.target.value })}
                                    error={errors.previous_school}
                                    placeholder="School name"
                                />
                                <Input
                                    label="Previous Class"
                                    value={data.previous_class}
                                    onChange={(e) => setData({ ...data, previous_class: e.target.value })}
                                    error={errors.previous_class}
                                    placeholder="Class 9"
                                />
                                <Input
                                    label="Previous Exam Result"
                                    value={data.previous_exam_result}
                                    onChange={(e) => setData({ ...data, previous_exam_result: e.target.value })}
                                    error={errors.previous_exam_result}
                                    placeholder="GPA 5.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-600" />
                                Health & Medical Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                                    <textarea
                                        value={data.medical_conditions}
                                        onChange={(e) => setData({ ...data, medical_conditions: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Any chronic diseases, physical conditions, etc..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                    <textarea
                                        value={data.allergies}
                                        onChange={(e) => setData({ ...data, allergies: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Food allergies, medicine allergies, etc..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes / Requirements</label>
                                <textarea
                                    value={data.special_notes}
                                    onChange={(e) => setData({ ...data, special_notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Any special requirements, behavioral notes, or important information..."
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData({ ...data, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="passed">Passed</option>
                                    <option value="transferred">Transferred</option>
                                    <option value="dropped">Dropped</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            {/* Information Verification */}
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                                <input
                                    type="checkbox"
                                    id="information_correct"
                                    checked={data.information_correct}
                                    onChange={(e) => setData({ ...data, information_correct: e.target.checked })}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                />
                                <label htmlFor="information_correct" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    I confirm that all the information provided is correct and accurate
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pb-6">
                        <Button type="button" variant="ghost" onClick={() => router.visit('/students')}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            icon={<Save className="w-5 h-5" />}
                        >
                            {processing ? 'Creating...' : 'Create Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
