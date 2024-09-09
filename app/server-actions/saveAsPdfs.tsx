"use server";

// This server action generates PDF documents for each student report, returning the resulting PDF as a byte array (pdfBytes).
// It uses the pdf-lib library to create pages, add headers, and paginate the content if it doesn’t fit on a single page.

import { createClient } from "@/utils/supabase/clients/serverClient";

import { PDFDocument, rgb } from "pdf-lib";

import { redirect } from "next/navigation";

import { Student, StudentsCommentsBySubject } from "@/types/types";

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
  const supabase = createClient();

  try {
    // Check User is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.warn(
        "No user found or user is not authenticated",
        userError.message
      );
      throw new Error("Failed to fetch user information.");
    }

    // Protect page, checking users's organisation matches that requested
    const userInfoResponse = await supabase
      .from("user_info")
      .select(`uuid, role_id, organisation_id(id, name)`)
      .eq("uuid", user?.id)
      .returns<
        Array<{
          uuid: string;
          role_id: number;
          organisation_id: { id: number; name: string };
        }>
      >();

    const { data: userInfoData, error: userInfoError } = userInfoResponse;

    if (userInfoError) {
      console.error("Error fetching user info:", userInfoError.message);
      throw new Error("Failed to fetch user information.");
    }

    if (!userInfoData[0].organisation_id) {
      console.error("No user information found.");
      redirect("/login?error=user_info_missing"); // Redirect with a specific error message
    }

    if (orgId !== userInfoData[0]?.organisation_id.id) {
      redirect("/unauthorized");
    }

    // Create & Upload documents
    const uploadPromises: Array<Promise<any>> = [];

    for (const studentId in confirmedComments) {
      const pdfDoc = await PDFDocument.create();

      const schoolName = userInfoData[0].organisation_id.name;

      const student =
        classStudents[
          classStudents.findIndex((s) => s.student_id === Number(studentId))
        ].student;

      const studentName = `${student.surname}, ${student.forename}`;
      const studentComments = confirmedComments[studentId];
      const header = `${schoolName} | ${className} | ${studentName} | ${classYearGroup} | ${academicYearEnd}`;

      const subjectEntries = [];
      // for (const classGroupId in studentsClassGroups) {
      for (const item in studentComments) {
        const subject =
          studentComments[item]?.class_subject_group_id.class_subject.subject
            .description || "";
        const studentComment = studentComments[item]?.student_comment || "";
        subjectEntries.push({ subject, studentComment });
      }

      await addTextWithPagination(pdfDoc, header, subjectEntries);

      const pdfBytes = await pdfDoc.save(); // Saves the PDF to a buffer, returns pdfBytes
      const pdfFilename = `${studentId}`;

      uploadPromises.push(
        supabase.storage
          .from("class-pdf-reports")
          .upload(`${orgId}/${classId}/${pdfFilename}.pdf`, pdfBytes)
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
    }

    //   // **********
    //   // TESTING ERROR HANDLING: Mimicking a Promise Resolving with an Error Property
    //   const randomNumber = Math.random();

    //   uploadPromises[0] = new Promise((resolve) => {
    //     resolve({
    //       data: { path: null, fullPath: null },
    //       error: randomNumber ? "Simulated upload error" : null, // Include error message for failed uploads
    //       studentId: "60",
    //       studentName: "Maximoff, Wanda",
    //       pdfFilename: 60,
    //       key: 0,
    //     });
    //   });
    //   // **********

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result) => !result.error);
    const unsuccessfulUploads = results.filter((result) => result.error);

    return { successfulUploads, unsuccessfulUploads };
  } catch (error) {
    if (error instanceof Error)
      console.error("Error in saveAsPDFs:", error.message);
    else console.error("Error in saveAsPDFs", error);
    throw error; // Re-throw the error to be handled by the calling function`
  }
}

async function addTextWithPagination(
  pdfDoc: PDFDocument,
  header: string,
  contentArray: Array<{ subject: string; studentComment: string }>,
  margin = 50
) {
  const pageWidth = 595; // A4 width in points
  const pageHeight = 842; // A4 height in points

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;

  const draw = (text: string, fontSize = 12, bottomPadding = fontSize) => {
    // yPosition -= topPadding
    currentPage.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= bottomPadding;
  };

  draw(header, 18, 36);

  for (const item of contentArray) {
    draw(item.subject, 16, 24);
    draw(item.studentComment, 12, 36);
  }
}
