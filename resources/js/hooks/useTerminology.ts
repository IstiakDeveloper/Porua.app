import { useInstitute } from './useInstitute';

export interface Terminology {
    instituteType: 'school' | 'coaching' | 'hybrid';
    isSchool: boolean;
    isCoaching: boolean;
    isHybrid: boolean;
    modeBadgeTitle: string;
    
    // Core Entity Labels
    classLabel: string;
    classesLabel: string;
    sectionLabel: string;
    sectionsLabel: string;
    sessionLabel: string;
    sessionsLabel: string;
    rollLabel: string;
    promotionLabel: string;
    subjectLabel: string;
    subjectsLabel: string;
    studentLabel: string;
    studentsLabel: string;
}

export function useTerminology(): Terminology {
    const institute = useInstitute();
    const instituteType = (institute.type || 'school') as 'school' | 'coaching' | 'hybrid';

    if (instituteType === 'coaching') {
        return {
            instituteType: 'coaching',
            isSchool: false,
            isCoaching: true,
            isHybrid: false,
            modeBadgeTitle: 'Coaching Mode',

            classLabel: 'Course / Program',
            classesLabel: 'Courses',
            sectionLabel: 'Batch',
            sectionsLabel: 'Batches',
            sessionLabel: 'Batch Session',
            sessionsLabel: 'Batch Sessions',
            rollLabel: 'Student ID',
            promotionLabel: 'Batch Transfer',
            subjectLabel: 'Subject / Paper',
            subjectsLabel: 'Subjects',
            studentLabel: 'Student',
            studentsLabel: 'Students',
        };
    }

    if (instituteType === 'hybrid') {
        return {
            instituteType: 'hybrid',
            isSchool: true,
            isCoaching: true,
            isHybrid: true,
            modeBadgeTitle: 'Hybrid (School & Coaching)',

            classLabel: 'Class / Course',
            classesLabel: 'Classes & Courses',
            sectionLabel: 'Section / Batch',
            sectionsLabel: 'Sections & Batches',
            sessionLabel: 'Academic Session',
            sessionsLabel: 'Academic Sessions',
            rollLabel: 'Roll / ID',
            promotionLabel: 'Promotions',
            subjectLabel: 'Subject',
            subjectsLabel: 'Subjects',
            studentLabel: 'Student',
            studentsLabel: 'Students',
        };
    }

    // Default: school
    return {
        instituteType: 'school',
        isSchool: true,
        isCoaching: false,
        isHybrid: false,
        modeBadgeTitle: 'School Mode',

        classLabel: 'Class',
        classesLabel: 'Classes',
        sectionLabel: 'Section',
        sectionsLabel: 'Sections',
        sessionLabel: 'Academic Year',
        sessionsLabel: 'Academic Years',
        rollLabel: 'Roll No',
        promotionLabel: 'Promotions',
        subjectLabel: 'Subject',
        subjectsLabel: 'Subjects',
        studentLabel: 'Student',
        studentsLabel: 'Students',
    };
}
