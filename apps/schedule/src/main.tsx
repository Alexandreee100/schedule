import "@radix-ui/themes/styles.css";

import { invariant } from "@schedule/core/asserts";
import { createRoot } from "react-dom/client";
import { App } from "./app";

const main = () => {
    const element = document.getElementById("root");
    invariant(element !== null);
    const root = createRoot(element);

    root.render(<App />);
};

main();
