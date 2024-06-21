"use client";

export const PupilSubjectReport = ({
  item,
  index,
  studentComment,
}: {
  item: any;
  index: number;
  selectedPupil: number;
  studentComment: Array<string> | undefined;
}) => {
  return (
    <div key={item.id} className="border border-slate-500 rounded-md p-8">
      <h2>{item.subject.description}</h2>
      <p className="text-center">
        {item.class_subject_group?.[0]?.report_group?.description} report group{" "}
        {studentComment?.[index] ? "(edited for student)" : ""}
      </p>
    </div>
  );
};
