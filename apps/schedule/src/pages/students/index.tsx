import { useViewModel } from "../../core/view-model/hooks/use-view-model";
import { Flex, Section } from "@radix-ui/themes";
import { AddNewStudentMenu } from "./actions/add-new-student-menu";
import { SelectedRowsActionMenu } from "./actions/selected-rows-action-menu";
import { Table } from "@/shared/ui/table";
import { StudentsViewModel } from "./vm";
import { observer } from "mobx-react-lite";

const Students = observer(() => {
    const vm = useViewModel(() => new StudentsViewModel(), []);

    return (
        <div>
            <Section>
                <Flex gap="3">
                    <AddNewStudentMenu />
                    <SelectedRowsActionMenu />
                </Flex>
            </Section>
            <Section>
                <Table columns={vm.columns} data={vm.data} />
            </Section>
            <div>Пагинация</div>
        </div>
    );
});

Students.displayName = "Students";

export default Students;
