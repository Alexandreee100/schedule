import { Flex, Text } from "@radix-ui/themes";

interface ITextCellProps {
    value: string;
}

export const TextCell = ({ value }: ITextCellProps) => {
    return (
        <Flex align="center">
            <Text size="2">{value}</Text>
        </Flex>
    );
};
