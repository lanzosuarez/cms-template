import React, { Component, lazy } from "react";

import { BrowserRouter, Route } from "react-router-dom";

import "./App.css";

import PrivateRoute from "./Components/PrivateRoute";
import Login from "./Components/Login";
import UserService from "./services/UserService";
import Loading from "./Components/Loading";
import { AuthContext } from "./context/AuthProvider";

const Admin = lazy(() => import("./Components/Admin"));

class App extends Component {
  static contextType = AuthContext;
  state = { loading: false };

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));

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

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          {this.state.loading ? (
            <Loading />
          ) : (
            <React.Fragment>
              <Route exact path="" component={Login} />
              <PrivateRoute path="/a" component={Admin} />
            </React.Fragment>
          )}
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
