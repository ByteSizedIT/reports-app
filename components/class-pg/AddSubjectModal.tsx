"use client";

import { useState } from "react";

import CreatableSelect from "react-select/creatable";

import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";
import ModalOuter from "../modal-parent-components/ModalOuter";

import {
  SubjectDetails,
  ClassDetails,
  Subject,
  OrganisationSubject,
  ClassSubject,
  ClassSubjectGroup,
  ReportGroup,
} from "@/types/types";

import { supabaseBrowserClient } from "../../utils/supabase/client";

const AddSubjectModal = ({
  organisationSubjectDataState,
  updateOrganisationSubjectDataState,
  organisationReportGroupData,
  updateShowSubjectModal,
  classDataState,
  updateClassDataState,
  updateDisplayedSubjectId,
}: {
  organisationSubjectDataState: SubjectDetails | [];
  updateOrganisationSubjectDataState: (newData: SubjectDetails) => void;
  organisationReportGroupData: Array<ReportGroup> | null;
  updateShowSubjectModal: (bool: boolean) => void;
  classDataState: ClassDetails;
  updateClassDataState: (newData: ClassDetails) => void;
  updateDisplayedSubjectId: (id: number) => void;
}) => {
  const [newSubject, setNewSubject] = useState<boolean>(false);
  const [subject, setSubject] = useState<{
    label: string;
    value: Subject;
  } | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<
    Array<{ label: string; value: Subject }>
  >(
    organisationSubjectDataState // Subjects associated with organisation on Supabase
      ?.map((item) => ({
        label: item?.subject?.description,
        value: {
          id: item?.subject?.id,
          description: item?.subject?.description,
        },
      }))
      // Filter out subjects that are already used by this class
      .filter((option) => {
        const classSubjects = classDataState[0].class_subject.map(
          (classSubject) => classSubject.subject.id
        );
        return !classSubjects.includes(option.value.id);
      }) || []
  );

  const organisationClassRegisterReportGroup =
    organisationReportGroupData?.sort((a, b) => a.id - b.id)[0];

  const supabase = supabaseBrowserClient();

  async function handleSaveSubject() {
    if (newSubject && subject) {
      await checkSubjectInSupabase();
    } else if (!newSubject && subject) {
      await insertClassSubjectInSupabase({
        id: subject.value.id,
        description: subject.label,
      });
    }
    updateShowSubjectModal(false);
  }

  function addToOrganisationSubjectDataState(insertedSubjectData: Subject) {
    const copyOrganisationSubjectState: SubjectDetails | [] = [
      ...organisationSubjectDataState,
      {
        organisation_id: classDataState[0].organisation_id,
        subject: { ...insertedSubjectData },
      },
    ];
    updateOrganisationSubjectDataState(copyOrganisationSubjectState);
  }

  async function updateState(
    insertedSubjectData: Subject,
    insertedClassSubjectData: ClassSubject,
    insertedOrganisationSubjectData?: OrganisationSubject
  ) {
    // Fetch data for given class
    const classQuery = supabase
      .from("class")
      .select(
        `
    id, 
    description, 
    academic_year_end, 
    year_group, 
    organisation_id,
    class_student(*),
    class_subject(
      id, 
      subject(*),
      class_subject_group(
        id,
        group_comment, 
        report_group(*),
        class_subject_group_student(
          student(*)
        )
      )
    )
      `
      )
      .eq("id", classDataState?.[0].id)
      .returns<ClassDetails>();
    // type ClassSubjectGroups = QueryData<typeof classQuery>;
    const { data: classData, error } = await classQuery;
    // TODO: add error handling

    if (classData) updateClassDataState(classData);
    if (insertedOrganisationSubjectData)
      addToOrganisationSubjectDataState(insertedSubjectData);
    updateDisplayedSubjectId(insertedClassSubjectData.id);
  }

  async function insertClassStudentRegister(
    insertedSubjectData: Subject,
    insertedClassSubjectData: ClassSubject,
    insertedClassSubjectGroupData: ClassSubjectGroup,
    insertedOrganisationSubjectData?: OrganisationSubject
  ) {
    let classStudents = classDataState[0].class_student.map((student) => ({
      student_comment: null,
      class_subject_group_id: insertedClassSubjectGroupData.id,
      student_id: student.student_id,
    }));
    try {
      const { data: insertedClassSubjectGroupStudentData } = await supabase
        .from("class_subject_group_student")
        .insert(classStudents)
        .select();
      updateState(
        insertedSubjectData,
        insertedClassSubjectData,
        insertedOrganisationSubjectData
      );
    } catch (error) {
      console.error(
        `Error occurred adding students for ${
          subject?.label
        } to class_student table in Supabase: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }

  async function insertClassSubjectReportGroup(
    insertedSubjectData: Subject,
    insertedClassSubjectData: ClassSubject,
    insertedOrganisationSubjectData?: OrganisationSubject
  ) {
    try {
      const { data: insertedClassSubjectGroupData } = await supabase
        .from("class_subject_group")
        .insert({
          group_comment: null,
          class_subject_id: insertedClassSubjectData.id,
          report_group_id: organisationClassRegisterReportGroup?.id,
        })
        .select()
        .single();

      insertClassStudentRegister(
        insertedSubjectData,
        insertedClassSubjectData,
        insertedClassSubjectGroupData,
        insertedOrganisationSubjectData
      );
    } catch (error) {
      console.error(
        `Error occurred adding ${
          subject?.label
        } to class_subject_group table in Supabase: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }

  async function insertClassSubjectInSupabase(
    insertedSubjectData: Subject,
    insertedOrganisationSubjectData?: OrganisationSubject
  ) {
    try {
      const { data: insertedClassSubjectData } = await supabase
        .from("class_subject")
        .insert({
          class_id: classDataState[0].id,
          subject_id: insertedSubjectData.id,
        })
        .select()
        .single();
      insertClassSubjectReportGroup(
        insertedSubjectData,
        insertedClassSubjectData,
        insertedOrganisationSubjectData
      );
    } catch (error) {
      console.error(
        `Error occurred adding ${
          subject?.label
        } to class_subject table in Supabase: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }

  async function insertOrganisationSubjectInSupabase(
    insertedSubjectData: Subject
  ) {
    try {
      const { data: insertedOrganisationSubjectData } = await supabase
        .from("organisation_subject")
        .insert({
          organisation_id: classDataState[0].organisation_id,
          subject_id: insertedSubjectData.id,
        })
        .select()
        .single();
      insertClassSubjectInSupabase(
        insertedSubjectData,
        insertedOrganisationSubjectData
      );
    } catch (error) {
      console.error(
        `Error occurred adding ${
          subject?.label
        } to organisation_subject table in Supabase: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }

  async function insertSubjectInSupabase() {
    try {
      const { data: insertedSubjectData } = await supabase
        .from("subject")
        .insert({ description: subject?.label })
        .select()
        .single();
      insertOrganisationSubjectInSupabase(insertedSubjectData);
    } catch (error) {
      console.error(
        `Error occurred adding ${
          subject?.label
        } to subject table in Supabase: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }

  async function checkSubjectInSupabase() {
    try {
      const { data: existingItems } = await supabase
        .from("subject")
        .select("*")
        .eq("description", subject?.label);

      // If the subject doesn't exist at all, insert it in to Subjects table
      if (!existingItems?.length) {
        insertSubjectInSupabase();
      } else {
        insertOrganisationSubjectInSupabase(existingItems[0]);
      }
    } catch (error) {
      console.error(
        `Error occurred checking ${
          subject?.label
        } in subject table within Supabase: ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  }

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    const newSubject: { label: string; value: Subject } = {
      label: inputValue,
      value: {
        id: 0, // temp value
        description: inputValue,
      },
    };
    setOptions((prev) => [...prev, { ...newSubject }]);
    setSubject(newSubject);
    setNewSubject(true);
    setIsLoading(false);
  };

  return (
    <ModalOuter
      updateShowModal={updateShowSubjectModal}
      height="h-1/2 md:h-1/3"
      width="w-3/4 md:w-1/3"
    >
      <ModalInnerAdd
        title={`Add a New Subject for ${classDataState[0].description}`}
        updateShowModal={updateShowSubjectModal}
        saveContent={handleSaveSubject}
      >
        <div className="flex-1 flex flex-col justify-center items-center">
          <label htmlFor="subjectName">Subject Name: </label>
          <CreatableSelect
            id="subjectName"
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={(newValue) => setSubject(newValue)}
            onCreateOption={handleCreate}
            options={options}
            value={subject}
          />
        </div>
      </ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddSubjectModal;
