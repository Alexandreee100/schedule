# Async

Инфраструктурный слой для выполнения асинхронных операций, управления состоянием запроса и повторного использования общей логики дедубликации и ретраев.

## Импорт

`createAsyncApi` используется для создания API асинхронных операций в приложении.

```ts
import { createAsyncApi } from "@asudd/infra/async";

const { createRequestClient, createObservableResource, createObservableTask, createObservableMutation } =
  createAsyncApi();
```

## Как использовать

### `createRequestClient`

Создает императивный клиент для одноразовых запросов без observable state.

```ts
const requestClient = createRequestClient();

const data = await requestClient.request({
  requestKey: ["traffic-light", id] as const,
  requestFn: ({ signal }) => service.getTrafficLight(id, { signal }),
});
```

Одинаковые in-flight запросы дедуплицируются по `requestKey`: несколько одновременных запросов с одинаковым ключом получат один общий результат.

In-flight запрос - это запрос, который уже запущен, но еще не завершился. Если второй запрос стартует с тем же `requestKey`, он может переиспользовать promise первого запроса вместо запуска нового сетевого вызова.

#### `requestKey`

`requestKey` идентифицирует операцию для дедупликации in-flight запросов. Значением могут быть любые сериализуемые данные.

Для массива важен порядок элементов:

```ts
["traffic-light", 1];
[1, "traffic-light"]; // другой ключ
```

Для объекта порядок ключей не важен:

```ts
[{ id: 1, type: "traffic-light" }];
[{ type: "traffic-light", id: 1 }]; // тот же ключ
```

#### Параметры `request`

| Поле         | Тип                                                     | Описание                                                        |
| ------------ | ------------------------------------------------------- | --------------------------------------------------------------- |
| `requestKey` | `readonly unknown[]`                                    | Ключ запроса. Используется для дедупликации in-flight запросов. |
| `requestFn`  | `({ requestKey, signal }) => Promise<TData>`            | Функция запроса. Получает текущий `requestKey` и `AbortSignal`. |
| `signal`     | `AbortSignal`                                           | Внешний signal для отмены ожидания результата.                  |
| `dedupe`     | `boolean`                                               | Если `false`, запрос выполняется без дедубликации.              |
| `retry`      | `boolean \| number \| (failureCount, error) => boolean` | Повторные попытки. См. раздел «Повторные попытки».              |
| `retryDelay` | `number \| (failureCount, error) => number`             | Задержка перед повторной попыткой в миллисекундах.              |

### `createObservableResource`

Создает request с реактивным состоянием выполнения.

```ts
const detailsRequest = createObservableResource({
  requestKey: () => ["traffic-light-details", this.id] as const,
  requestFn: ({ requestKey }) => {
    const [, id] = requestKey;

    return service.getDetails(id);
  },
  enabled: () => this.id !== null,
});
```

#### Параметры

| Поле              | Тип                                             | Описание                                                                                              |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `requestKey`      | `() => readonly unknown[]`                      | Фабрика ключа запроса. Реактивное значение, при изменении запускает новый запрос, отменяя предыдущий. |
| `requestFn`       | `({ requestKey, signal }) => Promise<TData>`    | Функция запроса. Получает текущий `requestKey` и `AbortSignal`.                                       |
| `placeholderData` | `TData \| (previousData) => TData \| undefined` | Временные данные на период нового запроса: смена фильтра, страницы или id.                            |
| `retry`           | `boolean \| number \| (failureCount, error)`    | Повторные попытки. См. раздел «Повторные попытки».                                                    |
| `retryDelay`      | `number \| (failureCount, error) => number`     | Задержка перед повторной попыткой в миллисекундах.                                                    |
| `enableOnDemand`  | `boolean`                                       | Если `true`, подписка стартует при первом чтении `state`.                                             |
| `enabled`         | `boolean \| () => boolean`                      | Разрешает автоматический запуск запроса. Пока `false`, запрос не стартует автоматически.              |
| `pollInterval`    | `number \| false \| () => number \| false`      | Интервал поллинга запроса в миллисекундах.                                                            |

#### Поля и методы

| Поле/метод          | Описание                                           |
| ------------------- | -------------------------------------------------- |
| `state`             | Текущее состояние запроса.                         |
| `data`              | Данные успешного запроса или `undefined`.          |
| `error`             | Ошибка последнего неуспешного запроса.             |
| `isPending`         | `true`, если данных еще нет.                       |
| `isSuccessful`      | `true`, если последний результат успешный.         |
| `isError`           | `true`, если запрос завершился ошибкой.            |
| `requestStatus`     | `"idle"` или `"requesting"`.                       |
| `isIdle`            | `true`, если запрос сейчас не выполняется.         |
| `isRequesting`      | `true`, если запрос сейчас выполняется.            |
| `isPlaceholderData` | `true`, если `data` получены из `placeholderData`. |
| `request()`         | Запускает запрос вручную.                          |
| `cancel()`          | Отменяет текущий запрос.                           |
| `destroy()`         | Отменяет запрос и очищает подписки.                |

