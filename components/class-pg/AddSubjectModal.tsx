"use client";

// TODO: Convert to using Server actions calling Supabase RPC

import { useState } from "react";

// import { useFormState } from "react-dom";

import CreatableSelect from "react-select/creatable";

// import FormSubmitButton from "../FormSubmitButton";
import Button from "../Button";

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

import { createClient } from "../../utils/supabase/clients/browserClient";
import { capitaliseEachWord } from "@/utils/functions/capitaliseWords";
import { getClassDetails } from "@/utils/supabase/db-server-queries/getClassDetails";

// const initialFormActionState = { errorMessage: "" };

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
  // const [state, formAction] = useFormState(
  //   handleSaveSubject,
  //   initialFormActionState
  // );

  const [newSubject, setNewSubject] = useState<boolean>(false);
  const [subject, setSubject] = useState<{
    label: string;
    value: Subject;
  } | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
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

  const supabase = createClient();

  async function handleSaveSubject() {
    setIsPending(true);
    if (newSubject && subject) {
      await checkSubjectInSupabase();
    } else if (!newSubject && subject) {
      await insertClassSubjectInSupabase({
        id: subject.value.id,
        description: subject.label,
      });
    }
    updateShowSubjectModal(false);
    setIsPending(false);
    // return {
    //   errorMessage: `⚠️ Could not insert new class: }`,
    // };
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
    const classData = await getClassDetails(classDataState?.[0].id);
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
        `Error occurred adding students for ${subject?.label} to class_student table in Supabase: ${error}`
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
        .insert({ description: capitaliseEachWord(subject?.label ?? "") })
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
      <h2>{`Add a New Subject for ${classDataState[0].description}`}</h2>
      <form
        // action={formAction}
        className="w-full h-full flex flex-col sm:w-3/4 md:w-1/2 mt-4 md:mt-8"
      >
        <label htmlFor="subjectName">Subject Name: </label>
        <CreatableSelect
          className="mb-4"
          id="subjectName"
          isClearable
          isDisabled={isLoading}
          isLoading={isLoading}
          onChange={(newValue) => setSubject(newValue)}
          onCreateOption={handleCreate}
          options={options}
          value={subject}
        />
      </form>
      <div className="flex justify-center">
        <Button
          label="Save"
          pendingLabel="Saving"
          color="primary-button"
          pending={isPending}
          onClick={handleSaveSubject}
        />
        <Button
          label="Cancel"
          color="modal-secondary-button"
          leftMargin
          onClick={() => updateShowSubjectModal(false)}
        />
      </div>
      {/* {state?.errorMessage && (
        <p
          className="p-2 bg-foreground/10 text-foreground text-center text-sm text-red-500"
          aria-live="assertive"
        >
          {state.errorMessage}
        </p>
      )} */}
    </ModalOuter>
  );
};

export default AddSubjectModal;
