import { useContext } from "react";
import { ContainerContext } from "@/di/context";

export const useContainer = () => useContext(ContainerContext);
