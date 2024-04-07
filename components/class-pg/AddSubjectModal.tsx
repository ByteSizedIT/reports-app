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
} from "@/types/types";

import { supabaseBrowserClient } from "../../utils/supabase/client";
import deepClone from "@/utils/functions/deepClone";

const AddSubjectModal = ({
  organisationSubjectDataState,
  updateOrganisationSubjectDataState,
  updateShowSubjectModal,
  classDataState,
  updateClassDataState,
}: {
  organisationSubjectDataState: SubjectDetails | [];
  updateOrganisationSubjectDataState: (newData: SubjectDetails) => void;
  updateShowSubjectModal: (bool: boolean) => void;
  classDataState: ClassDetails;
  updateClassDataState: (newData: ClassDetails) => void;
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

  function addClassSubjectToClassDataState(
    insertedSubjectData: Subject,
    insertedClassSubjectData: ClassSubject,
    insertedClassSubjectGroupData: ClassSubjectGroup,
    insertedOrganisationSubjectData?: OrganisationSubject
  ) {
    const copyGroupedSubjectDataState = deepClone(classDataState);
    copyGroupedSubjectDataState[0].class_subject.push({
      id: insertedClassSubjectData.id,
      subject: {
        id: insertedSubjectData.id,
        description: insertedSubjectData.description,
      },
      class_subject_group: [
        {
          id: insertedClassSubjectGroupData.id,
          report_group: {
            id: insertedClassSubjectGroupData.report_group_id,
            description: "Class Register",
            organisation_id: classDataState[0].organisation_id,
          },
          group_comment: insertedClassSubjectGroupData.group_comment,
          class_subject_group_student: [],
        },
      ],
    });
    updateClassDataState(copyGroupedSubjectDataState);
    if (insertedOrganisationSubjectData) {
      addToOrganisationSubjectDataState(insertedSubjectData);
    }
  }

  async function insertClassSubjectReportGroup(
    insertedSubjectData: Subject,
    insertedClassSubjectData: ClassSubject,
    insertedOrganisationSubjectData?: OrganisationSubject
  ) {
    try {
      const response = await supabase
        .from("class_subject_group")
        .insert({
          group_comment: null,
          class_subject_id: insertedClassSubjectData.id,
          report_group_id: 138, // Class Register report_group ID is 138; TODO: extract Class Register from report_groups table and manage separately with pupil names associated, still rendering it as the first 'Report Group' column for puils to be dragged and dropped from
        })
        .select()
        .single();
      const { data: insertedClassSubjectGroupData } = response;
      addClassSubjectToClassDataState(
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
