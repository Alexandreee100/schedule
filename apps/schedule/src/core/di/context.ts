import { ContainerInstance } from "@schedule/di";
import { createContext } from "react";

export const ContainerContext = createContext(ContainerInstance);
export const ContainerProvider = ContainerContext.Provider;
