import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu } from "@radix-ui/themes";

export const SelectedRowsActionMenu = () => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button color="indigo" variant="solid" radius="medium">
                    <GearIcon />
                    Действия
                    <DropdownMenu.TriggerIcon />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content></DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};
