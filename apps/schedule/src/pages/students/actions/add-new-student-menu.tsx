import { FileIcon, PlusIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu } from "@radix-ui/themes";

export const AddNewStudentMenu = () => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button color="indigo" variant="soft" radius="medium">
                    <PlusIcon />
                    Добавить студента
                    <DropdownMenu.TriggerIcon />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item>
                    <PlusIcon />
                    Новый студент
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                    <FileIcon />
                    Импортировать из файла
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};
