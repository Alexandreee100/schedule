import { useState } from "react";
import {
    type ColumnDef,
    getCoreRowModel,
    type RowData,
    useReactTable,
} from "@tanstack/react-table";
import { useResizeObserver } from "../../hooks/use-resize-observer";
import { GridTable } from "../grid-table/grid-table";
import { useGridTableAdapter } from "./hooks";

interface ITableProps<TData extends RowData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    fullWidth?: boolean;
    width?: number;
}

const Table = <TData extends RowData>(props: ITableProps<TData>) => {
    const table = useReactTable({
        columns: props.columns,
        data: props.data,
        getCoreRowModel: getCoreRowModel(),
    });

    const [tableTotalWidth, setTableWidth] = useState<number | undefined>(
        () => {
            if (props.fullWidth) {
                return undefined;
            }

            if (props.width) {
                return props.width;
            }

            return table.getTotalSize();
        }
    );

    const setObserver = useResizeObserver({
        enable: !!props.fullWidth,
        callback: ({ contentRect }) => {
            const width = Math.round(contentRect.width);

            if (width > 0) {
                setTableWidth(width);
            }
        },
    });

    const adapter = useGridTableAdapter(table, tableTotalWidth);

    return (
        <div ref={setObserver}>
            {adapter.gridTemplateColumns && (
                <GridTable
                    gridTemplateColumns={adapter.gridTemplateColumns}
                    headerRows={adapter.headerRows}
                    rows={adapter.rows}
                />
            )}
        </div>
    );
};
