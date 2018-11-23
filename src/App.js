import React, { Component, lazy } from "react";

import { BrowserRouter, Route } from "react-router-dom";

import "./App.css";

import PrivateRoute from "./Components/PrivateRoute";
import Login from "./Components/Login";
import UserService from "./services/UserService";
import Loading from "./Components/Loading";
import { AuthContext } from "./context/AuthProvider";
import SocketService from "./services/SocketService";
import { LOGOUT } from "./globals";

const Admin = lazy(() => import("./Components/Admin"));

class App extends Component {
  static contextType = AuthContext;
  state = { loading: false };

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));

  UNSAFE_componentWillMount() {
    this.handleUnload();
  }

  async componentDidMount() {
    try {
      this.toggleLoading();
      const res = await UserService.validateToken();
      this.context.setUser(res.data.data);
      this.toggleLoading();
      this.context.toggleAuthenticated();
    } catch (error) {
      console.error(error);
      if (error.response) {
        this.toggleLoading();
      } else {
        this.toggleLoading();
      }
    }
  }

  handleUnload = () => {
    window.onbeforeunload = function() {
      SocketService.emitEvent(LOGOUT, {});
    };
  };

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          {this.state.loading ? (
            <Loading />
          ) : (
            <React.Fragment>
              <Route exact path="" component={Login} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/a" component={Admin} />
            </React.Fragment>
          )}
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
