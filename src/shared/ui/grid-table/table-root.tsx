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
    className?: string;
}

export const TableRoot = forwardRef<HTMLDivElement, ITableRootProps>(
    ({ header, footer, appearance, size, className, ...gridProps }, ref) => {
        const dividers = appearance === "ghost" ? "all" : "inner";

        return (
            <Flex
                direction="column"
                className={tableRootVariants({
                    appearance,
                    className,
                })}
                ref={ref}
            >
                {header}
                <Box className={styles.viewport}>
                    <GridTable {...gridProps} size={size} dividers={dividers} />
                </Box>
                {footer}
            </Flex>
        );
    }
);

TableRoot.displayName = "TableRoot";
