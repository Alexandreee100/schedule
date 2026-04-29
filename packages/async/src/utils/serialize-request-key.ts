import { isPlainObject } from "./is-plain-object";
import type { RequestKey } from "../request/types";

export type SerializeRequestKeyFn = <TRequestKey extends RequestKey>(requestKey: TRequestKey) => string;

export const serializeRequestKey = (requestKey: RequestKey): string =>
    JSON.stringify(requestKey, (_, value) => {
        if (isPlainObject(value)) {
            const sorted: Record<string, unknown> = {};

            for (const key of Object.keys(value).sort()) {
                sorted[key] = value[key];
            }

            return sorted;
        }

        return value;
    });
