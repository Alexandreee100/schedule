import { makeAutoObservable } from "mobx";
import { useMemo } from "react";
import { StudentListViewModelProvider } from "./context";
import { createColumns } from "./columns";
import type { IStudentTableDTO } from "./types";

export class StudentListViewModel {
    public selectedItems = new Set<string>();

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    public get columns() {
        return createColumns();
    }

    public get data(): IStudentTableDTO[] {
        return [];
    }

    public onSelect(id: string) {
        this.selectedItems.add(id);
    }
}

const StudentList = () => {
    const vm = useMemo(() => new StudentListViewModel(), []);

    return <StudentListViewModelProvider value={vm}></StudentListViewModelProvider>;
};
