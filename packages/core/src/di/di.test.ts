import { expect, test } from "vitest";
import { Container } from "./container";

class TestClass {}

test("test", () => {
    const container = new Container();
    container.registerClass(TestClass, []);
    const a = container.get(TestClass);
    const b = container.get(TestClass);
    expect(a).toEqual(b);
});
