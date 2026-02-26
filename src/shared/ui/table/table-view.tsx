import { Flex, Grid } from "@radix-ui/themes";
import { type ReactNode } from "react";
import styles from "./table-view.module.css";
import { clsx } from "clsx";
import type { SetRequired } from "type-fest";
import { assertAndReturn } from "../../asserts";
import {
    type ColumnDef,
    getCoreRowModel,
    type RowData,
    useReactTable,
} from "@tanstack/react-table";

export interface ITableViewHeaderCell {
    id: string;
    colSpan: number;
    content: ReactNode;
}

export interface ITableViewColumn {
    id: string;
    size: number;
    minSize: number;
    maxSize: number;
    grow?: number;
}

const getColumnSize = (size: number) => {
    return `${size}px`;
};

const getGridColumns = (columns: ITableColumn[]) => {
    return columns
        .map((column) => {
            return getColumnSize(column.size);
        })
        .join(" ");
};

const isGrowableColumn = (column: ITableViewColumn): column is GrowableColumn =>
    column.grow !== undefined && column.grow > 0;

interface ITableColumn {
    id: string;
    size: number;
}

type GrowableColumn = SetRequired<ITableViewColumn, "grow">;

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
        if (isGrowableColumn(column)) {
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

interface ICellGridTable {
    id: string;
    content: ReactNode;
    colSpan?: number;
}

interface IRowGridTable {
    id: string;
    cells: ICellGridTable[];
}

export interface IGridTableProps {
    gridTemplateColumns: string;
    headerRows: IRowGridTable[];
    rows: IRowGridTable[];
    className?: string;
}

const GridTable = ({
    gridTemplateColumns,
    rows,
    headerRows,
    className,
}: IGridTableProps) => {
    return (
        <Grid className={clsx(styles.table, className)}>
            {headerRows.map((headerRow) => (
                <Grid
                    key={headerRow.id}
                    columns={gridTemplateColumns}
                    className={styles.row}
                >
                    {headerRow.cells.map((cell) => {
                        const gridColumn = cell.colSpan
                            ? `span ${cell.colSpan}`
                            : undefined;

                        return (
                            <Flex
                                key={cell.id}
                                className={clsx(styles.cell, styles.headerCell)}
                                gridColumn={gridColumn}
                                align="center"
                            >
                                {cell.content}
                            </Flex>
                        );
                    })}
                </Grid>
            ))}
            {rows.map((row) => (
                <Grid
                    key={row.id}
                    columns={gridTemplateColumns}
                    className={styles.row}
                >
                    {row.cells.map((cell) => (
                        <Flex
                            key={cell.id}
                            className={styles.cell}
                            align="center"
                        >
                            {cell.content}
                        </Flex>
                    ))}
                </Grid>
            ))}
        </Grid>
    );
};

interface ITableProps<TData extends RowData> {
    columns: ColumnDef<TData>[];
    data: TData[];
}

const Table = <TData extends RowData>(props: ITableProps<TData>) => {
    const table = useReactTable({
        columns: props.columns,
        data: props.data,
        getCoreRowModel: getCoreRowModel(),
    });
};
