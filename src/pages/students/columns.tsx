import { createColumnHelper } from "@tanstack/react-table";
import { CheckboxCell } from "./cells/checkbox-cell";
import { TextCell } from "./cells/text-cell";

import type { IStudentTableDTO } from "./types";

interface ICreateColumnsParams {
    onToggleStudent: (id: string) => void;
}

const helper = createColumnHelper<IStudentTableDTO>();

export const createColumns = ({ onToggleStudent }: ICreateColumnsParams) => {
    return [
        helper.display({
            id: "checkbox",
            cell: (ctx) => (
                <CheckboxCell
                    checked={ctx.row.original.isSelected}
                    studentId={ctx.row.original.item.id}
                    onToggle={onToggleStudent}
                />
            ),
        }),
        helper.accessor("item.name", {
            cell: (ctx) => <TextCell value={ctx.getValue()} />,
            meta: {
                grow: 1,
            },
        }),
        helper.accessor("item.notes", {
            cell: (ctx) => <TextCell value={ctx.getValue()} />,
            meta: {
                grow: 1,
            },
        }),
        helper.accessor("item.contact", {
            cell: (ctx) => <TextCell value={ctx.getValue()} />,
            meta: {
                grow: 1,
            },
        }),
    ];
};
