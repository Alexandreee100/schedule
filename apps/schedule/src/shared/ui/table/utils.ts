import type { SetRequired } from "type-fest";
import { assertAndReturn } from "../../asserts";
import type { ITableViewColumn } from "./hooks";

export const getDistributedColumnSizes = (
    columns: ITableViewColumn[],
    totalWidth: number,
) => {
    const epsilon = 0.01;
    const growableColumns: SetRequired<ITableViewColumn, "grow">[] = [];
    const fixedColumns: ITableViewColumn[] = [];

    let fixedWidth = 0;
    let growableMinWidth = 0;

    for (const column of columns) {
        if (column.grow > 0) {
            growableMinWidth += column.minSize;
            growableColumns.push(column);
        } else {
            fixedWidth += column.size;
            fixedColumns.push(column);
        }
    }

    const sizeById = new Map<string, number>();

    for (const column of fixedColumns) {
        sizeById.set(column.id, column.size);
    }

    for (const column of growableColumns) {
        sizeById.set(column.id, column.minSize);
    }

    if (growableColumns.length === 0) {
        return sizeById;
    }

    let remainingSpace = totalWidth - fixedWidth - growableMinWidth;

    if (remainingSpace <= 0) {
        return sizeById;
    }

    let remainingColumns = [...growableColumns];

    while (remainingSpace > epsilon && remainingColumns.length > 0) {
        const nextRemainingColumns: SetRequired<ITableViewColumn, "grow">[] =
            [];

        const totalGrow = remainingColumns.reduce(
            (acc, column) => acc + column.grow,
            0,
        );

        let usedSpace = 0;

        for (const column of remainingColumns) {
            const currentSize = assertAndReturn(sizeById.get(column.id));
            const available = column.maxSize - currentSize;

            if (available <= 0) {
                continue;
            }

            const ratio = column.grow / totalGrow;
            const desired = remainingSpace * ratio;
            const add = Math.min(available, desired);

            sizeById.set(column.id, currentSize + add);
            usedSpace += add;

            if (add < available) {
                nextRemainingColumns.push(column);
            }
        }

        if (usedSpace <= 0) {
            break;
        }

        remainingSpace = Math.max(0, remainingSpace - usedSpace);
        remainingColumns = nextRemainingColumns;
    }

    return sizeById;
};
