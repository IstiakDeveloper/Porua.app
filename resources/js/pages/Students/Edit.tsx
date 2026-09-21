import React, { FormEvent, useState, useEffect } from 'react';
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
    fee_amount?: number;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    user_id: number;
    academic_year_id: number;
    class_id: number;
    section_id: number;
    parent_id: number | null;
    admission_number: string;
    student_id: string | null;
    form_number: string | null;
    monthly_fee: string | null;
    roll_number: string | null;
    admission_date: string;
    first_name: string;
    last_name: string;
    first_name_bengali: string | null;
    last_name_bengali: string | null;
    name_bn: string | null;
    name_en: string | null;
    date_of_birth: string;
    birth_place_district: string | null;
    gender: string;
    blood_group: string | null;
    birth_certificate_no: string | null;
    birth_certificate_number: string | null;
    religion: string | null;
    nationality: string | null;
    minorities: boolean;
    minority_name: string | null;
    handicap: string | null;
    present_address: string | null;
    present_address_division: string | null;
    present_address_district: string | null;
    present_address_upazila: string | null;
    present_address_city: string | null;
    present_address_ward: string | null;
    present_address_village: string | null;
    present_address_house_number: string | null;
    present_address_post: string | null;
    present_address_post_code: string | null;
    permanent_address: string | null;
    permanent_address_division: string | null;
    permanent_address_district: string | null;
    permanent_address_upazila: string | null;
    permanent_address_city: string | null;
    permanent_address_ward: string | null;
    permanent_address_village: string | null;
    permanent_address_house_number: string | null;
    permanent_address_post: string | null;
    permanent_address_post_code: string | null;
    father_name: string | null;
    father_name_bn: string | null;
    father_name_en: string | null;
    father_phone: string | null;
    father_mobile: string | null;
    father_nid: string | null;
    father_dob: string | null;
    father_occupation: string | null;
    father_dead: boolean;
    mother_name: string | null;
    mother_name_bn: string | null;
    mother_name_en: string | null;
    mother_phone: string | null;
    mother_mobile: string | null;
    mother_nid: string | null;
    mother_dob: string | null;
    mother_occupation: string | null;
    mother_dead: boolean;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    previous_school: string | null;
    previous_class: string | null;
    previous_exam_result: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    special_notes: string | null;
    information_correct: boolean;
    photo: string | null;
    photo_url?: string | null;
    status: string;
    email: string;
    phone: string | null;
    user?: {
        name: string;
        email: string;
        phone: string | null;
    };
}

interface EditProps {
    student: Student;
    academicYears: AcademicYear[];
    classes: SchoolClass[];
    sections: Section[];
}

