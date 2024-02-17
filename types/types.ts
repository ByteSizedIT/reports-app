export interface Student {
  id: number;
  forename: string;
  surname: string;
  pronoun: string;
  dob: string;
  grad_year: number;
}

export type Students = {
  students: Array<Student> | null;
};

export interface ReportGroup {
  id: number;
  description: string;
  organisation_id: number;
  "class_subject.id": number;
  students: Array<Student>;
}

export interface ClassSubjectGroup {
  id: number;
  description: string;
  organisation_id: number;
  report_groups: Array<ReportGroup>;
}
