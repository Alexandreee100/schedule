import { Box, Flex, Grid } from "@radix-ui/themes";
import { type CSSProperties, useMemo } from "react";
import { flexRender, useReactTable } from "@tanstack/react-table";

interface ITable {
    headerRows: { id: string; cells: { id: string }[] }[];
    rows: { id: string }[];
}

const Table = ({ headerRows }: ITable) => {
    const table = useReactTable({ columns: [], data: [] });
    const visibleLeafColumns = table.getVisibleLeafColumns();
    const columns = useMemo(() => {
        return visibleLeafColumns
            .map((column) => `${column.getSize()}px`)
            .join(" ");
    }, [visibleLeafColumns]);

    const rowModel = table.getRowModel();

    return (
        <Box>
            {table.getHeaderGroups().map((headerGroup) => (
                <Grid key={headerGroup.id} columns={columns}>
                    {headerGroup.headers.map((header) => {
                        const style: CSSProperties = {
                            gridColumn: `span ${header.colSpan}`,
                        };

                        return (
                            <Flex key={header.id} style={style}>
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </Flex>
                        );
                    })}
                </Grid>
            ))}
            {rowModel.rows.map((row) => {
                return (
                    <Grid key={row.id} columns={columns}>
                        {row.getVisibleCells().map((cell) => {
                            return (
                                <Flex key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </Flex>
                            );
                        })}
                    </Grid>
                );
            })}
        </Box>
    );
};
