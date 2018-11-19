import React, { Component } from "react";

import { Row, Col, Form, Icon, Input, Button, Alert } from "antd";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import UserService from "../services/UserService";

const FormItem = Form.Item;

export class Login extends Component {
  static contextType = AuthContext;

  state = {
    loading: false,
    err: false,
    errMsg: "",
    success: false,
    redirectToReferrer: false
  };

  componentDidMount() {
    if (!this.context.isAuthenticated) {
      this.setState({ redirectToReferrer: true });
    }
  }

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.login(values);
      }
    });
  };

  login = async data => {
    try {
      this.setState({ err: false });
      this.toggleLoading();
      const res = await UserService.login(data);
      const { token, user } = res.data.data;
      this.storeToken(token);
      this.context.toggleAuthenticated();
      this.context.setUser(user);
      this.toggleLoading();
      this.setState({ success: true });
      this.toToAdminIn1sec();
    } catch (error) {
      if (error.response) {
        this.toggleLoading();
        this.setState({ err: true });
        this.setState({ errMsg: error.response.data.errorMessage });
      } else {
        this.toggleLoading();
      }
    }
  };

  storeToken = token => localStorage.setItem("token", token);

  toToAdminIn1sec = () => this.props.location.push("/a");

  render() {
    const { from } = this.props.location.state || { from: { pathname: "/a" } };
    const { err, errMsg, success } = this.state;
    const { getFieldDecorator } = this.props.form;
    
    return !this.context.isAuthenticated ? (
      <Row className="w100 h100" type="flex" justify="center" align="middle">
        <Col className="login-form-con" xs={18} xss={20} sm={9} lg={6}>
          <h2 className="tcenter">LOG IN</h2>
          <p className="tcenter">Login to access admin panel</p>
          {err && (
            <Alert
              style={{ marginBottom: 10 }}
              message={errMsg}
              type="error"
              showIcon
            />
          )}
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem className="login-item">
              {getFieldDecorator("email", {})(
                <Input
                  className="login-input"
                  prefix={<Icon type="user" className="input-icon" />}
                  placeholder="Email  "
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator("password", {})(
                <Input
                  className="login-input"
                  prefix={<Icon type="lock" className="input-icon" />}
                  type="password"
                  placeholder="Password"
                />
              )}
            </FormItem>
            <FormItem>
              <div className="d-login">
                <Button
                  htmlType="submit"
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  type="primary"
                  className="login-btn bg w100"
                >
                  LOGIN TO YOUR PROFILE
                  {success && (
                    <Icon
                      type="check-circle"
                      theme="twoTone"
                      twoToneColor="#52c41a"
                    />
                  )}
                </Button>
              </div>
            </FormItem>
          </Form>
        </Col>
      </Row>
    ) : (
      <Redirect to={from} />
    );
  }
}

export default Form.create()(Login);
