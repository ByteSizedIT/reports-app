"use client";

// TODO: Convert to using Server actions calling Supabase RPC

import { useState } from "react";

import CreatableSelect from "react-select/creatable";

import Button from "../Button";

import ModalOuter from "../modal-parent-components/ModalOuter";

import {
  ClassDetails,
  ClassSubjectGroupStudent,
  ReportGroup,
} from "@/types/types";

import { createClient } from "../../utils/supabase/clients/browserClient";
import deepClone from "@/utils/functions/deepClone";
import { capitaliseEachWord } from "@/utils/functions/capitaliseWords";

const AddColumnModal = ({
  updateShowAddModal,
  classDataState,
  displayedSubjectIndex,
  updateClassDataState,
}: {
  updateShowAddModal: (bool: boolean) => void;
  classDataState: ClassDetails;
  displayedSubjectIndex: number;
  updateClassDataState: (newData: ClassDetails) => void;
}) => {
  const [newReportGroup, setNewReportGroup] = useState<boolean>(false);
  const [column, setColumn] = useState<{
    label: string;
    value: ReportGroup;
  } | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [options, setOptions] = useState<
    Array<{
      label: string;
      value: ReportGroup;
    }>
  >(
    classDataState[0].class_subject
      .flatMap((subject) => subject.class_subject_group)
      .map((group) => {
        return {
          label: group.report_group?.description,
          value: {
            id: group.report_group?.id,
            description: group.report_group?.description,
            organisation_id: group.report_group?.organisation_id,
          },
        };
      })
      .filter((obj, index, self) => {
        console.log("here: ", obj.value.description);
        return (
          index === self.findIndex((o) => o.label === obj.label) &&
          obj.label !== "Class Register"
        );
      })
  );

  const supabase = createClient();

  async function handleSaveNewColumn() {
    setIsPending(true);
    if (newReportGroup && column) {
      await addReportGroupToSupabase();
    } else if (!newReportGroup && column) {
      await addClassSubjectGroupToSupabase({ ...column.value });
    }
    setIsPending(false);
  }

  function addClassSubjectGroupToClassDataState(
    newReportGroup: ReportGroup,
    newClassSubjectGroup: ClassSubjectGroupStudent
  ) {
    const copyGroupedSubjectDataState = deepClone(classDataState);
    copyGroupedSubjectDataState[0].class_subject[
      displayedSubjectIndex
    ].class_subject_group.push({
      id: newClassSubjectGroup.id,
      report_group: { ...newReportGroup },
      group_comment: null,
      class_subject_group_student: [],
    });
    updateClassDataState(copyGroupedSubjectDataState);
    updateShowAddModal(false);
  }

  async function addClassSubjectGroupToSupabase(newReportGroup: ReportGroup) {
    try {
      const { data: newClassSubjectGroup, error } = await supabase
        .from("class_subject_group")
        .insert([
          {
            class_subject_id:
              classDataState[0].class_subject[displayedSubjectIndex].id,
            report_group_id: newReportGroup.id,
            group_comment: null,
          },
        ])
        .select()
        .single();
      addClassSubjectGroupToClassDataState(
        newReportGroup,
        newClassSubjectGroup
      );
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }

  async function addReportGroupToSupabase() {
    try {
      const { data: newReportGroup, error } = await supabase
        .from("report_group")
        .insert([
          {
            organisation_id: column?.value.organisation_id,
            description: capitaliseEachWord(column?.value.description ?? ""),
          },
        ])
        .select()
        .single();
      addClassSubjectGroupToSupabase(newReportGroup);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }

  const handleCreate = (inputValue: string) => {
    if (inputValue.toLowerCase() !== "class register") {
      setIsLoading(true);
      const newGroup: {
        label: string;
        value: ReportGroup;
      } = {
        label: inputValue,
        value: {
          id: 0, // temp value
          organisation_id:
            classDataState[0].class_subject[displayedSubjectIndex]
              .class_subject_group[0]?.report_group?.organisation_id,
          description: inputValue,
        },
      };
      setOptions((prev) => [...prev, { ...newGroup }]);
      setColumn(newGroup);
      setNewReportGroup(true);
      setIsLoading(false);
    }
  };

  return (
    <ModalOuter
      updateShowModal={updateShowAddModal}
      height="h-1/2 md:h-1/3"
      width="w-3/4 md:w-1/3"
    >
      <h2>{`Add a new Subject for ${classDataState[0].description}`}</h2>
      <form
        // action={formAction}
        className="w-full h-full flex flex-col sm:w-3/4 md:w-1/2 mt-4 md:mt-8"
      >
        <label htmlFor="columnName">Group Name: </label>
        <CreatableSelect
          className="mb-4"
          id="columnName"
          isClearable
          isDisabled={isLoading}
          isLoading={isLoading}
          onChange={(newValue) => setColumn(newValue)}
          onCreateOption={handleCreate}
          options={options}
          value={column}
        />
      </form>
      <div className="flex justify-center">
        <Button
          label="Save"
          pendingLabel="Saving"
          color="primary-button"
          pending={isPending}
          onClick={handleSaveNewColumn}
        />
        <Button
          label="Cancel"
          color="modal-secondary-button"
          leftMargin
          onClick={() => updateShowAddModal(false)}
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

export default AddColumnModal;
