export interface Student {
  id: number;
  forename: string;
  surname: string;
  pronoun: string;
  dob: string;
  grad_year: number;
}

export type Class = {
  id: number;
  user_id: string;
  year_group: string;
  description: string;
  organisation_id: number;
  academic_year_end: number;
};

// export type ClassReportGroup = {
//   id: any;
//   group_comment: any;
//   report_group: any;
//   class_id: any;
//   class: any;
//   class_subject: { subject: any[] }[];
//   students?: Array<Student>;
// };

// export type ClassReportGroup = {
//   id: number;
//   group_comment: string | null;
//   report_group: object[];
//   class: Array<Class>;
//   class_subject: {
//     subject: any[];
//   }[];
//   students?: Array<Student>;
// };

export type ClassReportGroup = {
  id: number;
  group_comment: string | null;
  report_group: ReportGroup[];
  class: any;
  class_subject: {
    subject: { id: number; description: string }[];
  }[];
  students?: Array<Student>;
};

export interface ReportGroup {
  id: number;
  description: string;
  organisation_id: number;
  "class_subject.id"?: number;
  students: Array<Student>;
}

export interface ClassSubjectGroup {
  id: number;
  description: string;
  organisation_id: number;
  report_groups: Array<ReportGroup>;
}

////////

export type ReportGroupTableItem = {
  id?: number;
  description: string;
  organisation_id: number;
};

export type ReportGroupTableData = {
  ReportGroups: Array<ReportGroupTableItem>;
};
