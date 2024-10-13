import { notFound } from "next/navigation";

import {
  getAuthenticatedUser,
  getUserInfo,
} from "@/utils/supabase/auth/authService";

import { createClient } from "@/utils/supabase/clients/serverClient";

import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";

import PupilReports from "@/components/pupil-reports/PupilReports";

const PupilReportsPage = async ({
  params: { id: classId },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();

  const userId = await getAuthenticatedUser();

  // Protect page, checking users' organisation matches that requested
  const userInfoData = await getUserInfo(userId);

  const classData = await getClassDetails(classId);

  if (classData?.organisation_id !== userInfoData?.organisation_id) {
    notFound();
  }

  const classSubjectGroupsDict = classData.class_subject.reduce(
    (accum, subject) => {
      const groups = subject.class_subject_group.map((group) => group.id);

      let subjectsByGroupId = groups.reduce((innerAccum, group) => {
        return { ...innerAccum, [group]: subject.subject.description };
      }, {});

      return { ...accum, ...subjectsByGroupId };
    },
    {}
  );

  const folderPath = `${classData?.organisation_id}/${classId}/`; // accessing organisation from classData and class from params

  const { data: pdfReports, error: pdfError } = await supabase.storage
    .from(`class-pdf-reports`)
    .list(folderPath, { limit: 40 });

  const signedUrls = await Promise.all(
    (pdfReports || []).map(async (report) => {
      const { data, error: urlError } = await supabase.storage
        .from(`class-pdf-reports/${folderPath}`)
        .createSignedUrl(report.name, 60 * 60); // URL valid for 1hr

      if (urlError) {
        console.error(
          `Error generating signed URL for ${report.name}: ${urlError}`
        );
        return null;
        // TODO: throw error when mapping through fetched reports and one is missing (see also pupilReports component)
      }

      return {
        id: report.name, // name of the report pdf file, which equals the id from class_student table
        signedUrl: data.signedUrl,
      };
    })
  );

  return (
    <div className="w-full md:m-8">
      <h1>Generated Pupil Reports</h1>
      <h2 className="text-center pb-4">
        {`${classData.description} Class (${classData.year_group} / ${classData.academic_year_end})`}
      </h2>
      <h3>
        Select individual pupils on left to view/print their generated report
      </h3>
      <PupilReports
        classStudents={classData.class_student}
        classSubjectGroupsDict={classSubjectGroupsDict}
        signedUrls={signedUrls}
      />
    </div>
  );
};

export default PupilReportsPage;