### `createObservableTask`

Создает async task с реактивным состоянием выполнения для операций, которые не возвращают данные. Подходит для инициализации store или workflow, где результат применяется внутри `requestFn`.

```ts
const bootstrapTask = createObservableTask({
  requestKey: () => ["traffic-lights-bootstrap"] as const,
  requestFn: async () => {
    const items = await service.getItems();

    this.items = items;
  },
});
```

#### Параметры

| Поле           | Тип                                          | Описание                                                                                |
| -------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `requestKey`   | `() => readonly unknown[]`                   | Фабрика ключа задачи. Реактивное значение, при изменении запускает задачу заново.       |
| `requestFn`    | `({ requestKey, signal }) => Promise<void>`  | Функция задачи. Получает текущий `requestKey` и `AbortSignal`.                          |
| `retry`        | `boolean \| number \| (failureCount, error)` | Повторные попытки. См. раздел «Повторные попытки».                                      |
| `retryDelay`   | `number \| (failureCount, error) => number`  | Задержка перед повторной попыткой в миллисекундах.                                      |
| `enabled`      | `boolean \| () => boolean`                   | Разрешает автоматический запуск задачи. Пока `false`, задача не стартует автоматически. |
| `pollInterval` | `number \| false \| () => number \| false`   | Интервал периодического запуска задачи в миллисекундах.                                 |

`createObservableTask` использует тот же объект, что и `createObservableResource`, но создается с `enableOnDemand: false`, поэтому подписка стартует сразу.

### `createObservableMutation`

Создает mutation с реактивным состоянием выполнения и обработчиками этапов выполнения.

```ts
const saveMutation = createObservableMutation<TrafficLight, SaveTrafficLightParams, TrafficLightSnapshot>({
  mutationFn: (params) => service.saveTrafficLight(params),
  onMutate: (params) => {
    const snapshot = this.snapshot(params.id);

    this.applyOptimistic(params);

    return snapshot;
  },
  onError: (_error, _params, snapshot) => {
    if (snapshot) {
      this.restore(snapshot);
    }
  },
});
```

```ts
await saveMutation.mutate(params);
```

Обработчики для отдельного вызова:

```ts
await saveMutation.mutate(params, {
  onSuccess: () => {
    this.closeEditor();
  },
});
```

#### Параметры

| Поле         | Тип                                                           | Описание                                                                  |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `mutationFn` | `(arg) => Promise<TData>`                                     | Функция мутации.                                                          |
| `onMutate`   | `(arg) => TOnMutateResult \| Promise<TOnMutateResult>`        | Вызывается до `mutationFn`. Результат передается в остальные обработчики. |
| `onSuccess`  | `(data, arg, onMutateResult) => void \| Promise<void>`        | Вызывается после успешного выполнения.                                    |
| `onError`    | `(error, arg, onMutateResult) => void \| Promise<void>`       | Вызывается после ошибки.                                                  |
| `onSettled`  | `(data, error, arg, onMutateResult) => void \| Promise<void>` | Вызывается после успеха или ошибки.                                       |
| `retry`      | `boolean \| number \| (failureCount, error) => boolean`       | Повторные попытки. По умолчанию: `0`. См. раздел «Повторные попытки».     |
| `retryDelay` | `number \| (failureCount, error) => number`                   | Задержка перед повторной попыткой в миллисекундах.                        |

#### Поля и методы

| Поле/метод     | Описание                                             |
| -------------- | ---------------------------------------------------- |
| `state`        | Текущее состояние мутации.                           |
| `data`         | Данные последней успешной актуальной мутации.        |
| `error`        | Ошибка последней неуспешной актуальной мутации.      |
| `isIdle`       | `true`, если мутация в idle-состоянии.               |
| `isPending`    | `true`, если мутация выполняется.                    |
| `isSuccessful` | `true`, если актуальная мутация успешна.             |
| `isError`      | `true`, если актуальная мутация завершилась ошибкой. |
| `mutate(arg)`  | Запускает мутацию.                                   |
| `reset()`      | Сбрасывает состояние в idle.                         |

## Выполнение mutation

Mutation выполняется в таком порядке:

```ts
onMutate
mutationFn c повторными попытками
onSuccess / onError
onSettled
```

`onMutate` вызывается перед `mutationFn`. Его удобно использовать для оптимистичного изменения store и создания снимка предыдущего состояния.

```ts
onMutate: (params) => {
  const snapshot = this.snapshot(params.id);

  this.applyOptimistic(params);

  return snapshot;
};
```

Значение, которое вернул `onMutate`, передается в остальные обработчики. Обычно это снимок состояния, данные для отката или служебная информация операции.

```ts
onError: (_error, _params, snapshot) => {
  if (snapshot) {
    this.restore(snapshot);
  }
};
```

`mutationFn` выполняет основную операцию. Если задан `retry`, повторяется только `mutationFn`; `onMutate` не вызывается повторно на каждой попытке.

`onSuccess` вызывается после успешного выполнения.

