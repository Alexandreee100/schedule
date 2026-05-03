import "@radix-ui/themes/styles.css";

import { createRoot } from "react-dom/client";
import { App } from "./app";
import { invariant } from "@/shared/asserts";

const main = () => {
    const element = document.getElementById("root");
    invariant(element !== null);
    const root = createRoot(element);

    root.render(<App />);
}

main();
