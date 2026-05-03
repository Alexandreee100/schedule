import { createAsyncApi } from "@schedule/async";

const api = createAsyncApi();
export const {createObservableResource, createObservableMutation, createObservableTask} = api;

export const requestClient = api.createRequestClient();
