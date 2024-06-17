// Database query only types

export type SubjectDetails = Array<{
  organisation_id: number;
  subject: Subject;
}>;

export type ClassDetails = Array<{
  id: any;
  description: any;
  academic_year_end: any;
  year_group: any;
  organisation_id: any;
  class_student: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>;
  class_subject: Array<{
    id: any;
    subject: Subject;
    class_subject_group: Array<ClassSubjectGroupStudent>;
  }>;
}>;

export type ClassSubjectGroupStudent = {
  id: number;
  group_comment: string | null;
  report_group: ReportGroup;
  class_subject_group_student: Array<{
    student: Student;
  }>;
};

// Database table interfaces

export interface User {
  id: string;
  email?: string;
}

export interface UserInfo {
  uuid: string;
  role: string;
  organisation_id: number;
}

export interface PreSaveClass {
  description: string;
  academic_year_end: number;
  year_group: string;
  organisation_id: number;
  owner: string;
}

export type Class = PreSaveClass & { id: number };

export interface Subject {
  id: number;
  description: string;
  organisation_id?: number;
}

export interface OrganisationSubject {
  id: number;
  organisation_id: number;
  subject_id: number;
}

export interface ClassSubject {
  id: number;
  class_id: number;
  subject_id: number;
}

export interface ClassSubjectGroup {
  id: number;
  report_group_id: number;
  class_subject_id: number;
  group_comment: string | null;
}

export interface ReportGroup {
  id: number;
  description: string;
  organisation_id: number;
}

export interface PreSaveStudent {
  dob: string;
  pronoun: string;
  surname: string;
  forename: string;
  grad_year: number;
  organisation_id: number;
}

export interface newClassRegister {
  existingStudents: Array<Student | PreSaveStudent>;
  newStudents: Array<PreSaveStudent>;
}

export type Student = PreSaveStudent & { id: number };
