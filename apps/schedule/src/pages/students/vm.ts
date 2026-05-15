import { action, computed, makeObservable, observable } from "mobx";
import type { IStudent, IStudentTableDTO } from "./types";
import { createColumns } from "./columns";
import { studentsMocks } from "./students.mocks";
import { queryApi } from "@/core/query/api";
import { ViewModel } from "@schedule/core/view-model";

export class StudentsViewModel extends ViewModel {
    public selectedStudents = observable.set<string>();
    private readonly studentsQuery;

    constructor() {
        super();

        makeObservable(this, {
            columns: computed,
            studentIDs: computed,
            data: computed,
            selectAllStudents: action.bound,
            toggleStudent: action.bound,
        });

        this.studentsQuery = queryApi.createQuery(() => ({
            initialData: [],
            requestKey: () => ["students"],
            queryFn: async () => {
                return studentsMocks;
            },
        }));
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
