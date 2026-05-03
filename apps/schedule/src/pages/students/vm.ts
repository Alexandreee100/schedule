import { ViewModel } from "@/core/view-model/view-model";
import { action, computed, makeObservable, observable } from "mobx";
import type { IStudentTableDTO } from "./types";
import { createColumns } from "./columns";
import { studentsMocks } from "./students.mocks";
import { createObservableResource } from "@/core/async";

export class StudentsViewModel extends ViewModel {
    public selectedStudents = observable.set<string>();
    private readonly studentsRequest;

    constructor() {
        super();

        makeObservable(this, {
            columns: computed,
            studentIDs: computed,
            data: computed,
            selectAllStudents: action.bound,
            toggleStudent: action.bound,
        });

        this.studentsRequest = createObservableResource({
            requestKey: () => ["students"],
            requestFn: async () => {
                return studentsMocks;
            },
            initialData: [],
        });
    }

    public get data(): IStudentTableDTO[] {
        return this.studentsRequest.data.map((student) => {
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
        return this.studentsRequest.data.map((student) => student.id);
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
