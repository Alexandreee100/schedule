import { afterEach, describe, expect, test } from "vitest";
import { Container } from "./container";
import { ContainerInstance } from "./container-instance";
import { Service } from "./service";

afterEach(() => {
    ContainerInstance.clear();
});

describe("Service", () => {
    test("registers class in rootContainer by default", () => {
        @Service()
        class Foo {}

        expect(ContainerInstance.get(Foo)).toBeInstanceOf(Foo);
    });

    test("registers class in a custom container", () => {
        const custom = new Container();

        @Service({ container: custom })
        class Bar {}

        expect(custom.get(Bar)).toBeInstanceOf(Bar);
    });

    test("resolves dependencies", () => {
        @Service()
        class Dep {}

        @Service({ deps: [Dep] })
        class MyService {
            public constructor(public dep: Dep) {}
        }

        const instance = ContainerInstance.get(MyService);
        expect(instance.dep).toBeInstanceOf(Dep);
    });

    test("respects scope option", () => {
        @Service({ scope: "transient" })
        class Transient {}

        expect(ContainerInstance.get(Transient)).not.toBe(
            ContainerInstance.get(Transient),
        );
    });
});
