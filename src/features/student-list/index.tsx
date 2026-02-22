import { makeObservable } from "mobx";

class StudentListViewModel {
    constructor() {
        makeObservable(this, {}, { autoBind: true });
    }

    public get columns() {}
}

const StudentList = () => {};
