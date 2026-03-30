import { FrontendRenderer, FrontendRendererArgs } from "@streamlit/component-v2-lib";
import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import VoronoiComponent from "./VoronoiComponent";
import './index.css';

// Handle the possibility of multiple instances of the component to keep track
// of the React roots for each component instance.
const reactRoots: WeakMap<FrontendRendererArgs["parentElement"], Root> = new WeakMap();

const VoronoiRoot: FrontendRenderer<any, any> = (args) => {
  const { data, parentElement } = args;

  // Get the react-root div from the parentElement that we defined in our
  // `st.components.v2.component` call in Python.
  const rootElement = parentElement.querySelector(".react-root");

  if (!rootElement) {
    console.error("react-root not found in parentElement:", parentElement.innerHTML);
    return;
  }

  // Check to see if we already have a React root for this component instance.
  let reactRoot = reactRoots.get(parentElement);
  if (!reactRoot) {
    reactRoot = createRoot(rootElement);
    reactRoots.set(parentElement, reactRoot);
  }

  // Pass any kwargs from Python directly into Voronoi Component
  reactRoot.render(
    <StrictMode>
      <VoronoiComponent 
        data={args.data} 
        {...args} // all custom kwargs passed from Python
      />
    </StrictMode>,
  );

  return () => {
    const reactRoot = reactRoots.get(parentElement);

    if (reactRoot) {
      reactRoot.unmount();
      reactRoots.delete(parentElement);
    }
  };
};

export default VoronoiRoot;
