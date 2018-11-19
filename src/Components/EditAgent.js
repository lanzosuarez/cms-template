import React, { Component } from "react";

import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Alert,
  Switch
} from "antd";
import AgentService from "../services/AgentService";
import { APP_NAME } from "../globals";

const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;

class EditAgent extends Component {
  state = { loading: false, err: false, errMsg: "" };

  toggleLoading = () => this.setState({ loading: !this.state.loading });

  cancelUpdateAgent = () => {};

  componentWillUnmount() {
    this.cancelUpdateAgent();
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        const { username, email, type, status } = values;
        this.editAgent({
          app: APP_NAME,
          username,
          email,
          type,
          status: status ? 1 : 0
        });
      } else {
        console.log(err);
      }
    });
  };

  editAgent = async payload => {
    try {
      this.setState({ err: false });
      this.toggleLoading();
      await AgentService.editAgent(
        payload,
        this.props.selectedAgent._id,
        token => (this.cancelUpdateAgent = token)
      );
      this.toggleLoading();
      this.props.setSelectdAgent(null);
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
    const { isFieldsTouched } = this.props.form;
    const { setSelectdAgent } = this.props;
    if (isFieldsTouched()) {
      confirm({
        title: "Are you sure you want to close this dialog?",
        content: "Unsaved changes will be gone",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: () => setSelectdAgent(null)
      });
    } else {
      setSelectdAgent(null);
    }
  };

  gotoHome = () => {
    message.warn("Your session has expired. Logging you out");
    window.setTimeout(() => (window.location.pathname = ""), 2000);
  };

  render() {
    const { loading, errMsg, err } = this.state;
    const { selectedAgent } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { username, email, type, status } = selectedAgent || {};

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
        confirmLoading={loading}
        maskClosable={!loading}
        footer={null}
        title="Edit Agent"
        visible={Boolean(selectedAgent)}
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
              initialValue: username,
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
              initialValue: email,
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

          <FormItem {...formItemLayout} label="User type">
            {getFieldDecorator("type", { initialValue: type })(
              <Select>
                {/* <Option value="admin">Admin</Option> */}
                <Option value="agent">Agent</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Status">
            {getFieldDecorator("status", {
              initialValue: Boolean(status),
              valuePropName: "checked"
            })(<Switch />)}
          </FormItem>
          <FormItem {...tailFormItemLayout}>
            <Button
              loading={loading}
              style={{ marginRight: 10 }}
              disabled={loading}
              type="primary"
              htmlType="submit"
            >
              Submit
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(EditAgent);
