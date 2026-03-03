import { flexRender, type RowData, type Table } from "@tanstack/react-table";
import type { ICellGridTable, IRowGridTable } from "../grid-table/grid-table";
import { useMemo } from "react";
import { getDistributedColumnSizes } from "./utils";

export interface ITableViewColumn {
    id: string;
    size: number;
    minSize: number;
    maxSize: number;
    grow: number;
}

export const useGridTableAdapter = <TData extends RowData>(
    table: Table<TData>,
    totalWidth: number | undefined
) => {
    const rowModel = table.getRowModel();

    const headerGroups = table.getHeaderGroups();
    const tableRows = rowModel.rows;
    const allColumns = table.getAllLeafColumns();

    const headerRows: IRowGridTable[] = useMemo(
        () =>
            headerGroups.map((group) => {
                const cells = group.headers.map((header): ICellGridTable => {
                    return {
                        id: header.id,
                        colSpan: header.colSpan,
                        content: flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        ),
                    };
                });

                return {
                    id: group.id,
                    cells,
                };
            }),
        [headerGroups]
    );

    const rows: IRowGridTable[] = useMemo(
        () =>
            tableRows.map((row) => {
                const cells = row
                    .getVisibleCells()
                    .map((cell): ICellGridTable => {
                        return {
                            id: cell.id,
                            content: flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            ),
                        };
                    });

                return {
                    id: row.id,
                    cells,
                };
            }),
        [tableRows]
    );

    const distributedSizes = useMemo(() => {
        if (totalWidth === undefined) {
            return undefined;
        }

        const columns = allColumns.map((column) => {
            const size = column.columnDef.size ?? 0;
            const minSize = column.columnDef.minSize ?? 0;
            const maxSize = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
            const grow = column.columnDef.meta?.grow ?? 0;

            return {
                id: column.id,
                size,
                minSize,
                maxSize,
                grow,
            };
        });

        return getDistributedColumnSizes(columns, totalWidth);
    }, [allColumns, totalWidth]);

    const gridTemplateColumns = useMemo(() => {
        if (!distributedSizes) {
            return undefined;
        }

        return allColumns
            .flatMap((column) => {
                const size = distributedSizes.get(column.id);

                if (size !== undefined) {
                    return `${size}px`;
                }

                return [];
            })
            .join(" ");
    }, [distributedSizes, allColumns]);

    return {
        headerRows,
        rows,
        gridTemplateColumns,
    };
};
