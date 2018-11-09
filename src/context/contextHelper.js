import React from "react";

export function ComponentConnect(params = [], ContextCounsumer) {
  return function ComponentConnectedComponent(Component) {
    return function ConnectedComponentParameter(props) {
      return (
        <ContextCounsumer>
          {state => {
            let requestedState = {};
            params.forEach(param => {
              if (state[param] !== undefined) {
                requestedState[param] = state[param];
              }
            });
            return <Component {...props} {...requestedState} />;
          }}
        </ContextCounsumer>
      );
    };
  };
}
