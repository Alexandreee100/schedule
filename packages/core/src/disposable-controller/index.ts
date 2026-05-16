export interface IDisposable {
	dispose: () => void;
}

export class DisposableController implements IDisposable {
	protected disposers = new Set<VoidFunction>();

	public add(...disposers: VoidFunction[]) {
		disposers.forEach((disposer) => {
			this.disposers.add(disposer);
		});
	}

	public disposeSome(...disposers: VoidFunction[]) {
		for (const disposer of disposers) {
			if (!this.disposers.has(disposer)) {
				continue;
			}

			disposer();
			this.disposers.delete(disposer);
		}
	}

	public dispose() {
		for (const disposer of this.disposers) {
			disposer();
			this.disposers.delete(disposer);
		}
	}
}
