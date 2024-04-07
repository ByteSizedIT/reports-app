export type SubjectDetails = {
  organisation_id: number;
  subject: Subject;
}[];

export interface Subject {
  id: number;
  description: string;
}

export type ClassDetails = {
  id: any;
  description: any;
  academic_year_end: any;
  year_group: any;
  organisation_id: any;
  class_subject: {
    id: any;
    subject: Subject;
    class_subject_group: Array<ClassSubjectGroup>;
  }[];
}[];

export interface ClassSubjectGroup {
  id: number;
  group_comment: string | null;
  report_group: ReportGroup;
  class_subject_group_student: {
    student: Student;
  }[];
}

export interface ReportGroup {
  id: number;
  description: string;
  organisation_id: number;
}

export interface Student {
  id: number;
  dob: string;
  pronoun: string;
  surname: string;
  forename: string;
  grad_year: number;
  organisation_id: number;
}
