import { useState } from "react";
import {
    type ColumnDef,
    getCoreRowModel,
    type RowData,
    useReactTable,
} from "@tanstack/react-table";
import { useResizeObserver } from "./use-resize-observer";
import { GridTable } from "./grid-table";
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

    const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(
        undefined
    );

    const setObserver = useResizeObserver(({ contentRect }) => {
        const width = Math.round(contentRect.width);

        if (width > 0) {
            setMeasuredWidth(width);
        }
    });

    const adapter = useGridTableAdapter(table, measuredWidth);

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
