import { flexRender, type RowData, type Table } from "@tanstack/react-table";
import type { ICellGridTable, IRowGridTable } from "./grid-table";
import { useMemo } from "react";
import type { SetRequired } from "type-fest";
import { assertAndReturn } from "../../asserts";

export interface ITableViewColumn {
    id: string;
    size: number;
    minSize: number;
    maxSize: number;
    grow: number;
}

const getDistributedColumnSizes = (
    columns: ITableViewColumn[],
    totalWidth: number
) => {
    const epsilon = 0.01;

    const growableColumns: SetRequired<ITableViewColumn, "grow">[] = [];
    const fixedColumns: ITableViewColumn[] = [];

    let fixedWidth = 0;
    let growableMinWidth = 0;

    for (const column of columns) {
        if (column.grow > 0) {
            growableMinWidth += column.minSize;
            growableColumns.push(column);
        } else {
            fixedWidth += column.size;
            fixedColumns.push(column);
        }
    }

    const sizeById = new Map<string, number>();

    for (const column of fixedColumns) {
        sizeById.set(column.id, column.size);
    }

    if (growableColumns.length === 0) {
        return sizeById;
    }

    for (const column of growableColumns) {
        sizeById.set(column.id, column.minSize);
    }

    let remainingSpace = totalWidth - fixedWidth - growableMinWidth;

    if (remainingSpace <= 0) {
        return sizeById;
    }

    let remainingColumns = [...growableColumns];

    while (remainingSpace > epsilon && remainingColumns.length > 0) {
        const nextRemainingColumns: SetRequired<ITableViewColumn, "grow">[] =
            [];

        const totalGrow = remainingColumns.reduce(
            (acc, column) => acc + column.grow,
            0
        );

        let usedSpace = 0;

        for (const column of remainingColumns) {
            const currentSize = assertAndReturn(sizeById.get(column.id));
            const available = column.maxSize - currentSize;

            if (available <= 0) {
                continue;
            }

            const ratio = column.grow / totalGrow;
            const desired = remainingSpace * ratio;
            const add = Math.min(available, desired);

            sizeById.set(column.id, currentSize + add);
            usedSpace += add;

            if (add < available) {
                nextRemainingColumns.push(column);
            }
        }

        if (usedSpace <= 0) {
            break;
        }

        remainingSpace = Math.max(0, remainingSpace - usedSpace);
        remainingColumns = nextRemainingColumns;
    }

    return sizeById;
};

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

                if (size) {
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
