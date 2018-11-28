import React, { Component } from "react";

import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Alert,
  Steps,
  Select,
  Spin
} from "antd";

import debounce from "lodash/debounce";
import { APP_NAME } from "../globals";
import SkuService from "../services/SkuService";

const FormItem = Form.Item;

const { confirm } = Modal;
const { Step } = Steps;
const { Option } = Select;

class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchSkus = debounce(this.fetchSkus, 800);
  }

  state = {
    loading: false,
    err: false,
    errMsg: "",
    step: 1,
    skus: [],
    fetching: false
  };

  toggleLoading = () => this.setState({ loading: !this.state.loading });
  toggleFetching = () => this.setState({ fetching: !this.state.fetching });

  cancelCreateProduct = () => {};
  cancelSearchSku = () => {};

  componentWillUnmount() {
    this.cancelCreateProduct();
    this.cancelSearchSku();
  }

  fetchSkus = value => {
    console.log("fetching sku", value);
    this.lastFetchId += 1; //increment fetchId
    const fetchId = this.lastFetchId; //reference
    this.setState({ skus: [], fetching: true }); //empty skus toggle loading
    console.log({
      qApp: APP_NAME,
      qName: value,
      paginated: 1,
      fields: "name"
    });
    SkuService.getSkus(
      {
        qApp: APP_NAME,
        qName: value,
        paginated: 1,
        fields: "name"
      },
      token => (this.cancelSearchSku = token)
    )
      .then(res => {
        if (fetchId !== this.lastFetchId) {
          // for fetch callback order
          return;
        }
        console.log(res.data.data);

        this.setState({ skus: res.data.data, fetching: false });
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { name, description, skus } = values;
        this.createProduct({
          app: APP_NAME,
          name,
          description,
          skus: skus.map(s => s.key)
        });
      } else {
        console.log(err);
      }
    });
  };

  createProduct = async payload => {
    try {
      const { toggleShowAdd, fetchResources } = this.props;
      this.setState({ err: false });
      this.toggleLoading();
      await SkuService.addProduct(
        payload,
        token => (this.cancelCreateProduct = token)
      );
      this.toggleLoading();

      toggleShowAdd();
      fetchResources();
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

  handleStep = step => this.setState({ step });

  handleChange = value => {
    this.setState({
      value,
      data: [],
      fetching: false
    });
  };

  render() {
    const { loading, err, errMsg, step, skus, fetching } = this.state;
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
        title="Add Product"
        visible={visible}
        onCancel={() => this.closeModal()}
      >
        <div className="steps-con">
          <Steps size="small" current={step} style={{ width: "80%" }}>
            <Step title="Details" />
            <Step title="Add SKUS's" />
          </Steps>
        </div>

        <Form onSubmit={this.handleSubmit}>
          {err && (
            <Alert
              style={{ marginBottom: 10 }}
              message={errMsg}
              type="error"
              showIcon
            />
          )}
          <div className={step !== 1 ? "hidden" : ""}>
            <FormItem {...formItemLayout} label="Product Name">
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "Please input the product name"
                  }
                ]
              })(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Product Description">
              {getFieldDecorator("description", {
                rules: [
                  {
                    required: true,
                    message: "Please input the product description"
                  }
                ]
              })(<Input.TextArea />)}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button
                onClick={() => this.handleStep(2)}
                style={{ marginRight: 10 }}
                type="primary"
              >
                Next
              </Button>
              <Button onClick={() => resetFields()}>Reset</Button>
            </FormItem>
          </div>
          <div className={step !== 2 ? "hidden" : ""}>
            <FormItem {...formItemLayout} label="Sku's">
              {getFieldDecorator("skus")(
                <Select
                  mode="multiple"
                  labelInValue
                  placeholder="Type an sku name"
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  filterOption={false}
                  onSearch={this.fetchSkus}
                  onChange={this.handleChange}
                  style={{ width: "100%" }}
                >
                  {skus.map(d => (
                    <Option value={d._id} key={d._id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>

            <FormItem {...tailFormItemLayout}>
              <Button
                disabled={loading}
                onClick={() => this.handleStep(1)}
                style={{ marginRight: 10 }}
                type="primary"
              >
                Back
              </Button>
              <Button
                disabled={loading}
                loading={loading}
                type="primary"
                htmlType="submit"
              >
                Create
              </Button>
            </FormItem>
          </div>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(AddProduct);