`onError` вызывается после финальной ошибки, когда повторные попытки больше не выполняются.

`onSettled` вызывается после успеха или ошибки.

Сигнатуры обработчиков:

```ts
onSuccess(data, arg, onMutateResult);
onError(error, arg, onMutateResult);
onSettled(data, error, arg, onMutateResult);
```

Обработчики из конфигурации mutation вызываются для каждого запуска.

Обработчики, переданные в отдельный вызов `mutate(arg, options)`, вызываются только для последнего актуального запуска.

Для mutation `retry` по умолчанию равен `0`, потому что автоматический повтор операции может привести к нежелательным повторным изменениям на сервере.

## Request vs Mutation

Использовать request для операций чтения данных: загрузка списка, деталей, справочника или состояния с сервера. Request идентифицируется `requestKey` и дает дедупликацию одинаковых in-flight запросов, refetch при изменении параметров, polling и `placeholderData`.

Использовать mutation для операций записи или изменения данных: сохранение, удаление, применение действия. При новом запуске mutation очищает предыдущие `data/error`, не требует `requestKey` и дает этапы выполнения `onMutate/onSuccess/onError/onSettled` для оптимистичных изменений, отката и реакции на результат.

## Повторные попытки

`retry` управляет количеством повторных попыток после ошибки.

```ts
retry: false;
retry: 0;
retry: 3;
retry: (failureCount, error) => failureCount < 2;
```

Значения:

| Значение   | Поведение                                                                             |
| ---------- | ------------------------------------------------------------------------------------- |
| `false`    | Повторные попытки отключены.                                                          |
| `true`     | Повторять без ограничения, пока операция не завершится успешно или не будет отменена. |
| `number`   | Максимальное количество повторных попыток после первого неуспешного запуска.          |
| `function` | Функция вызывается после ошибки и решает, нужно ли повторять операцию.                |

`failureCount` начинается с `0` для первой ошибки.

Если `retry` задан функцией, возвращаемое значение определяет, будет ли следующая попытка:

```ts
retry: (failureCount, error) => {
  return failureCount < 2 && isNetworkError(error);
};
```

`true` означает повторить операцию, `false` означает завершить ее ошибкой.

`retryDelay` управляет паузой перед следующей попыткой. Если задана функция, ее возвращаемое значение используется как задержка в миллисекундах:

```ts
retryDelay: 1000;
retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 30_000);
```

Это позволяет увеличивать паузу после каждой ошибки или выбирать задержку по типу ошибки.

Если `retryDelay` не задан, используется экспоненциальная задержка:

```ts
Math.min(1000 * 2 ** failureCount, 30_000);
```

Если во время ожидания retry внешний `signal` был отменен, операция завершается `CancelledError`.

### Значения по умолчанию

По умолчанию request использует 3 повторные попытки.

Mutation по умолчанию использует `retry: 0`.

## Отличие от `@asudd/infra/query`

В инфраструктуре есть два слоя:

```ts
@asudd/infra/query
@asudd/infra/async
```

`@asudd/infra/async` является предпочтительным API для нового store-driven кода. `@asudd/infra/query` стоит использовать только точечно, когда query cache действительно должен быть источником данных.

`@asudd/infra/query` построен поверх TanStack Query. В этой модели данные, полученные с сервера, идентифицируются `queryKey` и живут в query cache: для них работают состояние свежести, инвалидация и повторная загрузка через query client.

В приложении часто используется другая модель: данные гидратируют domain models и MobX stores. Store хранит коллекции, детали, фильтры, локальные изменения, оптимистичные обновления и принимает события из websocket/hub потоков. В таком случае store уже выполняет роль кэша и основного источника данных для UI.

Если поверх этого добавить query cache, появляются два источника истины:

- query cache хранит server-state;
- store хранит те же данные в моделях;
- обновления из событий и ручные изменения нужно синхронизировать с обоими слоями.

`@asudd/infra/async` решает другую задачу: он не хранит серверные данные как отдельный кэш, а управляет выполнением операции и ее состоянием. Результат запроса применяется туда, где живут данные: в store, модель или workflow.

`@asudd/infra/async` подходит, когда:

- store является основным источником данных;
- запрос нужен для гидратации или инициализации моделей;
- результат запроса нужно применить в существующую domain model или store;
- данные обновляются не только HTTP-запросами, но и событиями;
- нужно контролировать состояние операции: ожидание, ошибка, успех;
- нужны retry, дедубликация запросов или обработчики mutation без query cache.

`@asudd/infra/query` стоит использовать точечно, когда query cache действительно должен быть источником данных:

- данные идентифицируются `queryKey`;
- нужна механика TanStack Query: инвалидация, refetch и жизненный цикл кэша;
- query cache является source of truth для этих данных;
- данные не дублируются в store как основной кэш.

Практическое правило:

```ts
// По умолчанию для данных, которые живут в store/model
createObservableResource / createObservableTask / createObservableMutation;

// Точечно, если данные живут в query cache
createQuery / createInfiniteQuery;
```
