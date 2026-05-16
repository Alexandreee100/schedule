import { Container } from "@freshgum/typedi";
import { createContext } from "react";

export const ContainerContext = createContext(Container);
export const ContainerProvider = ContainerContext.Provider;
