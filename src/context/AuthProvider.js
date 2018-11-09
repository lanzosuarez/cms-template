import React from "react";

export const AuthContext = React.createContext();
export const AuthConsumer = AuthContext.Consumer;

export class AuthProvider extends React.Component {
  state = {
    isAuthenticated: false,
    user: null
  };

  toggleAuthenticated = () => {
    this.setState(({ isAuthenticated }) => ({
      isAuthenticated: !isAuthenticated
    }));
  };

  setUser = user => this.setState({ user });

  render() {
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated: this.state.isAuthenticated,
          user: this.state.user,
          toggleAuthenticated: this.toggleAuthenticated,
          setUser: this.setUser
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}
