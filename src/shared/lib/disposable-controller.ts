export interface IDestructible {
    dispose: () => void;
}

export class DisposableController implements IDestructible {
    protected reactions = new Set<VoidFunction>();

    public addReactions(...effects: VoidFunction[]) {
        for (const effect of effects) {
            this.reactions.add(effect);
        }
    }

    public dispose() {
        for (const reaction of this.reactions) {
            reaction();
            this.reactions.delete(reaction);
        }
    }
}
