import { forwardRef, type ReactNode, type Ref } from "react";
import { Flex, Grid } from "@radix-ui/themes";
import { clsx } from "clsx";
import styles from "./grid-table.module.css";

export interface ICellGridTable {
    id: string;
    content: ReactNode;
    colSpan?: number;
}

export interface IRowGridTable {
    id: string;
    cells: ICellGridTable[];
}

export interface IGridTableProps {
    gridTemplateColumns: string;
    headerRows: IRowGridTable[];
    rows: IRowGridTable[];
    className?: string;
    ref?: Ref<HTMLDivElement>;
}

export const GridTable = forwardRef<HTMLDivElement, IGridTableProps>(
    function GridTable(
        { gridTemplateColumns, rows, headerRows, className },
        ref
    ) {
        return (
            <Grid className={clsx(styles.table, className)} ref={ref}>
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
                                    className={clsx(
                                        styles.cell,
                                        styles.headerCell
                                    )}
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
    }
);
