import { Flex, Section } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import { useViewModel } from "@/core/view-model/hooks/use-view-model";
import { Table } from "@/shared/ui/table";
import { AddNewStudentMenu } from "./actions/add-new-student-menu";
import { SelectedRowsActionMenu } from "./actions/selected-rows-action-menu";
import { StudentsViewModel } from "./vm";

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
