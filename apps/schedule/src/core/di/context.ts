import { Container } from "@schedule/di";
import { createContext } from "react";

export const RootContainer = new Container();

export const ContainerContext = createContext(RootContainer);
export const ContainerProvider = ContainerContext.Provider;
