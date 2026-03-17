import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { Flex, Grid } from "@radix-ui/themes";
import { clsx } from "clsx";
import styles from "./grid-table.module.css";
import { cva, type VariantProps } from "class-variance-authority";

const gridVariants = cva([styles.base], {
    variants: {
        appearance: {
            surface: [styles.surface],
            ghost: [styles.ghost],
            embedded: [styles.embedded],
        },
        size: {
            1: styles.space1,
            2: styles.space2,
            3: styles.space3,
        },
    },
    defaultVariants: {
        appearance: "surface",
        size: 2,
    },
});

export type GridVariantsProps = VariantProps<typeof gridVariants>;

export interface ICellGridTable {
    id: string;
    content: ReactNode;
    colSpan?: number;
}

export interface IRowGridTable {
    id: string;
    cells: ICellGridTable[];
}

export interface IGridTableProps extends GridVariantsProps {
    gridTemplateColumns: string;
    headerRows: IRowGridTable[];
    rows: IRowGridTable[];
    rowHeight?: number;
    className?: string;
}

export const GridTable = forwardRef<HTMLDivElement, IGridTableProps>(
    (
        {
            gridTemplateColumns,
            rows,
            headerRows,
            rowHeight,
            className,
            appearance,
            size,
        },
        ref
    ) => {
        const tableStyle =
            rowHeight !== undefined
                ? ({ "--row-height": `${rowHeight}px` } as CSSProperties)
                : undefined;

        return (
            <Grid
                className={gridVariants({
                    appearance,
                    size,
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

GridTable.displayName = "GridTable";