export default function Edit({ student, academicYears, classes, sections: initialSections }: EditProps) {
    const [data, setData] = useState({
        academic_year_id: student.academic_year_id.toString(),
        class_id: student.class_id.toString(),
        section_id: student.section_id.toString(),
        parent_id: student.parent_id?.toString() || '',
        admission_number: student.admission_number,
        student_id: student.student_id || '',
        form_number: student.form_number || '',
        monthly_fee: student.monthly_fee || '',
        roll_number: student.roll_number || '',
        admission_date: student.admission_date.split('T')[0],
        name: student.user?.name || `${student.first_name} ${student.last_name}`,
        first_name: student.first_name,
        last_name: student.last_name,
        first_name_bengali: student.first_name_bengali || '',
        last_name_bengali: student.last_name_bengali || '',
        name_bn: student.name_bn || '',
        name_en: student.name_en || '',
        email: student.user?.email || student.email,
        phone: student.user?.phone || student.phone || '',
        date_of_birth: student.date_of_birth.split('T')[0],
        birth_place_district: student.birth_place_district || 'Naogaon',
        gender: student.gender,
        blood_group: student.blood_group || '',
        birth_certificate_no: student.birth_certificate_no || '',
        birth_certificate_number: student.birth_certificate_number || '',
        religion: student.religion || 'Islam',
        nationality: student.nationality || 'Bangladeshi',
        minorities: student.minorities || false,
        minority_name: student.minority_name || '',
        handicap: student.handicap || '',
        present_address: student.present_address || '',
        present_address_division: student.present_address_division || 'Rajshahi',
        present_address_district: student.present_address_district || 'Naogaon',
        present_address_upazila: student.present_address_upazila || 'Naogaon Sadar',
        present_address_city: student.present_address_city || '',
        present_address_ward: student.present_address_ward || '',
        present_address_village: student.present_address_village || '',
        present_address_house_number: student.present_address_house_number || '',
        present_address_post: student.present_address_post || '',
        present_address_post_code: student.present_address_post_code || '',
        permanent_address: student.permanent_address || '',
        permanent_address_division: student.permanent_address_division || 'Rajshahi',
        permanent_address_district: student.permanent_address_district || 'Naogaon',
        permanent_address_upazila: student.permanent_address_upazila || 'Naogaon Sadar',
        permanent_address_city: student.permanent_address_city || '',
        permanent_address_ward: student.permanent_address_ward || '',
        permanent_address_village: student.permanent_address_village || '',
        permanent_address_house_number: student.permanent_address_house_number || '',
        permanent_address_post: student.permanent_address_post || '',
        permanent_address_post_code: student.permanent_address_post_code || '',
        father_name: student.father_name || '',
        father_name_bn: student.father_name_bn || '',
        father_name_en: student.father_name_en || '',
        father_phone: student.father_phone || '',
        father_mobile: student.father_mobile || '',
        father_nid: student.father_nid || '',
        father_dob: student.father_dob?.split('T')[0] || '',
        father_occupation: student.father_occupation || '',
        father_dead: student.father_dead || false,
        mother_name: student.mother_name || '',
        mother_name_bn: student.mother_name_bn || '',
        mother_name_en: student.mother_name_en || '',
        mother_phone: student.mother_phone || '',
        mother_mobile: student.mother_mobile || '',
        mother_nid: student.mother_nid || '',
        mother_dob: student.mother_dob?.split('T')[0] || '',
        mother_occupation: student.mother_occupation || '',
        mother_dead: student.mother_dead || false,
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        guardian_relation: student.guardian_relation || 'father',
        previous_school: student.previous_school || '',
        previous_class: student.previous_class || '',
        previous_exam_result: student.previous_exam_result || '',
        medical_conditions: student.medical_conditions || '',
        allergies: student.allergies || '',
        special_notes: student.special_notes || '',
        information_correct: student.information_correct || false,
        status: student.status,
        photo: null as File | null,
    });

    const [sections, setSections] = useState<Section[]>(initialSections);
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(student.photo_url || null);
    const [sameAsPresentAddress, setSameAsPresentAddress] = useState(false);
    const [presentDistricts, setPresentDistricts] = useState<string[]>(
        addressData.districtsByDivision[(student.present_address_division || 'Rajshahi') as keyof typeof addressData.districtsByDivision] || []
    );
    const [presentUpazilas, setPresentUpazilas] = useState<string[]>(
        addressData.upazilasByDistrict[(student.present_address_district || 'Naogaon') as keyof typeof addressData.upazilasByDistrict] || []
    );
    const [permanentDistricts, setPermanentDistricts] = useState<string[]>(
        addressData.districtsByDivision[(student.permanent_address_division || 'Rajshahi') as keyof typeof addressData.districtsByDivision] || []
    );
    const [permanentUpazilas, setPermanentUpazilas] = useState<string[]>(
        addressData.upazilasByDistrict[(student.permanent_address_district || 'Naogaon') as keyof typeof addressData.upazilasByDistrict] || []
    );

    // Load sections and fee when class changes
    useEffect(() => {
        if (data.class_id) {
            console.log('Class selected:', data.class_id);
            console.log('Available classes:', classes);

            // Load sections
            axios.get(`/students/sections/${data.class_id}`)
                .then(response => setSections(response.data))
                .catch(() => setSections([]));

            // Load class fee
            const selectedClass = classes.find(c => c.id.toString() === data.class_id);
            console.log('Selected class:', selectedClass);

            if (selectedClass?.fee_amount) {
                console.log('Setting fee:', selectedClass.fee_amount);
                setData(prev => ({ ...prev, monthly_fee: selectedClass.fee_amount!.toString() }));
            } else {
                console.log('No fee found for this class');
                setData(prev => ({ ...prev, monthly_fee: '' }));
            }
        } else {
            setSections([]);
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
        formData.append('_method', 'PUT');
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo') {
                // Only append if new photo is selected
                if (value) {
                    formData.append(key, value as File);
                }
            } else if (value !== null && value !== '' && typeof value !== 'boolean') {
                formData.append(key, value.toString());
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            }
        });

        router.post(`/students/${student.id}`, formData, {
            forceFormData: true,
            preserveScroll: true,
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
            <Head title="Edit Student" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/students')}>
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Edit Student
                        </h1>
                        <p className="text-gray-600 mt-1">Update student information - {student.first_name} {student.last_name} ({student.admission_number})</p>
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
                            <Input
                                label="Admission Number *"
                                value={data.admission_number}
                                onChange={(e) => setData({ ...data, admission_number: e.target.value })}
                                error={errors.admission_number}
                                required
                                placeholder="ADM2024001"
                            />
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Fee</label>
                                <input
                                    type="text"
                                    value={data.monthly_fee ? `৳ ${data.monthly_fee}` : 'Select class first'}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 font-semibold cursor-not-allowed"
                                />
                                {errors.monthly_fee && <p className="text-red-600 text-sm mt-1">{errors.monthly_fee}</p>}
                            </div>
                        </div>
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
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Address Information
                        </h3>

                        {/* Present Address */}
                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">Present Address</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                                    <select
                                        value={data.present_address_division}
                                        onChange={(e) => setData({ ...data, present_address_division: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {addressData.divisions.map(div => (
                                            <option key={div} value={div}>{div}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                                    <select
                                        value={data.present_address_district}
                                        onChange={(e) => setData({ ...data, present_address_district: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {presentDistricts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upazila/Thana</label>
                                    <select
                                        value={data.present_address_upazila}
                                        onChange={(e) => setData({ ...data, present_address_upazila: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="City/Municipality"
                                    value={data.present_address_city}
                                    onChange={(e) => setData({ ...data, present_address_city: e.target.value })}
                                    error={errors.present_address_city}
                                    placeholder="City name"
                                />
                                <Input
                                    label="Ward No."
                                    value={data.present_address_ward}
                                    onChange={(e) => setData({ ...data, present_address_ward: e.target.value })}
                                    error={errors.present_address_ward}
                                    placeholder="Ward number"
                                />
                                <Input
                                    label="Village/Area"
                                    value={data.present_address_village}
                                    onChange={(e) => setData({ ...data, present_address_village: e.target.value })}
                                    error={errors.present_address_village}
                                    placeholder="Village or area name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="House/Road No."
                                    value={data.present_address_house_number}
                                    onChange={(e) => setData({ ...data, present_address_house_number: e.target.value })}
                                    error={errors.present_address_house_number}
                                    placeholder="House #, Road #"
                                />
                                <Input
                                    label="Post Office"
                                    value={data.present_address_post}
                                    onChange={(e) => setData({ ...data, present_address_post: e.target.value })}
                                    error={errors.present_address_post}
                                    placeholder="Post office name"
                                />
                                <Input
                                    label="Post Code"
                                    value={data.present_address_post_code}
                                    onChange={(e) => setData({ ...data, present_address_post_code: e.target.value })}
                                    error={errors.present_address_post_code}
                                    placeholder="6500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address (Optional)</label>
                                <textarea
                                    value={data.present_address}
                                    onChange={(e) => setData({ ...data, present_address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Complete address in one line..."
                                />
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
                        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900">Permanent Address</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                                    <select
                                        value={data.permanent_address_division}
                                        onChange={(e) => setData({ ...data, permanent_address_division: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={sameAsPresentAddress}
                                    >
                                        {addressData.divisions.map(div => (
                                            <option key={div} value={div}>{div}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                                    <select
                                        value={data.permanent_address_district}
                                        onChange={(e) => setData({ ...data, permanent_address_district: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={sameAsPresentAddress}
                                    >
                                        {permanentDistricts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upazila/Thana</label>
                                    <select
                                        value={data.permanent_address_upazila}
                                        onChange={(e) => setData({ ...data, permanent_address_upazila: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={sameAsPresentAddress}
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="City/Municipality"
                                    value={data.permanent_address_city}
                                    onChange={(e) => setData({ ...data, permanent_address_city: e.target.value })}
                                    error={errors.permanent_address_city}
                                    placeholder="City name"
                                    disabled={sameAsPresentAddress}
                                />
                                <Input
                                    label="Ward No."
                                    value={data.permanent_address_ward}
                                    onChange={(e) => setData({ ...data, permanent_address_ward: e.target.value })}
                                    error={errors.permanent_address_ward}
                                    placeholder="Ward number"
                                    disabled={sameAsPresentAddress}
                                />
                                <Input
                                    label="Village/Area"
                                    value={data.permanent_address_village}
                                    onChange={(e) => setData({ ...data, permanent_address_village: e.target.value })}
                                    error={errors.permanent_address_village}
                                    placeholder="Village or area name"
                                    disabled={sameAsPresentAddress}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="House/Road No."
                                    value={data.permanent_address_house_number}
                                    onChange={(e) => setData({ ...data, permanent_address_house_number: e.target.value })}
                                    error={errors.permanent_address_house_number}
                                    placeholder="House #, Road #"
                                    disabled={sameAsPresentAddress}
                                />
                                <Input
                                    label="Post Office"
                                    value={data.permanent_address_post}
                                    onChange={(e) => setData({ ...data, permanent_address_post: e.target.value })}
                                    error={errors.permanent_address_post}
                                    placeholder="Post office name"
                                    disabled={sameAsPresentAddress}
                                />
                                <Input
                                    label="Post Code"
                                    value={data.permanent_address_post_code}
                                    onChange={(e) => setData({ ...data, permanent_address_post_code: e.target.value })}
                                    error={errors.permanent_address_post_code}
                                    placeholder="6500"
                                    disabled={sameAsPresentAddress}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address (Optional)</label>
                                <textarea
                                    value={data.permanent_address}
                                    onChange={(e) => setData({ ...data, permanent_address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Complete address in one line..."
                                    disabled={sameAsPresentAddress}
                                />
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
                            {processing ? 'Updating...' : 'Update Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
