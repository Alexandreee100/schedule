import { forwardRef, type ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { cva, type VariantProps } from "class-variance-authority";
import {
    GridTable,
    type GridTableVariantsProps,
    type IGridTableProps,
} from "./grid-table";
import styles from "./table-root.module.css";

const tableRootVariants = cva(styles.base, {
    variants: {
        appearance: {
            surface: styles.surface,
            ghost: styles.ghost,
        },
    },
    defaultVariants: {
        appearance: "surface",
    },
});

type TablePanelVariantsProps = VariantProps<typeof tableRootVariants>;

export interface ITableRootProps
    extends
        Omit<IGridTableProps, "className" | "density" | "dividers" | "columnSizes">,
        TablePanelVariantsProps {
    columnSizes?: number[],
    header?: ReactNode;
    footer?: ReactNode;
    density?: GridTableVariantsProps["density"];
    className?: string;
    width?: number;
}

export const TableRoot = forwardRef<HTMLDivElement, ITableRootProps>(
    (
        {
            width,
            header,
            footer,
            appearance,
            density,
            className,
            columnSizes,
            ...gridProps
        },
        ref
    ) => {
        const dividers = appearance === "ghost" ? "all" : "inner";
        const rootWidth = width !== undefined ? `${width}px` : undefined;

        return (
            <Flex
                width={rootWidth}
                className={tableRootVariants({
                    appearance,
                    className,
                })}
                direction="column"
            >
                {header}
                <Box className={styles.tableViewport} ref={ref}>
                    {columnSizes && columnSizes.length > 0 && (
                        <GridTable
                            columnSizes={columnSizes}
                            density={density}
                            dividers={dividers}
                            {...gridProps}
                        />
                    )}
                </Box>
                {footer}
            </Flex>
        );
    }
);

TableRoot.displayName = "TableRoot";
