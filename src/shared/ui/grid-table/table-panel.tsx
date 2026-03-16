import { forwardRef, type ReactNode } from "react";
import { Box } from "@radix-ui/themes";
import {
    GridTable,
    type GridVariantsProps,
    type IGridTableProps,
} from "./grid-table";
import type { ExtractStrict } from "type-fest";
import styles from "./table-panel.module.css";

export interface ITablePanelProps extends Omit<
    IGridTableProps,
    ExtractStrict<keyof GridVariantsProps, "appearance" | "size">
> {
    header?: ReactNode;
    footer?: ReactNode;
}

export const TablePanel = forwardRef<HTMLDivElement, ITablePanelProps>(
    ({ header, footer, ...gridProps }, ref) => {
        return (
            <Box className={styles.tablePanel}>
                {header}
                <GridTable {...gridProps} rounded={false} ref={ref} />
                {footer}
            </Box>
        );
    }
);

TablePanel.displayName = "TablePanel";
