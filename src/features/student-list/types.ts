export interface IStudent {
    id: string;
    name: string;
    contact: string;
    notes: string;
}

export interface IStudentTableDTO {
    item: IStudent;
    isSelected: boolean;
}
