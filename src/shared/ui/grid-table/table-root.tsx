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
        Omit<IGridTableProps, "className" | "size" | "dividers">,
        TablePanelVariantsProps {
    header?: ReactNode;
    footer?: ReactNode;
    size?: GridTableVariantsProps["size"];
    totalSize?: number;
    className?: string;
}

export const TableRoot = forwardRef<HTMLDivElement, ITableRootProps>(
    (
        {
            header,
            footer,
            appearance,
            size,
            className,
            totalSize,
            gridTemplateColumns,
            ...gridProps
        },
        ref
    ) => {
        const dividers = appearance === "ghost" ? "all" : "inner";

        const width = `${totalSize}px`;

        return (
            <Flex
                width={width}
                direction="column"
                className={tableRootVariants({
                    appearance,
                    className,
                })}
                ref={ref}
            >
                {header}
                <Box className={styles.tableViewport}>
                    {gridTemplateColumns && (
                        <GridTable
                            gridTemplateColumns={gridTemplateColumns}
                            size={size}
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
