"use client";

import Image from "next/image";

import { Organisation, Student } from "@/types/types";

import logo from "../../utils/assets/logo.svg";

const ReportTemplate = ({
  organisation,
  classByLine,
  selectedStudent,
}: {
  organisation: Organisation;
  classByLine: string;
  selectedStudent: Student;
}) => {
  return (
    <article
      aria-label={`End of year report for ${selectedStudent.forename} ${selectedStudent.surname}}`}
      className="relative md:w-3/4 border border-slate-500 aspect-[210/297]"
    >
      <header className="w-full h-[50mm] border-b-2 border-logo-blue flex items-center justify-start">
        <div className="relative w-full h-full max-w-[40mm] max-h-[40mm]">
          <Image
            src={logo}
            alt="Header Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <div className="flex flex-col flex-1 items-center h-full justify-center">
          <h4 className="text-5xl  font-bold text-logo-blue text-center pb-4">
            End Of Term Report
          </h4>
          <h5 className="text-4xl  font-bold text-logo-blue text-center">{`${selectedStudent.forename} ${selectedStudent.surname}`}</h5>
          <h6 className="text-2xl  text-logo-blue text-center">
            {classByLine}
          </h6>
        </div>
      </header>
      <section></section>
      <footer className="absolute bottom-0 w-full text-center">
        <p className="p-4">{`${organisation.name} | ${organisation.address1}, ${
          organisation.address2 ? `${organisation.address2}, ` : ``
        } ${organisation["town/city"]}, ${organisation.postcode}`}</p>
      </footer>
    </article>
  );
};
export default ReportTemplate;
