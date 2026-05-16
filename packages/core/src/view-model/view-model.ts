import { DisposableController } from "../disposable-controller";
import { RefCounter } from "./ref-counter";

/**
 * Базовый абстрактный класс для ViewModel с управлением жизненным циклом
 *
 * @description
 * Реализует "подсчет подписчиков" для управления жизненным циклом:
 * - Автоматически вызывает `onMount()` при первом использовании в компоненте
 * - Автоматически вызывает `onDispose()` когда последний компонент перестает использовать ViewModel
 * - Позволяет избежать "ада провайдеров" за счет DI-контейнера вместо React Context
 *
 * @example
 * ```ts
 * @Service([])
 * class MyViewModel extends ViewModel {
 *   protected override onMount() {
 *     // Инициализация при первом использовании
 *   }
 *
 *   protected override onDispose() {
 *     // Очистка ресурсов когда ViewModel больше не нужна
 *   }
 * }
 * ```
 *
 * // В компоненте:
 * ```tsx
 * function Component() {
 *   const vm = useViewModel(MyViewModel); // Вызовет onMount при первом использовании
 *   // ...
 *   // При размонтировании последнего компонента вызовется onDispose
 * }
 * ```
 */
export abstract class ViewModel {
    protected readonly disposableController = new DisposableController();
    protected readonly refCounter = new RefCounter();

    protected get isFirstMounted() {
        return this.refCounter.refCount === 0;
    }

    /**
     * Срабатывает при монтировании компонента, увеличивая счетчик подписчиков
     */
    public mount() {
        if (this.isFirstMounted) {
            this.onMount();
        }
        this.refCounter.increment();
    }

    /**
     * Срабатывает при размонтировании компонента, уменьшая счетчик подписчиков
     */
    public unmount() {
        if (this.refCounter.decrement()) {
            this.dispose();
        }
    }

    /**
     * @override Хук для инициализации ресурсов
     */
    protected onMount() {}

    /**
     * @override Хук для освобождения ресурсов
     */
    protected onDispose() {}

    public dispose() {
        this.disposableController.dispose();
        this.onDispose();
    }
}
