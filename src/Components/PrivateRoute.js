import React, { Suspense } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthConsumer } from "../context/AuthProvider";
import Loading from "./Loading";


const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={() => (
      <AuthConsumer>
        {({ isAuthenticated }) =>
          isAuthenticated === true ? (
            <Suspense fallback={<Loading />}>
              <Component />
            </Suspense>
          ) : (
            <Redirect to="" />
          )
        }
      </AuthConsumer>
    )}
  />
);

export default PrivateRoute;
