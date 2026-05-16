import { Checkbox } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";

interface ICheckboxCellProps {
    studentId: string;
    checked: boolean;
    onToggle: (studentId: string) => void;
}

export const CheckboxCell = observer(
    ({ onToggle, checked, studentId }: ICheckboxCellProps) => {
        return (
            <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle(studentId)}
            />
        );
    },
);

CheckboxCell.displayName = "CheckboxCell";
