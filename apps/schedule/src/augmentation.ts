import type { RowData } from "@tanstack/react-table";

declare module "react" {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        grow?: number;
    }
}
