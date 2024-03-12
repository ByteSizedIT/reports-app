"use client";

import { useState } from "react";

import CreatableSelect from "react-select/creatable";

import ModalInnerAdd from "../modal-parent-components/ModalInnerAdd";
import ModalOuter from "../modal-parent-components/ModalOuter";

import {
  ClassSubjectGroup,
  ReportGroupTableItem,
  ReportGroup,
} from "@/types/types";

import { supabaseBrowserClient } from "../../utils/supabase/client";
import deepClone from "@/utils/functions/deepClone";

const AddColumnModal = ({
  classId,
  updateShowAddModal,
  groupedSubjectDataState,
  displayedSubjectIndex,
  updateGroupedSubjectDataState,
}: {
  classId: string;
  updateShowAddModal: (bool: boolean) => void;
  groupedSubjectDataState: Array<ClassSubjectGroup>;
  displayedSubjectIndex: number;
  updateGroupedSubjectDataState: (newData: Array<ClassSubjectGroup>) => void;
}) => {
  const [newReportGroup, setNewReportGroup] = useState<boolean>(false);
  const [column, setColumn] = useState<{
    label: string;
    value: ReportGroupTableItem;
  } | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<
    Array<{
      label: string;
      value: {
        description: string;
        organisation_id: number;
      };
    }>
  >(
    groupedSubjectDataState[displayedSubjectIndex].report_groups.map(
      (group) => {
        return { label: group.description, value: group };
      }
    )
  );

  const supabase = supabaseBrowserClient();

  function handleSaveNewColumn() {
    if (newReportGroup && column) {
      addReportGroupToSupabase();
    } else if (column) {
      addReportToGroupedSubjectState({ ...column.value, students: [], id: -1 });
    }
  }

  function addReportToGroupedSubjectState(newReportGroup: ReportGroup) {
    const copyGroupedSubjectDataState = deepClone(groupedSubjectDataState);
    copyGroupedSubjectDataState[displayedSubjectIndex].report_groups.push({
      ...newReportGroup,
      students: [],
    });
    updateGroupedSubjectDataState(copyGroupedSubjectDataState);
    updateShowAddModal(false);
  }

  async function addReportGroupToSupabase() {
    try {
      const { data: newReportGroup, error } = await supabase
        .from("report_group")
        .insert([{ ...column?.value }])
        .select()
        .single();

      if (error) {
        console.error("Error adding report_group:", error.message);
      } else {
        const { data: newClassSubjectGroup, error } = await supabase
          .from("class_subject_group")
          .insert([
            {
              class_subject_id:
                groupedSubjectDataState[displayedSubjectIndex].report_groups[0][
                  "class_subject.id"
                ],
              report_group_id: newReportGroup.id,
              group_comment: null,
              class_id: classId,
            },
          ])
          .select()
          .single();
        if (error) {
          console.error("Error adding class_subject_group:", error.message);
        } else {
          addReportToGroupedSubjectState(newReportGroup);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding report group:", error.message);
      }
    }
  }

  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    const newGroup:
      | {
          label: string;
          value: { description: string; organisation_id: number };
        }
      | undefined = {
      label: inputValue,
      value: {
        organisation_id:
          groupedSubjectDataState[displayedSubjectIndex].report_groups[0]
            .organisation_id,
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
        title={`Add a New Report Group for ${groupedSubjectDataState[displayedSubjectIndex].description}`}
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
