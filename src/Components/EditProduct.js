import React, { Component } from "react";

import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Alert,
  Tooltip,
  Select,
  Spin
} from "antd";

import debounce from "lodash/debounce";
import { APP_NAME } from "../globals";
import SkuService from "../services/SkuService";

const FormItem = Form.Item;

const { confirm } = Modal;

const { Option } = Select;

class EditProduct extends Component {
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

  cancelUpdateProduct = () => {};
  cancelSearchSku = () => {};

  componentWillUnmount() {
    this.cancelUpdateProduct();
    this.cancelSearchSku();
  }

  fetchSkus = value => {
    console.log("fetching sku", value);
    this.lastFetchId += 1; //increment fetchId
    const fetchId = this.lastFetchId; //reference
    this.setState({ skus: [], fetching: true }); //empty skus toggle loading
    SkuService.getSkus(
      {
        qApp: APP_NAME,
        qName: value,
        qTaxonomy: value,
        mergeNameAndTaxonomySearch: "1",
        paginated: 1,
        fields: "name taxonomy"
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
        // console.log({
        //   app: APP_NAME,
        //   name,
        //   description,
        //   skus: skus.map(s => s.key)
        // });
        this.updateProduct({
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

  updateProduct = async payload => {
    try {
      const { setSelectedProduct, fetchResources } = this.props;
      this.setState({ err: false });
      this.toggleLoading();
      await SkuService.updateProduct(
        payload,
        this.props.selectedProduct._id,
        token => (this.cancelUpdateProduct = token)
      );
      this.toggleLoading();
      setSelectedProduct(null);
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
    const { setSelectedProduct } = this.props;
    const { isFieldsTouched } = this.props.form;
    if (isFieldsTouched()) {
      confirm({
        title: "Are you sure you want to close this dialog?",
        content: "Unsaved changes will be gone",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: () => setSelectedProduct(null)
      });
    } else {
      setSelectedProduct(null);
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
    const { name, description, skus: sks } = this.props.selectedProduct;

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
        visible={Boolean(this.props.selectedProduct)}
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

          <FormItem {...formItemLayout} label="Product Name">
            {getFieldDecorator("name", {
              initialValue: name,
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
              initialValue: description,
              rules: [
                {
                  required: true,
                  message: "Please input the product description"
                }
              ]
            })(<Input.TextArea />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Sku's">
            {getFieldDecorator("skus", {
              initialValue: sks.map(s => ({
                key: s._id,
                label: <Tooltip title={s.taxonomy.join(",")}>{s.name}</Tooltip>
              }))
            })(
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
                    <Tooltip title={d.taxonomy.join(",")}>{d.name}</Tooltip>
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>

          <FormItem {...tailFormItemLayout}>
            <Button
              disabled={loading}
              loading={loading}
              type="primary"
              htmlType="submit"
            >
              Update
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(EditProduct);
