"use server";

import {
  getAuthenticatedUser,
  getUserInfoOrgData,
} from "@/utils/supabase/auth/authService";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { notFound } from "next/navigation";

import generateHeader from "@/utils/htmlTemplates/generateHeader";
import generateFooter from "@/utils/htmlTemplates/generateFooter";

import { logo as logoSvg } from "../../utils/assets/logo";

import {
  Student,
  StudentsCommentsBySubject,
  UserInfoOrgData,
} from "@/types/types";
interface StudentsHtmlReportData {
  studentId: number | undefined;
  studentName: string | undefined;
  htmlHeader: string | undefined;
  htmlComments: string | undefined;
  htmlFooter: string | undefined;
}

interface PdfArray {
  studentId: number;
  studentName: string;
  pdfBase64: string;
}

export async function saveAsPDFs(
  orgId: number,
  classId: number,
  className: string,
  classYearGroup: string,
  academicYearEnd: number,
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>,
  confirmedComments: StudentsCommentsBySubject
) {
  const userId = await getAuthenticatedUser();

  // Protect page, checking users' organisation matches that requested
  const userInfoData = await getUserInfoOrgData(userId);
  if (orgId !== userInfoData?.organisation_id.id) {
    notFound();
  }

  try {
    const allStudentReportsHtmlData = generateReportHtmlData(
      userInfoData,
      classStudents,
      className,
      classYearGroup,
      academicYearEnd,
      confirmedComments
    );

    const allStudentPdfReports = await generatePdfReports(
      allStudentReportsHtmlData
    );

    const supabaseUploadResults = await savePdfsToSupabase(
      orgId,
      classId,
      allStudentPdfReports
    );

    const successfulUploads = supabaseUploadResults.filter(
      (result) => !result.error
    );
    const unsuccessfulUploads = supabaseUploadResults.filter(
      (result) => result.error
    );

    return { successfulUploads, unsuccessfulUploads };
  } catch (error) {
    if (error instanceof Error)
      console.error("Error in saveAsPDFs:", error.message);
    else console.error("Error in saveAsPDFs", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

// Create Array of objects, each containing the data needed for the AWS Lambda function to create a PDF for one student
function generateReportHtmlData(
  userInfoOrgData: UserInfoOrgData,
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
  }>,
  className: string,
  classYearGroup: string,
  academicYearEnd: number,
  confirmedComments: StudentsCommentsBySubject
) {
  const allStudentReportsData: Array<StudentsHtmlReportData> = [];

  for (const studentId in confirmedComments) {
    const {
      name: schoolName,
      address1,
      address2,
      postcode,
      tel_num,
    } = userInfoOrgData.organisation_id;
    const schoolLogo = logoSvg(schoolName);

    const student =
      classStudents[
        classStudents.findIndex((s) => s.student_id === Number(studentId))
      ].student;
    const studentName = `${student.forename} ${student.surname}`;
    const studentComments = confirmedComments[studentId];

    // TODO: Update with additional comment, to be written into a fresh Lexical Editor on the pupil-comments page
    const htmlIntro = ` 
  <h4 style="font-family:verdana; font-size: 22px; color: #3a4a69; text-align: center">${studentName}</h4>
  <p>${student.forename} has performed well this term ....Introductory comments from an lexical editor to be added on the pupil-comments page.... In accumsan orci scelerisque dolor interdum ullamcorper. Cras sed orci tortor. Suspendisse a lobortis ligula. In fringilla nisi et ultricies facilisis. Donec elementum in dui quis facilisis. Sed mollis dignissim libero, rutrum aliquet orci euismod ac. Aenean mauris turpis, convallis sit amet mattis quis, dictum ac nunc. Pellentesque elementum vehicula nibh, vel ornare urna. Praesent mollis purus id lorem rhoncus imperdiet. Sed vel risus dolor. Proin quis interdum leo.</p>
  
  `;

    const htmlCommentArr: Array<string> = [htmlIntro];
    for (const item in studentComments) {
      const subjectHtml = `<h5 style="font-family:verdana; font-size: 18px; color: #3a4a69; text-align: left; margin: 0">
      ${
        studentComments[item]?.class_subject_group_id.class_subject.subject
          .description || ""
      }</h5>`;
      const studentCommentHtml =
        studentComments[item]?.html_student_comment || "";

      htmlCommentArr.push(`${subjectHtml}  ${studentCommentHtml}`);
    }

    const thisStudentPdfReportData: StudentsHtmlReportData = {
      studentId: student.id,
      studentName: studentName,
      htmlHeader: undefined,
      htmlComments: undefined,
      htmlFooter: undefined,
    };

    thisStudentPdfReportData.htmlComments = htmlCommentArr.join("<hr />");
    thisStudentPdfReportData.htmlHeader = generateHeader(
      schoolLogo,
      schoolName,
      className,
      classYearGroup,
      academicYearEnd
    );
    thisStudentPdfReportData.htmlFooter = generateFooter(
      schoolName,
      address1,
      address2,
      postcode,
      tel_num
    );

    allStudentReportsData.push(thisStudentPdfReportData);
  }

  return allStudentReportsData;
}

async function generatePdfReports(htmlData: Array<StudentsHtmlReportData>) {
  const response = await fetch(
    "https://50htzsk0hk.execute-api.eu-west-2.amazonaws.com/dev",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY || "",
      },
      body: JSON.stringify(htmlData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(`Error: ${data.error}`);
    throw new Error();
  }

  return data;
}

async function savePdfsToSupabase(
  orgId: number,
  classId: number,
  pdfArray: Array<PdfArray>
) {
  const supabase = createClient();

  const uploadPromises: Array<Promise<any>> = [];

  pdfArray.forEach((pdf: PdfArray) => {
    const { studentId, studentName, pdfBase64 } = pdf;
    const pdfFilename = studentId;

    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    uploadPromises.push(
      supabase.storage
        .from("class-pdf-reports")
        .upload(`${orgId}/${classId}/${pdfFilename}.pdf`, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        })
        .then((response) => ({
          ...response,
          studentId,
          studentName,
          pdfFilename,
        }))
        .catch((error) => {
          console.error(
            `Upload failed for student ${studentName}: ${error.message}`
          );
          return {
            //Object shaped to match successful uploads
            data: {
              path: null, // Field as per supabase fulfilled response.data: Explicitly set to null
              fullPath: null, // Field as per supabase fulfilled response.data: Explicitly set to null
            },
            error: error.message, // Field as per supabase fulfilled response.error. Include error message for caught errors
            studentId, // Add studentID
            studentName, // Add studentName
            pdfFilename, // Add pdfFilename
          };
        })
    );
  });

  return await Promise.all(uploadPromises);
}
