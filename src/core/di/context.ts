import { createContext } from "react";
import { Container } from "@freshgum/typedi";

export const ContainerContext = createContext(Container);
export const ContainerProvider = ContainerContext.Provider;
