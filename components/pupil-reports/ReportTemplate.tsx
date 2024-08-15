"use client";

import Image from "next/image";

import { Organisation, Student, StudentComment } from "@/types/types";

import logo from "../../utils/assets/logo.svg";

const ReportTemplate = ({
  organisation,
  classByLine,
  selectedStudent,
  studentComments,
  classSubjectGroupsDict,
}: {
  organisation: Organisation;
  classByLine: string;
  selectedStudent: Student;
  studentComments: Array<StudentComment>;
  classSubjectGroupsDict: { [key: number]: string };
}) => {
  return (
    <article
      aria-label={`End of year report for ${selectedStudent.forename} ${selectedStudent.surname}`}
      className="a4-page relative md:w-3/4 border border-slate-500 aspect-[210/297] overflow-hidden"
    >
      <header className="w-full h-[20vh] md:h-[15vh] border-b-2 border-logo-blue flex items-center justify-start">
        {/* Logo */}
        <div className="relative h-[9.33vh] md:h-[7vh] w-[9.33vh] md:w-[7vh] ml-[1.33vw] md:ml-[1vw]">
          <Image
            src={logo}
            alt="Header Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        {/* Title Section */}
        <div className="flex flex-col flex-1 items-center justify-center h-full">
          <h4 className="text-[3.33vw] md:text-[2.5vw] font-bold text-logo-blue text-center leading-none">
            End Of Term Report
          </h4>
          <h5 className="text-[2.66vw] md:text-[2vw] font-bold text-logo-blue text-center leading-none">
            {`${selectedStudent.forename} ${selectedStudent.surname}`}
          </h5>
          <p className="text-[2vw] md:text-[1.5vw] text-logo-blue text-center leading-none">
            {classByLine}
          </p>
        </div>
      </header>
      {/* Report Content */}
      <div className="text-[2.66vw] md:p-[2vw]">
        {studentComments
          .filter((comment) => comment.student_id === selectedStudent.id)
          .map((comment) => {
            return (
              <section key={comment.id}>
                <h6 className="text-[2.66vw] md:text-[2vw] font-bold text-logo-blue text-center leading-none">
                  {classSubjectGroupsDict[comment.class_subject_group_id]}
                </h6>
              </section>
            );
          })}
      </div>

      <footer className="absolute bottom-0 w-full text-center">
        <p className="text-[1.33vw] p-[1.33vw] md:text-[1vw] md:p-[1vw]">
          {`${organisation.name} | ${organisation.address1}, ${
            organisation.address2 ? `${organisation.address2}, ` : ``
          } ${organisation["town/city"]}, ${organisation.postcode}`}
        </p>
      </footer>
    </article>
  );
};
export default ReportTemplate;
