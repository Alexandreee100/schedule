import { createAsyncApi } from "@schedule/async";

const api = createAsyncApi();
export const {createObservableRequest, createObservableMutation, createObservableAsyncTask}  = api;

export const requestClient = api.createRequestClient();
