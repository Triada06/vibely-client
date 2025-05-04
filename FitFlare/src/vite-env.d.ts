/// <reference types="vite/client" />
// Tell TS how to handle *.svg imports
declare module "*.svg?react" {
    import * as React from "react";
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  }