import React, { Component } from "react";
import { Row, Col, Table, Tag, message, Input, Button, Radio } from "antd";
import { APP_NAME, ACTIVE_USER, DEACTIVATED } from "../globals";
import format from "date-fns/format";
import { ComponentConnect } from "../context/contextHelper";
import { SkuConsumer } from "../context/SkuProvider";
import AddProduct from "./AddProduct";
import SkuService from "../services/SkuService";
import SkuHeader from "./SkuHeader";
import ProductDetails from "./ProductDetails";
import EditProduct from "./EditProduct";

const { Column } = Table;
const { Search } = Input;

class Products extends Component {
  state = {
    pageSize: 20,
    loading: false,
    page: 1,
    qName: "",
    fields: "",
    qStatus: "1",
    showAdd: false,
    selectedProduct: null
  };

  cancelGetProducts = () => {};
  cancelGetProductsCount = () => {};

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));
  toggleShowAdd = () => this.setState(({ showAdd }) => ({ showAdd: !showAdd }));

  componentWillUnmount() {
    this.cancelGetProducts();
    this.cancelGetProductsCount();
  }

  componentDidMount() {
    const { totalProductCount: tsc, products: p } = this.props;
    //skip get if theres a cache version
    if (tsc !== null && p) {
      return;
    }
    this.fetchResources();
  }

  fetchResources = async () => {
    try {
      this.toggleLoading();
      const res = await Promise.all([
        this.getProducts(),
        this.getProductsCount()
      ]);
      this.toggleLoading();

      const [p, pcount] = res;
      const products = p.data.data;
      const totalProductCount = pcount.data.data;

      console.log(products, totalProductCount);

      //cache initital fetch
      this.props.setSkuState("products", products);
      this.props.setSkuState("totalProductCount", totalProductCount);
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        if (response.status === 401) {
          this.gotoHome();
          return;
        }
        message.error(response.errorMessage);
      }
    }
  };

  setSelectedProduct = selectedProduct => this.setState({ selectedProduct });

  getProducts = () => {
    const { page, qName, qStatus } = this.state;
    return SkuService.getProducts(
      { qApp: APP_NAME, page, qName, qStatus, populate: "skus;name,taxonomy" },
      cancelToken => (this.cancelGetProducts = cancelToken)
    );
  };

  getProductsCount = () => {
    const { qName, qStatus } = this.state;
    return SkuService.getProductsCount(
      { qApp: APP_NAME, qName, qStatus },
      cancelToken => (this.cancelGetProductsCount = cancelToken)
    );
  };

  onShowSizeChange = (_, pageSize) => {
    this.setState({ pageSize }, this.searchProduct);
  };

  onTableChange = (page, _) => {
    this.setState({ page }, this.searchProduct);
  };

  searchProduct = async () => this.fetchResources();

  gotoHome = () => {
    message.warn("Your session has expired. Logging you out");
    window.setTimeout(() => (window.location.pathname = ""), 2000);
  };

  clearFilterState = (state, all = false) => {
    if (all) {
      this.setState({ qUsername: "", qEmail: "" });
    } else {
      this.setState({ [state]: "" });
    }
    this.searchProduct();
  };

  handleChangeSearch = (key, val, cb = () => {}) =>
    this.setState({ [key]: val }, cb);

  searchDropDown = (state, placeholder) => (
    <div className="custom-filter-dropdown">
      <Search
        value={this.state[state]}
        onChange={e => this.handleChangeSearch(state, e.target.value)}
        onSearch={this.searchProduct}
        ref={ele => (this.searchInput = ele)}
        placeholder={`Search by ${placeholder}`}
      />
      <Button onClick={() => this.clearFilterState(state)}>Clear</Button>
    </div>
  );

  searchSelect = () => (
    <div className="custom-select-dropdown">
      <Radio.Group
        value={this.state.qStatus}
        onChange={e => {
          this.handleChangeSearch(
            "qStatus",
            e.target.value,
            this.fetchResources
          );
        }}
      >
        <Radio.Button value={"1"}>Active</Radio.Button>
        <Radio.Button value={"0"}>Deactivated</Radio.Button>
      </Radio.Group>
    </div>
  );

  handleSearchHighlight = (state, text) => {
    const search = this.state[state];
    return search ? (
      <span>
        {text
          .split(new RegExp(`(?<=${search})|(?=${search})`, "i"))
          .map((fragment, i) =>
            fragment.toLowerCase() === search.toLowerCase() ? (
              <span key={i} className="highlight">
                {fragment}
              </span>
            ) : (
              fragment
            )
          )}
      </span>
    ) : (
      text
    );
  };

  render() {
    const { loading, pageSize, page, showAdd, selectedProduct } = this.state;
    const { products } = this.props;
    return (
      <Row className="agents-con" type="flex" justify="center">
        <Col className="agents-col" xl={23} lg={23} md={23} sm={23} xs={23}>
          <Table
            expandedRowRender={record => <ProductDetails sku={record} />}
            title={() => (
              <SkuHeader
                toggleShowAdd={this.toggleShowAdd}
                loading={loading}
                fetchResources={this.fetchResources}
                clearFilterState={this.clearFilterState}
              />
            )}
            pagination={{
              pageSize,
              onChange: this.onTableChange,
              current: page,
              defaultCurrent: page,
              defaultPageSize: pageSize,
              showSizeChanger: true,
              onShowSizeChange: this.onShowSizeChange,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
            }}
            loading={loading}
            bordered
            dataSource={
              products
                ? products.map(a => {
                    a.key = a._id;
                    return a;
                  })
                : null
            }
          >
            <Column
              filterDropdown={() => this.searchDropDown("qName", "name")}
              title="Name"
              dataIndex="name"
              key="name"
              render={text => this.handleSearchHighlight("qName", text)}
            />
            <Column
              title="Created at"
              dataIndex="timestamp"
              key="timestamp"
              render={text => (
                <span>{format(text, "MMM D, YYYY hh:mm A")}</span>
              )}
            />
            <Column
              filterDropdown={() => this.searchSelect()}
              title="Status"
              dataIndex="status"
              key="status"
              render={status => (
                <Tag color={status ? ACTIVE_USER : DEACTIVATED}>
                  {status ? "ACTIVE" : "DEACTIVATED"}
                </Tag>
              )}
            />
            <Column
              title="Action"
              key="action"
              render={(text, agent) => (
                <span>
                  {/* <a>View</a> */}
                  {/* <Divider type="vertical" /> */}
                  <a
                    onClick={() => {
                      console.log(agent);
                      this.setSelectedProduct(agent);
                    }}
                  >
                    Edit
                  </a>
                </span>
              )}
            />
          </Table>
        </Col>
        <AddProduct
          fetchResources={this.fetchResources}
          visible={showAdd}
          toggleShowAdd={this.toggleShowAdd}
        />
        {selectedProduct && (
          <EditProduct
            fetchResources={this.fetchResources}
            setSelectedProduct={this.setSelectedProduct}
            selectedProduct={selectedProduct}
          />
        )}
      </Row>
    );
  }
}

export default ComponentConnect(
  ["products", "totalProductCount", "setSkuState"],
  SkuConsumer
)(Products);
