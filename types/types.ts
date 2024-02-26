export interface Student {
  id: number;
  forename: string;
  surname: string;
  pronoun: string;
  dob: string;
  grad_year: number;
}

export type ClassReportGroup = {
  id: number;
  group_comment: string | null;
  report_group: object[];
  class: { description: any }[];
  class_subject: {
    subject: any[];
  }[];
  students?: Array<Student>;
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
