import { JSX } from "react";
import { Route } from "react-router-dom";

export const convertRouteObjectToJSX = (route: any): JSX.Element => {
  return (
    <Route path={route.path} element={route.element} errorElement={route.errorElement}>
      {route.children?.map((child: any, index: number) => (
        <Route
          key={index}
          index={child.index}
          path={child.path}
          element={child.element}
        />
      ))}
    </Route>
  );
};
