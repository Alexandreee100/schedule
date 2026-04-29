export class Lazy<T> {
    private instance: T | undefined = undefined;
    private readonly initializer: () => T;

    constructor(initializer: () => T) {
        this.initializer = initializer;
    }

    public get value(): T {
        if (this.instance === undefined) {
            this.instance = this.initializer();
        }
        return this.instance;
    }
}
