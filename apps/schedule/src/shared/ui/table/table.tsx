import { useResizeObserver } from "@schedule/core/react/hooks";
import { type ColumnDef, getCoreRowModel, type RowData, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { type ITableRootProps, TableRoot } from "../grid-table/table-root";
import { useGridTableAdapter } from "./hooks";

interface ITableProps<TData extends RowData> {
	columns: ColumnDef<TData, any>[];
	data: TData[];
	fullWidth?: boolean;
	width?: number;
	appearance?: ITableRootProps["appearance"];
	density?: ITableRootProps["density"];
	rowHeight?: ITableRootProps["rowHeight"];
	className?: ITableRootProps["className"];
	header?: ITableRootProps["header"];
	footer?: ITableRootProps["footer"];
}

const getRootWidth = (isFullWidth: boolean, fixedWidth: number | undefined, tableTotalWidth: number | undefined) => {
	if (isFullWidth) {
		return undefined;
	}

	if (fixedWidth !== undefined) {
		return fixedWidth;
	}

	return tableTotalWidth;
};

export const Table = <TData extends RowData>(props: ITableProps<TData>) => {
	const table = useReactTable({
		columns: props.columns,
		data: props.data,
		getCoreRowModel: getCoreRowModel(),
	});

	const hasFixedWidth = props.width !== undefined;
	const isFullWidth = !hasFixedWidth && !!props.fullWidth;

	// Рассчитываем ширину таблицы
	const [tableTotalWidth, setTableWidth] = useState<number | undefined>(() => {
		if (hasFixedWidth) {
			return props.width;
		}

		if (isFullWidth) {
			return undefined;
		}

		return table.getTotalSize();
	});

	const shouldObserveWidth = isFullWidth || hasFixedWidth;

	const setObserver = useResizeObserver({
		enable: shouldObserveWidth,
		callback: ({ contentRect }) => {
			const width = Math.round(contentRect.width);

			if (width > 0) {
				setTableWidth(width);
			}
		},
	});

	const adapter = useGridTableAdapter(table, tableTotalWidth);
	const rootWidth = getRootWidth(isFullWidth, props.width, tableTotalWidth);

	return (
		<TableRoot
			width={rootWidth}
			appearance={props.appearance}
			density={props.density}
			rowHeight={props.rowHeight}
			className={props.className}
			header={props.header}
			footer={props.footer}
			columnSizes={adapter.columnSizes}
			headerRows={adapter.headerRows}
			rows={adapter.rows}
			ref={setObserver}
		/>
	);
};
