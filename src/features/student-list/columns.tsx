import { createColumnHelper } from "@tanstack/react-table";
import type { IStudentTableDTO } from "./types";
import { CheckboxCell } from "./components/checkbox-cell";
import { TextCell } from "./components/text-cell";

const helper = createColumnHelper<IStudentTableDTO>();

export const createColumns = () => {
    return [
        helper.display({
            id: "checkbox",
            cell: (ctx) => <CheckboxCell rowId={ctx.row.original.item.id} isSelected={ctx.row.original.isSelected} />,
        }),
        helper.accessor("item.name", {
            cell: (ctx) => <TextCell value={ctx.getValue()} />,
        }),
        helper.accessor("item.notes", {
            cell: (ctx) => <TextCell value={ctx.getValue()} />,
        }),
        helper.accessor("item.contact", {
            cell: (ctx) => <TextCell value={ctx.getValue()} />,
        }),
    ];
};
