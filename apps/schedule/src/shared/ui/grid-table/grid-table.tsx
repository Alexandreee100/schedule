import { Flex, Grid } from "@radix-ui/themes";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type ReactNode } from "react";
import styles from "./grid-table.module.css";

const gridVariants = cva([styles.base], {
    variants: {
        density: {
            1: styles.density1,
            2: styles.density2,
            3: styles.density3,
        },
        dividers: {
            inner: styles.dividersInner,
            all: styles.dividersAll,
        },
    },
    defaultVariants: {
        density: 2,
        dividers: "inner",
    },
});

export type GridTableVariantsProps = VariantProps<typeof gridVariants>;

export interface ICellGridTable {
    id: string;
    content: ReactNode;
    colSpan?: number;
}

export interface IRowGridTable {
    id: string;
    cells: ICellGridTable[];
}

export interface IGridTableProps extends GridTableVariantsProps {
    columnSizes: number[];
    headerRows: IRowGridTable[];
    rows: IRowGridTable[];
    rowHeight?: number;
    className?: string;
}

export const GridTable = forwardRef<HTMLDivElement, IGridTableProps>(
    (
        {
            columnSizes,
            rows,
            headerRows,
            rowHeight,
            className,
            density,
            dividers,
        },
        ref,
    ) => {
        const tableStyle: CSSProperties | undefined =
            rowHeight !== undefined
                ? { "--row-height": `${rowHeight}px` }
                : undefined;

        const gridTemplateColumns = columnSizes
            .map((size) => `${size}px`)
            .join(" ");

        return (
            <Grid
                className={gridVariants({
                    density,
                    dividers,
                    className,
                })}
                style={tableStyle}
                ref={ref}
            >
                {headerRows.map((headerRow) => (
                    <Grid
                        key={headerRow.id}
                        columns={gridTemplateColumns}
                        className={clsx(styles.row, styles.headerRow)}
                    >
                        {headerRow.cells.map((cell) => {
                            const gridColumn = cell.colSpan
                                ? `span ${cell.colSpan}`
                                : undefined;

                            return (
                                <Flex
                                    key={cell.id}
                                    className={styles.cell}
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
                                gridColumn={
                                    cell.colSpan
                                        ? `span ${cell.colSpan}`
                                        : undefined
                                }
                                align="center"
                            >
                                {cell.content}
                            </Flex>
                        ))}
                    </Grid>
                ))}
            </Grid>
        );
    },
);

GridTable.displayName = "GridTable";
