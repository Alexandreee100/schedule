import { createContextWithHook } from "../../shared/react/context/create-context-with-hook";
import { StudentListViewModel } from "./index";

export const { useContext: useStudentListViewModel, Provider: StudentListViewModelProvider } =
    createContextWithHook<StudentListViewModel>("StudentListViewModelProvider");
