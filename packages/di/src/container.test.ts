import { describe, expect, test } from "vitest";
import { Container, Optional } from "./container";
import { CyclicDependencyError, ServiceNotFoundError } from "./errors";
import { Token } from "./token";

class A {}

class B {
    public constructor(public a: A) {}
}

class C {
    public constructor(
        public a: A,
        public b: B,
    ) {}
}

describe("Container", () => {
    describe("registerClass", () => {
        test("resolves a class with no dependencies", () => {
            const container = new Container();
            container.registerClass(A, []);

            expect(container.get(A)).toBeInstanceOf(A);
        });

        test("resolves a class with dependencies", () => {
            const container = new Container();
            container.registerClass(A, []);
            container.registerClass(B, [A]);
            container.registerClass(C, [A, B]);

            const c = container.get(C);
            expect(c).toBeInstanceOf(C);
            expect(c.a).toBeInstanceOf(A);
            expect(c.b).toBeInstanceOf(B);
            expect(c.b.a).toBeInstanceOf(A);
        });
    });

    describe("registerValue", () => {
        test("resolves a registered value", () => {
            const container = new Container();
            const token = new Token<string>("config");
            container.registerValue(token, "hello");

            expect(container.get(token)).toBe("hello");
        });
    });

    describe("scopes", () => {
        test("singleton is the default scope", () => {
            const container = new Container();
            container.registerClass(A, []);

            expect(container.get(A)).toBe(container.get(A));
        });

        test("singleton caches per container", () => {
            const parent = new Container();
            const child = parent.child();
            parent.registerClass(A, []);
            child.registerClass(A, []);

            expect(parent.get(A)).not.toBe(child.get(A));
        });

        test("transient: returns a new instance each time", () => {
            const container = new Container();
            container.registerClass(A, [], "transient");

            expect(container.get(A)).not.toBe(container.get(A));
        });

        test("container: caches instance in the requesting container", () => {
            const parent = new Container();
            parent.registerClass(A, [], "container");

            const child = parent.child();
            const a1 = child.get(A);
            const a2 = child.get(A);

            expect(a1).toBe(a2);
            expect(a1).not.toBe(parent.get(A));
        });
    });

    describe("child containers", () => {
        test("child resolves from parent", () => {
            const parent = new Container();
            parent.registerClass(A, []);

            const child = parent.child();
            expect(child.get(A)).toBeInstanceOf(A);
        });

        test("child overrides parent registration", () => {
            const token = new Token<string>("val");
            const parent = new Container();
            parent.registerValue(token, "parent");

            const child = parent.child();
            child.registerValue(token, "child");

            expect(child.get(token)).toBe("child");
            expect(parent.get(token)).toBe("parent");
        });

        test("child does not affect parent instances", () => {
            const parent = new Container();
            parent.registerClass(A, [], "transient");

            const child = parent.child();
            const fromChild = child.get(A);
            const fromParent = parent.get(A);

            expect(fromChild).not.toBe(fromParent);
        });
    });

    describe("optional dependencies", () => {
        test("returns undefined for missing optional dependency", () => {
            class WithOptional {
                public constructor(public dep: A | undefined) {}
            }

            const container = new Container();
            container.registerClass(WithOptional, [Optional(A)]);

            const instance = container.get(WithOptional);
            expect(instance).toBeInstanceOf(WithOptional);
            expect(instance.dep).toBeUndefined();
        });

        test("resolves optional dependency when present", () => {
            class WithOptional {
                public constructor(public dep: A | undefined) {}
            }

            const container = new Container();
            container.registerClass(A, []);
            container.registerClass(WithOptional, [Optional(A)]);

            const instance = container.get(WithOptional);
            expect(instance.dep).toBeInstanceOf(A);
        });

        test("optional does not suppress cyclic dependency errors", () => {
            class X {
                public constructor(public y: Y | undefined) {}
            }

            class Y {
                public constructor(public x: X) {}
            }

            const container = new Container();
            container.registerClass(X, [Optional(Y)]);
            container.registerClass(Y, [X]);

            expect(() => container.get(X)).toThrow(CyclicDependencyError);
        });
    });

    describe("errors", () => {
        test("throws ServiceNotFoundError for unregistered service", () => {
            const container = new Container();

            expect(() => container.get(A)).toThrow(ServiceNotFoundError);
        });

        test("throws ServiceNotFoundError for unregistered dependency", () => {
            const container = new Container();
            container.registerClass(B, [A]);

            expect(() => container.get(B)).toThrow(ServiceNotFoundError);
        });

        test("throws CyclicDependencyError for direct cycle", () => {
            class X {
                public constructor(public y: Y) {}
            }

            class Y {
                public constructor(public x: X) {}
            }

            const container = new Container();
            container.registerClass(X, [Y]);
            container.registerClass(Y, [X]);

            expect(() => container.get(X)).toThrow(CyclicDependencyError);
        });

        test("throws CyclicDependencyError for indirect cycle", () => {
            class X {
                public constructor(public y: unknown) {}
            }

            class Y {
                public constructor(public z: unknown) {}
            }

            class Z {
                public constructor(public x: X) {}
            }

            const container = new Container();
            container.registerClass(X, [Y]);
            container.registerClass(Y, [Z]);
            container.registerClass(Z, [X]);

            expect(() => container.get(X)).toThrow(CyclicDependencyError);
        });
    });

    describe("dispose", () => {
        test("calls dispose on instances that have it", () => {
            let disposed = false;

            class Disposable {
                public dispose() {
                    disposed = true;
                }
            }

            const container = new Container();
            container.registerClass(Disposable, []);
            container.get(Disposable);

            container.dispose();

            expect(disposed).toBe(true);
        });

        test("clears all instances and registrations", () => {
            const container = new Container();
            container.registerClass(A, []);
            container.get(A);

            container.dispose();

            expect(() => container.get(A)).toThrow("disposed");
        });

        test("throws on registerClass after dispose", () => {
            const container = new Container();
            container.dispose();

            expect(() => container.registerClass(A, [])).toThrow("disposed");
        });

        test("throws on registerValue after dispose", () => {
            const container = new Container();
            const token = new Token<string>();
            container.dispose();

            expect(() => container.registerValue(token, "v")).toThrow(
                "disposed",
            );
        });

        test("throws on child after dispose", () => {
            const container = new Container();
            container.dispose();

            expect(() => container.child()).toThrow("disposed");
        });
    });

    describe("clear", () => {
        test("clears cached instances but keeps registrations", () => {
            const container = new Container();
            container.registerClass(A, [], "singleton");

            const before = container.get(A);
            container.clear();
            const after = container.get(A);

            expect(before).not.toBe(after);
        });
    });
});
