import { ViewModel } from "../../core/view-model/view-model";
import { action, computed, makeObservable, observable } from "mobx";
import type { IStudent, IStudentTableDTO } from "./types";
import { createColumns } from "./columns";
import { studentsMocks } from "./students.mocks";

export class StudentsViewModel extends ViewModel {
    public selectedStudents = observable.set<string>();

    constructor() {
        super();

        makeObservable(this, {
            students: computed,
            columns: computed,
            studentIDs: computed,
            data: computed,
            selectAllStudents: action.bound,
            toggleStudent: action.bound,
        });
    }

    public get students(): IStudent[] {
        return studentsMocks;
    }

    public get data(): IStudentTableDTO[] {
        return this.students.map((student) => {
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
        return this.students.map((student) => student.id);
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
