import { ViewModel } from "@schedule/core/view-model";
import { action, computed, makeObservable, observable } from "mobx";
import { queryApi } from "@/core/query/api";
import { createColumns } from "./columns";
import { studentsMocks } from "./students.mocks";
import type { IStudentTableDTO } from "./types";

export class StudentsViewModel extends ViewModel {
    public selectedStudents = observable.set<string>();
    private readonly studentsQuery;

    constructor() {
        super();

        this.studentsQuery = queryApi.createQuery(() => ({
            initialData: [],
            requestKey: () => ["students"],
            queryFn: async () => {
                return studentsMocks;
            },
        }));

        makeObservable(this, {
            columns: computed,
            studentIDs: computed,
            data: computed,
            selectAllStudents: action.bound,
            toggleStudent: action.bound,
        });
    }

    public get data(): IStudentTableDTO[] {
        return this.studentsQuery.data!.map((student) => {
            return {
                item: student,
                isSelected: this.selectedStudents.has(student.id),
            };
        });
    }

    public get columns() {
        const params = { onToggleStudent: this.toggleStudent };

        return createColumns(params);
    }

    public get studentIDs() {
        return this.studentsQuery.data!.map((student) => student.id);
    }

    public selectAllStudents() {
        this.selectedStudents.replace(this.studentIDs);
    }

    public toggleStudent(studentID: string) {
        const isExisted = this.selectedStudents.has(studentID);

        if (isExisted) {
            this.selectedStudents.delete(studentID);
        } else {
            this.selectedStudents.add(studentID);
        }
    }
}
