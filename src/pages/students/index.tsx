import { ViewModel } from "../../core/view-model/view-model";
import { useViewModel } from "../../core/view-model/hooks/use-view-model";
import { Flex, Section } from "@radix-ui/themes";
import { AddNewStudentMenu } from "./actions/add-new-student-menu";
import { SelectedRowsActionMenu } from "./actions/selected-rows-action-menu";

class StudentsViewModel extends ViewModel {
    public get students() {
        return [];
    }
}

const Students = () => {
    const vm = useViewModel(() => new StudentsViewModel(), []);

    return (
        <div>
            <Section>
                <Flex gap="3">
                    <AddNewStudentMenu />
                    <SelectedRowsActionMenu />
                </Flex>
            </Section>
            <Section>Таблица</Section>
            <div>Пагинация</div>
        </div>
    );
};

export default Students;
