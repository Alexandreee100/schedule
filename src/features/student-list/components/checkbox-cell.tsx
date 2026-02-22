import { Checkbox, Flex } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";

import { useStudentListViewModel } from "../context";

interface ICheckboxCellProps {
    rowId: string;
    isSelected: boolean;
}

export const CheckboxCell = observer(function CheckboxCell({ rowId, isSelected }: ICheckboxCellProps) {
    const vm = useStudentListViewModel();

    return (
        <Flex align="center">
            <Checkbox size="1" checked={isSelected} onCheckedChange={() => vm.onSelect(rowId)} />
        </Flex>
    );
});
