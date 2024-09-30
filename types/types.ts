// Database query only types

import { EditorState } from "lexical";

export type SubjectDetails = Array<{
  organisation_id: number;
  subject: Subject;
}>;

export type ClassDetails = {
  id: any;
  description: any;
  academic_year_end: any;
  year_group: any;
  organisation_id: any;
  class_student: Array<{
    student: Student;
    class_id: number;
    student_id: number;
    id: number;
  }>;
  class_subject: Array<{
    id: any;
    subject: Subject;
    class_subject_group: Array<ClassSubjectGroupStudent>;
  }>;
};

export type ClassSubjectGroupStudent = {
  id: number;
  group_comment: string | null;
  report_group: ReportGroup;
  class_subject_group_student: Array<{
    student: Student;
  }>;
};

// Database table interfaces

export interface Organisation {
  id: number;
  name: string;
  address1: string;
  address2: string;
  "town/city": string;
  postcode: string;
  tel_num: string;
}

export interface User {
  id: string;
  email?: string;
}

export interface UserInfo {
  uuid: string;
  role: string;
  organisation_id: number;
}

export interface UserInfoOrgData {
  uuid: string;
  role: string;
  organisation_id: Organisation;
}

export interface PreSaveClass {
  description: string;
  academic_year_end: number;
  year_group: string;
  organisation_id: number;
  owner?: string;
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

export interface StudentComment {
  id: number;
  student_id: number;
  student_comment: string;
  class_id: number;
  class_subject_group_id: {
    id: number;
    class_subject: { subject: { id: number; description: string } };
  };
  group_comment_updated: boolean;
  html_student_comment: string;
}

export interface CommentsByStudentIds {
  [key: number]: Array<StudentComment>;
}

export interface StudentsCommentsBySubject {
  [key: string]: { [key: number]: StudentComment | undefined };
}

//

export type PartialRecord<K extends keyof any, T> = {
  [P in K]: T;
};
