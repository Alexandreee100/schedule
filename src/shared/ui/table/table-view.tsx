import { Flex, Grid } from "@radix-ui/themes";
import type { ReactNode } from "react";
import styles from "./table-view.module.css";
import { clsx } from "clsx";

export interface ITableViewHeaderCell {
    id: string;
    colSpan: number;
    content: ReactNode;
}

export interface ITableViewHeaderGroup {
    id: string;
    cells: ITableViewHeaderCell[];
}

export interface ITableViewCell {
    id: string;
    colSpan: number;
    content: ReactNode;
}

export interface ITableViewRow {
    id: string;
    cells: ITableViewCell[];
}

export type ITableViewColumnSize = number | string;

export interface ITableViewColumn {
    id: string;
    size: ITableViewColumnSize;
}

export interface ITableViewProps {
    columns: ITableViewColumn[];
    headerGroups: ITableViewHeaderGroup[];
    rows: ITableViewRow[];
    className?: string;
}

const getColumnSize = (size: ITableViewColumnSize) => {
    if (typeof size === "number") {
        return `${size}px`;
    }

    return size;
};

const TableView = ({
    columns,
    headerGroups,
    rows,
    className,
}: ITableViewProps) => {
    const gridColumns = columns
        .map((column) => getColumnSize(column.size))
        .join(" ");

    return (
        <Grid className={clsx(styles.table, className)}>
            {headerGroups.map((headerGroup) => (
                <Grid
                    key={headerGroup.id}
                    columns={gridColumns}
                    className={styles.row}
                >
                    {headerGroup.cells.map((cell) => (
                        <Flex key={cell.id} gridColumn={`span ${cell.colSpan}`}>
                            {cell.content}
                        </Flex>
                    ))}
                </Grid>
            ))}
            {rows.map((row) => (
                <Grid key={row.id} columns={gridColumns} className={styles.row}>
                    {row.cells.map((cell) => (
                        <Flex key={cell.id}>{cell.content}</Flex>
                    ))}
                </Grid>
            ))}
        </Grid>
    );
};

export default TableView;
