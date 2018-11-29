import React, { Component } from "react";

import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Alert,
  InputNumber,
  Upload,
  Icon,
  Checkbox
} from "antd";
import {
  APP_NAME,
  PLACEHOLDER_IMG,
  CLOUDINARY_UPLOAD_PRESET,
  BRAND,
  CATEGORIES
} from "../globals";
import SkuService from "../services/SkuService";
import UploadService from "../services/UploadService";

const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;
const { Group: CheckboxGroup } = Checkbox;

class AddSku extends Component {
  state = { loading: false, err: false, errMsg: "" };

  toggleLoading = () => this.setState({ loading: !this.state.loading });

  cancelCreateSku = () => {};

  componentWillUnmount() {
    this.cancelCreateSku();
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const {
          name,
          price,
          image,
          image_link,
          taxonomy
          // product_code
        } = values;
        let images;
        if (image) {
          images = await this.upload(image.map(i => i.thumbUrl));
        } else if (image_link) {
          images = [image_link];
        } else {
          images = [PLACEHOLDER_IMG];
        }
        this.createSku({
          app: APP_NAME,
          name,
          price,
          images,
          taxonomy: taxonomy.map(t => t.toLowerCase()),
          brand: BRAND
          // product_code
        });
      } else {
        console.log(err);
      }
    });
  };

  upload = async files => {
    let images;
    this.toggleLoading();
    images = await this.uploadFiles(files);
    this.toggleLoading();
    return images;
  };

  createSku = async payload => {
    try {
      const { toggleShowAdd, fetchResources } = this.props;
      this.setState({ err: false });
      this.toggleLoading();
      await SkuService.addSku(payload, token => (this.cancelCreateSku = token));
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

  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  uploadImage = (formItemLayout, getFieldDecorator) => {
    const fileList = this.props.form.getFieldValue("image") || [];
    return (
      <FormItem {...formItemLayout} label="Image">
        {getFieldDecorator("image", {
          valuePropName: "fileList",
          getValueFromEvent: this.normFile
        })(
          <Upload
            showUploadList={{
              showPreviewIcon: false,
              showRemoveIcon: true
            }}
            disabled={fileList.length === 1}
            beforeUpload={() => false}
            accept="image/*"
            listType="picture-card"
            re
          >
            <Icon type="upload" />
          </Upload>
        )}
      </FormItem>
    );
  };

  uploadFiles = async files => {
    try {
      const fs = await Promise.all(
        files.map(async f => {
          const res = await UploadService.uploadImage(this.formData(f));
          return res.data.secure_url;
        })
      );
      return fs;
    } catch (error) {
      message.error("Error uploading photo");
    }
  };

  formData = file => {
    var formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    return formData;
  };

  gotoHome = () => {
    message.warn("Your session has expired. Logging you out");
    window.setTimeout(() => (window.location.pathname = ""), 2000);
  };

  render() {
    const { loading, err, errMsg } = this.state;
    const { visible } = this.props;
    const { getFieldDecorator, resetFields, getFieldValue } = this.props.form;
    const imageSource = getFieldValue("image_source");

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
        title="Add SKU"
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
          {/* <FormItem {...formItemLayout} label="Product Code">
            {getFieldDecorator("product_code", {
              rules: [
                {
                  required: true,
                  message: "Please input the product code"
                }
              ]
            })(<Input />)}
          </FormItem> */}
          <FormItem {...formItemLayout} label="Product Name">
            {getFieldDecorator("name", {
              rules: [
                {
                  required: true,
                  message: "Please input the sku name"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Categories">
            {getFieldDecorator("taxonomy", {
              rules: [
                {
                  required: true,
                  message: "Select a category"
                }
              ],
              getValueFromEvent: e => e
            })(<CheckboxGroup options={CATEGORIES.map(cat => cat.text)} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Price">
            {getFieldDecorator("price", {
              initialValue: 1,
              rules: [
                {
                  required: true,
                  message: "Please input the sku price"
                }
              ]
            })(<InputNumber min={1} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Image source">
            {getFieldDecorator("image_source", { initialValue: 1 })(
              <Select>
                <Option value={1}>Upload</Option>
                <Option value={2}>Image Link</Option>
              </Select>
            )}
          </FormItem>

          {imageSource === 1 &&
            this.uploadImage(formItemLayout, getFieldDecorator)}
          {imageSource === 2 && (
            <FormItem {...formItemLayout} label="Image Link">
              {getFieldDecorator("image_link")(<Input />)}
            </FormItem>
          )}
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

export default Form.create()(AddSku);
