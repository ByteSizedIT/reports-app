"use server";

import { createClient } from "@/utils/supabase/clients/serverClient";

import puppeteer from "puppeteer";

import { redirect } from "next/navigation";

import { Student, StudentsCommentsBySubject } from "@/types/types";

import { logo as logoSvg } from "../../utils/assets/logo";

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
      .select(
        `uuid, role_id, organisation_id(id, name, address1, address2, postcode, tel_num)`
      )
      .eq("uuid", user?.id)
      .returns<
        Array<{
          uuid: string;
          role_id: number;
          organisation_id: {
            id: number;
            name: string;
            address1: string;
            address2: string;
            postcode: string;
            tel_num: string;
          };
        }>
      >();

    const { data: userInfoData, error: userInfoError } = userInfoResponse;

    if (userInfoError) {
      console.error("Error fetching user info:", userInfoError.message);
      throw new Error("Failed to fetch user information.");
    }

    if (!userInfoData[0].organisation_id) {
      console.error("No user information found.");
      redirect("/login?error=user_info_missing");
    }

    if (orgId !== userInfoData[0]?.organisation_id.id) {
      redirect("/unauthorized");
    }

    // Create & Upload documents
    const uploadPromises: Array<Promise<any>> = [];

    for (const studentId in confirmedComments) {
      const {
        name: schoolName,
        address1,
        address2,
        postcode,
        tel_num,
      } = userInfoData[0].organisation_id;
      const schoolLogo = logoSvg(schoolName);

      const student =
        classStudents[
          classStudents.findIndex((s) => s.student_id === Number(studentId))
        ].student;

      const studentName = `${student.forename} ${student.surname}`;
      const studentComments = confirmedComments[studentId];

      // TODO: Update with additional comment, to be written into a fresh Lexical Editor on the pipil-comments page
      const htmlIntro = ` 
      <h4 style="font-family:verdana; font-size: 22px; color: #3a4a69; text-align: center">${studentName}</h4>
      <p>Comments from a lexical editor to be added .... In accumsan orci scelerisque dolor interdum ullamcorper. Cras sed orci tortor. Suspendisse a lobortis ligula. In fringilla nisi et ultricies facilisis. Donec elementum in dui quis facilisis. Sed mollis dignissim libero, rutrum aliquet orci euismod ac. Aenean mauris turpis, convallis sit amet mattis quis, dictum ac nunc. Pellentesque elementum vehicula nibh, vel ornare urna. Praesent mollis purus id lorem rhoncus imperdiet. Sed vel risus dolor. Proin quis interdum leo.</p>
      
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

      const htmlComments = htmlCommentArr.join("<hr />");

      // Generate the PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlComments);
      const pdfBuffer = await page.pdf({
        path: "document.pdf",
        format: "A4",
        displayHeaderFooter: true,
        headerTemplate: `
        <header style="
            width: 100%; 
            height: 100px; 
            border-bottom: 2px solid #3a4a69;
            font-family: Verdana, sans-serif;
            display: flex; 
            align-items: center;
            padding: 0 20px;
            ">
            ${schoolLogo}   
            <div style="
              display: flex; 
              flex: 1; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100%;">
              <h1 style="font-size: 24px; color: #3a4a69; text-align: center; margin: 0;">End of Year Report</h1>
              <h2 style="font-size: 18px; color: #3a4a69; text-align: center; margin: 0;">${schoolName}</h2>
               <h3 style="font-family:verdana; font-size: 18px; color: #3a4a69; text-align: center; margin: 0;">${className} | ${classYearGroup} | ${academicYearEnd}</h3>
            </div>
            <div style="font-size: 14px; color: #3a4a69; text-align: center; margin: 0; padding-right: 20px; font-weight: bold" >
              <p><span class="pageNumber"></span> / <span class="totalPages"></p>
            </div>
        </header>`,
        footerTemplate: `
            <footer style="font-size:12px; text-align:center; width:100%; font-family: Verdana, sans-serif; color: #3a4a69;">
              <p className="text-[1.33vw] p-[1.33vw] md:text-[1vw] md:p-[1vw]">
                 ${schoolName} | ${address1},  ${
          address2 ? address2 : ""
        }, ${postcode} | ☎ ${tel_num}
                   
              </p>
            </footer>`,
        margin: {
          top: "140px",
          bottom: "80px",
          left: "80px",
          right: "80px",
        },
      });
      await browser.close();

      const pdfFilename = `${studentId}`;

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
    }

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
