"use client";

import { useState } from "react";

import CreatableSelect from "react-select/creatable";

import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";
import ModalOuter from "../modal-parent-components/ModalOuter";

import { ReportGroup, ClassDetails, ClassSubjectGroup } from "@/types/types";

import { supabaseBrowserClient } from "../../utils/supabase/client";
import deepClone from "@/utils/functions/deepClone";

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
          label: group.report_group.description,
          value: {
            id: group.report_group.id,
            description: group.report_group.description,
            organisation_id: group.report_group.organisation_id,
          },
        };
      })
      .filter(
        (obj, index, self) =>
          index === self.findIndex((o) => o.label === obj.label)
      )
  );

  const supabase = supabaseBrowserClient();

  function handleSaveNewColumn() {
    if (newReportGroup && column) {
      addReportGroupToSupabase();
    } else if (!newReportGroup && column) {
      addClassSubjectGroupToSupabase({ ...column.value });
    }
  }

  function addClassSubjectGroupToClassDataState(
    newReportGroup: ReportGroup,
    newClassSubjectGroup: ClassSubjectGroup
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
      if (error) {
        throw new Error(`Error adding class_subject_group: ${error.message}`);
      } else {
        addClassSubjectGroupToClassDataState(
          newReportGroup,
          newClassSubjectGroup
        );
      }
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
            description: column?.value.description,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding report_group: ${error.message}`);
      } else {
        addClassSubjectGroupToSupabase(newReportGroup);
      }
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    const newGroup: {
      label: string;
      value: ReportGroup;
    } = {
      label: inputValue,
      value: {
        id: 0, //
        organisation_id:
          classDataState[0].class_subject[displayedSubjectIndex]
            .class_subject_group[0].report_group.organisation_id,
        description: inputValue,
      },
    };
    setOptions((prev) => [...prev, { ...newGroup }]);
    setColumn(newGroup);
    setNewReportGroup(true);
    setIsLoading(false);
  };

  return (
    <ModalOuter
      updateShowModal={updateShowAddModal}
      height="h-1/2 md:h-1/3"
      width="w-3/4 md:w-1/3"
    >
      <ModalInnerAdd
        title={`Add a New Report Group for ${classDataState[0].class_subject[displayedSubjectIndex].subject.description}`}
        updateShowModal={updateShowAddModal}
        saveContent={handleSaveNewColumn}
      >
        <div className="flex-1 flex flex-col justify-center items-center">
          <label htmlFor="columnName">Group Name: </label>
          <CreatableSelect
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={(newValue) => setColumn(newValue)}
            onCreateOption={handleCreate}
            options={options}
            value={column}
          />
        </div>
      </ModalInnerAdd>
    </ModalOuter>
  );
};

export default AddColumnModal;
