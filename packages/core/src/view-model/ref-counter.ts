/**
 * Счетчик активных подписок на ViewModel
 */
export class RefCounter {
	private _refCount = 0;

	public get refCount() {
		return this._refCount;
	}

	/**
	 * Увеличивает счетчик ссылок
	 */
	public increment() {
		this._refCount += 1;
	}

	/**
	 * Уменьшает счетчик ссылок
	 * @throws {Error} Если счетчик становится отрицательным выбрасывает исключение
	 */
	public decrement() {
		if (this._refCount <= 0) throw new Error("RefCount cannot be negative");

		this._refCount -= 1;

		return this._refCount === 0;
	}
}
