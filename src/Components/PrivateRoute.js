import React, { Suspense } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthConsumer } from "../context/AuthProvider";
import Loading from "./Loading";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <AuthConsumer>
        {({ isAuthenticated }) =>
          isAuthenticated === true ? (
            <Suspense fallback={<Loading />}>
              <Component />
            </Suspense>
          ) : (
            <Redirect
              to={{
                pathname: "/",
                state: { from: props.location }
              }}
            />
          )
        }
      </AuthConsumer>
    )}
  />
);

export default PrivateRoute;
