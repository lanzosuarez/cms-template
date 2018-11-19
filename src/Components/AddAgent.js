import React, { Component } from "react";

import { Modal, Form, Input, Button, Select, message, Alert } from "antd";
import { APP_NAME } from "../globals";
import AgentService from "../services/AgentService";

const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;

class AddAgent extends Component {
  state = { loading: false, err: false, errMsg: "" };

  toggleLoading = () => this.setState({ loading: !this.state.loading });

  cancelCreateAgent = () => {};

  componentWillUnmount() {
    this.cancelCreateAgent();
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { username, email, password, type } = values;
        this.createAgent({
          app: APP_NAME,
          username,
          email,
          password,
          type,
          permission: "RWUD",
          queued: 0,
          is_login: false
        });
      } else {
        console.log(err);
      }
    });
  };

  createAgent = async payload => {
    try {
      this.setState({ err: false });
      this.toggleLoading();
      await AgentService.addAgent(
        payload,
        token => (this.cancelCreateAgent = token)
      );
      this.toggleLoading();
      this.props.toggleShowAdd();
      this.props.fetchResources();
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        if (response.status === 401) {
          this.gotoHome();
          return;
        }
        this.setState({ err: true });
        this.setState({ errMsg: error.response.data.errorMessage });
      }
    }
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
    } else {
      callback();
    }
  };

  closeModal = () => {
    const { toggleShowAdd } = this.props;
    const { isFieldsTouched } = this.props.form;
    if (isFieldsTouched()) {
      confirm({
        title: "Are you sure you want to close this dialog?",
        content: "Unsaved changes will be gone",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: () => toggleShowAdd()
      });
    } else {
      toggleShowAdd();
    }
  };

  gotoHome = () => {
    message.warn("Your session has expired. Logging you out");
    window.setTimeout(() => (window.location.pathname = ""), 2000);
  };

  render() {
    const { loading, err, errMsg } = this.state;
    const { visible } = this.props;
    const { getFieldDecorator, resetFields } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    };
    return (
      <Modal
        destroyOnClose
        confirmLoading={loading}
        maskClosable={!loading}
        closable={!loading}
        footer={null}
        title="Add Agent"
        visible={visible}
        onCancel={() => this.closeModal()}
      >
        <Form onSubmit={this.handleSubmit}>
          {err && (
            <Alert
              style={{ marginBottom: 10 }}
              message={errMsg}
              type="error"
              showIcon
            />
          )}
          <FormItem {...formItemLayout} label="Username">
            {getFieldDecorator("username", {
              rules: [
                {
                  required: true,
                  message: "Please input the agent username"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="E-mail">
            {getFieldDecorator("email", {
              rules: [
                {
                  type: "email",
                  message: "The input is not valid E-mail!"
                },
                {
                  required: true,
                  message: "Please input your E-mail!"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Password">
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: "Please input your password!"
                }
              ]
            })(<Input type="password" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Confirm Password">
            {getFieldDecorator("confirm", {
              rules: [
                {
                  required: true,
                  message: "Please confirm your password!"
                },
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(<Input type="password" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="User type">
            {getFieldDecorator("type", { initialValue: "agent" })(
              <Select>
                <Option value="agent">Agent</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout}>
            <Button
              loading={loading}
              style={{ marginRight: 10 }}
              disabled={loading}
              type="primary"
              htmlType="submit"
            >
              Create
            </Button>
            <Button onClick={() => resetFields()}>Reset</Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(AddAgent);
