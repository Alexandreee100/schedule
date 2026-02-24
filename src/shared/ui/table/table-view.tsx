import { Flex, Grid } from "@radix-ui/themes";
import type { ReactNode } from "react";

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

export interface ITableViewProps {
    columns: string;
    headerGroups: ITableViewHeaderGroup[];
    rows: ITableViewRow[];
}

const getSpanStyle = (colSpan: number) => {
    return { gridColumn: `span ${colSpan}` } as const;
};

const TableView = ({ columns, headerGroups, rows }: ITableViewProps) => {
    return (
        <Grid>
            {headerGroups.map((headerGroup) => (
                <Grid key={headerGroup.id} columns={columns}>
                    {headerGroup.cells.map((cell) => (
                        <Flex key={cell.id} style={getSpanStyle(cell.colSpan)}>
                            {cell.content}
                        </Flex>
                    ))}
                </Grid>
            ))}
            {rows.map((row) => (
                <Grid key={row.id} columns={columns}>
                    {row.cells.map((cell) => (
                        <Flex key={cell.id} style={getSpanStyle(cell.colSpan)}>
                            {cell.content}
                        </Flex>
                    ))}
                </Grid>
            ))}
        </Grid>
    );
};

export default TableView;
