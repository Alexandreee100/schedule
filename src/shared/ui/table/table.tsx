import { useState } from "react";
import {
    type ColumnDef,
    getCoreRowModel,
    type RowData,
    useReactTable,
} from "@tanstack/react-table";
import { useResizeObserver } from "../../hooks/use-resize-observer";
import { type ITableRootProps, TableRoot } from "../grid-table/table-root";
import { useGridTableAdapter } from "./hooks";

interface ITableProps<TData extends RowData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    fullWidth?: boolean;
    width?: number;
    appearance?: ITableRootProps["appearance"];
    size?: ITableRootProps["size"];
    rowHeight?: ITableRootProps["rowHeight"];
    className?: ITableRootProps["className"];
    header?: ITableRootProps["header"];
    footer?: ITableRootProps["footer"];
}

export const Table = <TData extends RowData>(props: ITableProps<TData>) => {
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
        <TableRoot
            totalSize={tableTotalWidth}
            appearance={props.appearance}
            size={props.size}
            rowHeight={props.rowHeight}
            className={props.className}
            header={props.header}
            footer={props.footer}
            gridTemplateColumns={adapter.gridTemplateColumns}
            headerRows={adapter.headerRows}
            rows={adapter.rows}
            ref={setObserver}
        />
    );
};
