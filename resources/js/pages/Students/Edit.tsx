import React, { FormEvent, useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import FormPageHeader from '@/Components/FormPageHeader';
import FormCard from '@/Components/FormCard';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    GraduationCap,
    Calendar,
    Upload,
    Users,
    MapPin,
    FileText,
    Heart,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    BookOpen
} from 'lucide-react';
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
    fee_structures?: Array<{
        id: number;
        fee_type_id: number;
        academic_year_id?: number;
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
    status: string;
    information_correct: boolean;
    photo: string | null;
    photo_url: string | null;
    email?: string;
    phone?: string;
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface EditProps {
    student: Student;
    academicYears: AcademicYear[];
    classes: SchoolClass[];
    sections: Section[];
}

type TabKey = 'admission' | 'profile' | 'address' | 'family' | 'history';

export default function Edit({ student, academicYears, classes, sections: initialSections }: EditProps) {
    const [currentTab, setCurrentTab] = useState<TabKey>('admission');

    const [data, setData] = useState({
        academic_year_id: student.academic_year_id?.toString() || '',
        class_id: student.class_id?.toString() || '',
        section_id: student.section_id?.toString() || '',
        parent_id: student.parent_id?.toString() || '',
        admission_number: student.admission_number,
        student_id: student.student_id || '',
        form_number: student.form_number || '',
        monthly_fee: student.monthly_fee || '',
        roll_number: student.roll_number || '',
        admission_date: student.admission_date ? student.admission_date.split('T')[0] : '',
        name: student.user?.name || `${student.first_name} ${student.last_name}`,
        first_name: student.first_name,
        last_name: student.last_name,
        first_name_bengali: student.first_name_bengali || '',
        last_name_bengali: student.last_name_bengali || '',
        name_bn: student.name_bn || '',
        name_en: student.name_en || '',
        email: student.user?.email || student.email || '',
        phone: student.user?.phone || student.phone || '',
        date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
        birth_place_district: student.birth_place_district || 'Naogaon',
        gender: student.gender || 'male',
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
        father_dob: student.father_dob ? student.father_dob.split('T')[0] : '',
        father_occupation: student.father_occupation || '',
        father_dead: student.father_dead || false,
        mother_name: student.mother_name || '',
        mother_name_bn: student.mother_name_bn || '',
        mother_name_en: student.mother_name_en || '',
        mother_phone: student.mother_phone || '',
        mother_mobile: student.mother_mobile || '',
        mother_nid: student.mother_nid || '',
        mother_dob: student.mother_dob ? student.mother_dob.split('T')[0] : '',
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
        status: student.status || 'active',
        photo: null as File | null,
    });

    const [sections, setSections] = useState<Section[]>(initialSections || []);
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

    // Load sections when class changes
    useEffect(() => {
        if (data.class_id && data.class_id !== student.class_id?.toString()) {
            axios.get(`/students/sections/${data.class_id}`)
                .then(response => setSections(response.data))
                .catch(() => setSections([]));
        }
    }, [data.class_id]);

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
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const tabList: Array<{ id: TabKey; label: string; icon: string }> = [
        { id: 'admission', label: '1. Admission & Fees', icon: '🎓' },
        { id: 'profile', label: '2. Student Details', icon: '👤' },
        { id: 'address', label: '3. Address Records', icon: '📍' },
        { id: 'family', label: '4. Parents & Family', icon: '👨‍👩‍👧' },
        { id: 'history', label: '5. History & Health', icon: '🩺' },
    ];

    const currentTabIndex = tabList.findIndex(t => t.id === currentTab);

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Student - ${student.first_name} ${student.last_name}`} />

            <div className="space-y-4 max-w-5xl">
                {/* Standard Admin Header */}
                <FormPageHeader
                    title={`Edit ${student.first_name} ${student.last_name}`}
                    subtitle={`Admission: ${student.admission_number} • Roll: ${student.roll_number || 'N/A'}`}
                    backUrl="/students"
                    backLabel="Students"
                    badgeText={student.status}
                />

                {/* Stepper / Tab Switcher */}
                <div className="flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto select-none">
                    {tabList.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                                currentTab === tab.id
                                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* TAB 1: Admission & Fees */}
                    {currentTab === 'admission' && (
                        <div className="space-y-4">
                            <FormCard
                                title="Academic Placement"
                                description="Session, class, section, and status"
                                icon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Academic Year <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.academic_year_id}
                                            onChange={(e) => setData({ ...data, academic_year_id: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            {academicYears.map(year => (
                                                <option key={year.id} value={year.id}>{year.name}</option>
                                            ))}
                                        </select>
                                        {errors.academic_year_id && <p className="text-red-600 text-[11px] mt-0.5">{errors.academic_year_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Class <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.class_id}
                                            onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        {errors.class_id && <p className="text-red-600 text-[11px] mt-0.5">{errors.class_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Section <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.section_id}
                                            onChange={(e) => setData({ ...data, section_id: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                            required
                                        >
                                            <option value="">Select Section</option>
                                            {sections.map(section => (
                                                <option key={section.id} value={section.id}>{section.name}</option>
                                            ))}
                                        </select>
                                        {errors.section_id && <p className="text-red-600 text-[11px] mt-0.5">{errors.section_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Student Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData({ ...data, status: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="passed">Passed</option>
                                            <option value="transferred">Transferred</option>
                                            <option value="dropped">Dropped</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </FormCard>

                            <FormCard
                                title="Identifiers & Roll"
                                icon={<User className="w-4 h-4 text-indigo-600" />}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Admission Number</label>
                                        <input
                                            type="text"
                                            value={data.admission_number}
                                            readOnly
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Roll Number</label>
                                        <input
                                            type="text"
                                            value={data.roll_number}
                                            onChange={(e) => setData({ ...data, roll_number: e.target.value })}
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Admission Date</label>
                                        <input
                                            type="date"
                                            value={data.admission_date}
                                            onChange={(e) => setData({ ...data, admission_date: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Fee (৳)</label>
                                        <input
                                            type="text"
                                            value={data.monthly_fee}
                                            onChange={(e) => setData({ ...data, monthly_fee: e.target.value })}
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>
                        </div>
                    )}

                    {/* TAB 2: Student Details & Photo */}
                    {currentTab === 'profile' && (
                        <div className="space-y-4">
                            <FormCard
                                title="Personal Details"
                                description="Names, date of birth, and identity"
                                icon={<User className="w-4 h-4 text-slate-700" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.first_name}
                                            onChange={(e) => setData({ ...data, first_name: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.last_name}
                                            onChange={(e) => setData({ ...data, last_name: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Name in Bengali (বাংলা নাম)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name_bn}
                                            onChange={(e) => setData({ ...data, name_bn: e.target.value, first_name_bengali: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                                        <select
                                            value={data.gender}
                                            onChange={(e) => setData({ ...data, gender: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                                        <select
                                            value={data.blood_group}
                                            onChange={(e) => setData({ ...data, blood_group: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            <option value="">Select Blood Group</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Birth Certificate Number</label>
                                        <input
                                            type="text"
                                            value={data.birth_certificate_no}
                                            onChange={(e) => setData({ ...data, birth_certificate_no: e.target.value })}
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Religion</label>
                                        <select
                                            value={data.religion}
                                            onChange={(e) => setData({ ...data, religion: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            <option value="Islam">Islam</option>
                                            <option value="Hinduism">Hinduism</option>
                                            <option value="Buddhism">Buddhism</option>
                                            <option value="Christianity">Christianity</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Nationality</label>
                                        <input
                                            type="text"
                                            value={data.nationality}
                                            onChange={(e) => setData({ ...data, nationality: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>

                            <FormCard
                                title="Photo & Contact"
                                icon={<Upload className="w-4 h-4 text-indigo-600" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Change Photo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Student Phone</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData({ ...data, phone: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Student Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData({ ...data, email: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>
                        </div>
                    )}

                    {/* TAB 3: Address Records */}
                    {currentTab === 'address' && (
                        <div className="space-y-4">
                            <FormCard
                                title="Present Address"
                                icon={<MapPin className="w-4 h-4 text-slate-700" />}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Division</label>
                                        <select
                                            value={data.present_address_division}
                                            onChange={(e) => setData({ ...data, present_address_division: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            {addressData.divisions.map(div => <option key={div} value={div}>{div}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                                        <select
                                            value={data.present_address_district}
                                            onChange={(e) => setData({ ...data, present_address_district: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            {presentDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Upazila / Thana</label>
                                        <select
                                            value={data.present_address_upazila}
                                            onChange={(e) => setData({ ...data, present_address_upazila: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        >
                                            {presentUpazilas.map(upz => <option key={upz} value={upz}>{upz}</option>)}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Village / House / Road Details</label>
                                        <input
                                            type="text"
                                            value={data.present_address_village}
                                            onChange={(e) => setData({ ...data, present_address_village: e.target.value, present_address: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>

                            <FormCard
                                title="Permanent Address"
                                icon={<MapPin className="w-4 h-4 text-slate-700" />}
                                action={
                                    <label className="flex items-center gap-2 text-xs font-semibold text-indigo-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={sameAsPresentAddress}
                                            onChange={(e) => setSameAsPresentAddress(e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Same as Present Address
                                    </label>
                                }
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Division</label>
                                        <select
                                            disabled={sameAsPresentAddress}
                                            value={data.permanent_address_division}
                                            onChange={(e) => setData({ ...data, permanent_address_division: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white disabled:bg-slate-50"
                                        >
                                            {addressData.divisions.map(div => <option key={div} value={div}>{div}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                                        <select
                                            disabled={sameAsPresentAddress}
                                            value={data.permanent_address_district}
                                            onChange={(e) => setData({ ...data, permanent_address_district: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white disabled:bg-slate-50"
                                        >
                                            {permanentDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Upazila / Thana</label>
                                        <select
                                            disabled={sameAsPresentAddress}
                                            value={data.permanent_address_upazila}
                                            onChange={(e) => setData({ ...data, permanent_address_upazila: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white disabled:bg-slate-50"
                                        >
                                            {permanentUpazilas.map(upz => <option key={upz} value={upz}>{upz}</option>)}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Village / House / Road Details</label>
                                        <input
                                            type="text"
                                            disabled={sameAsPresentAddress}
                                            value={data.permanent_address_village}
                                            onChange={(e) => setData({ ...data, permanent_address_village: e.target.value, permanent_address: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white disabled:bg-slate-50"
                                        />
                                    </div>
                                </div>
                            </FormCard>
                        </div>
                    )}

                    {/* TAB 4: Parents & Family */}
                    {currentTab === 'family' && (
                        <div className="space-y-4">
                            <FormCard
                                title="Father's Records"
                                icon={<User className="w-4 h-4 text-slate-700" />}
                                action={
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.father_dead}
                                            onChange={(e) => setData({ ...data, father_dead: e.target.checked })}
                                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                        />
                                        Father Deceased
                                    </label>
                                }
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Father's Name (English)</label>
                                        <input
                                            type="text"
                                            value={data.father_name_en}
                                            onChange={(e) => setData({ ...data, father_name_en: e.target.value, father_name: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Father's Mobile</label>
                                        <input
                                            type="text"
                                            value={data.father_phone}
                                            onChange={(e) => setData({ ...data, father_phone: e.target.value, father_mobile: e.target.value })}
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Occupation</label>
                                        <input
                                            type="text"
                                            value={data.father_occupation}
                                            onChange={(e) => setData({ ...data, father_occupation: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>

                            <FormCard
                                title="Mother's Records"
                                icon={<User className="w-4 h-4 text-slate-700" />}
                                action={
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.mother_dead}
                                            onChange={(e) => setData({ ...data, mother_dead: e.target.checked })}
                                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                        />
                                        Mother Deceased
                                    </label>
                                }
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Mother's Name (English)</label>
                                        <input
                                            type="text"
                                            value={data.mother_name_en}
                                            onChange={(e) => setData({ ...data, mother_name_en: e.target.value, mother_name: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Mother's Mobile</label>
                                        <input
                                            type="text"
                                            value={data.mother_phone}
                                            onChange={(e) => setData({ ...data, mother_phone: e.target.value, mother_mobile: e.target.value })}
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Occupation</label>
                                        <input
                                            type="text"
                                            value={data.mother_occupation}
                                            onChange={(e) => setData({ ...data, mother_occupation: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>

                            <FormCard
                                title="Legal Guardian (Optional)"
                                icon={<Users className="w-4 h-4 text-slate-700" />}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Name</label>
                                        <input
                                            type="text"
                                            value={data.guardian_name}
                                            onChange={(e) => setData({ ...data, guardian_name: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Phone</label>
                                        <input
                                            type="text"
                                            value={data.guardian_phone}
                                            onChange={(e) => setData({ ...data, guardian_phone: e.target.value })}
                                            className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
                                        <input
                                            type="text"
                                            value={data.guardian_relation}
                                            onChange={(e) => setData({ ...data, guardian_relation: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>
                        </div>
                    )}

                    {/* TAB 5: History & Health */}
                    {currentTab === 'history' && (
                        <div className="space-y-4">
                            <FormCard
                                title="Previous School & Academics"
                                icon={<BookOpen className="w-4 h-4 text-slate-700" />}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Previous School</label>
                                        <input
                                            type="text"
                                            value={data.previous_school}
                                            onChange={(e) => setData({ ...data, previous_school: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Previous Class</label>
                                        <input
                                            type="text"
                                            value={data.previous_class}
                                            onChange={(e) => setData({ ...data, previous_class: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Previous Result / GPA</label>
                                        <input
                                            type="text"
                                            value={data.previous_exam_result}
                                            onChange={(e) => setData({ ...data, previous_exam_result: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>

                            <FormCard
                                title="Health & Medical Alerts"
                                icon={<Heart className="w-4 h-4 text-rose-600" />}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Medical Conditions</label>
                                        <input
                                            type="text"
                                            value={data.medical_conditions}
                                            onChange={(e) => setData({ ...data, medical_conditions: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Allergies</label>
                                        <input
                                            type="text"
                                            value={data.allergies}
                                            onChange={(e) => setData({ ...data, allergies: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Special Staff Notes</label>
                                        <input
                                            type="text"
                                            value={data.special_notes}
                                            onChange={(e) => setData({ ...data, special_notes: e.target.value })}
                                            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                                        />
                                    </div>
                                </div>
                            </FormCard>
                        </div>
                    )}

                    {/* Navigation Buttons Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        {currentTabIndex > 0 ? (
                            <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() => setCurrentTab(tabList[currentTabIndex - 1].id)}
                                icon={<ChevronLeft className="w-4 h-4" />}
                            >
                                Previous Step
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            {currentTabIndex < tabList.length - 1 ? (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setCurrentTab(tabList[currentTabIndex + 1].id)}
                                >
                                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : null}

                            <Button
                                size="sm"
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                                icon={processing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            >
                                {processing ? 'Saving Changes...' : 'Update Student'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
