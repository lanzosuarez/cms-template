import React, { Component } from "react";
import {
  Row,
  Col,
  Table,
  Tag,
  message,
  Input,
  Button,
  Radio,
  Checkbox
} from "antd";
import { APP_NAME, ACTIVE_USER, DEACTIVATED, CATEGORIES } from "../globals";
import format from "date-fns/format";
import { ComponentConnect } from "../context/contextHelper";
import { SkuConsumer } from "../context/SkuProvider";
import AddSku from "./AddSku";
import EditSku from "./EditSku";
import SkuService from "../services/SkuService";
import SkuHeader from "./SkuHeader";
import SkuDetails from "./SkuDetails";

const { Column } = Table;
const { Search } = Input;
const { Group: CheckboxGroup } = Checkbox;

class Skus extends Component {
  state = {
    pageSize: 20,
    loading: false,
    page: 1,
    qName: "",
    qTaxonomy: [],
    fields: "",
    qStatus: "1",
    showAdd: false,
    selectedSku: null
  };

  cancelGetSkus = () => {};
  cancelGetSkusCount = () => {};

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));
  toggleShowAdd = () => this.setState(({ showAdd }) => ({ showAdd: !showAdd }));

  componentWillUnmount() {
    this.cancelGetSkus();
    this.cancelGetSkusCount();
  }

  componentDidMount() {
    const { totalSkuCount: tsc, skus: s } = this.props;
    //skip get if theres a cache version
    if (tsc !== null && s) {
      return;
    }
    this.fetchResources();
  }

  fetchResources = async () => {
    try {
      this.toggleLoading();
      const res = await Promise.all([this.getSkus(), this.getSkusCount()]);
      this.toggleLoading();

      const [s, scount] = res;
      const skus = s.data.data;
      const totalSkuCount = scount.data.data;

      //cache initital fetch
      this.props.setSkuState("skus", skus);
      this.props.setSkuState("totalSkuCount", totalSkuCount);
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

  setSelectedSku = selectedSku => this.setState({ selectedSku });

  getSkus = () => {
    const { page, qName, qStatus, qTaxonomy } = this.state;
    return SkuService.getSkus(
      {
        qApp: APP_NAME,
        page,
        qName,
        qStatus,
        qTaxonomy: qTaxonomy.join(" ")
      },
      cancelToken => (this.cancelGetSkus = cancelToken)
    );
  };

  getSkusCount = () => {
    const { qName, qStatus, qTaxonomy } = this.state;
    return SkuService.getSkusCount(
      {
        qApp: APP_NAME,
        qName,
        qStatus,
        qTaxonomy: qTaxonomy.join(" ")
      },
      cancelToken => (this.cancelGetSkusCount = cancelToken)
    );
  };

  onShowSizeChange = (_, pageSize) => {
    this.setState({ pageSize }, this.searchSku);
  };

  onTableChange = (page, _) => {
    this.setState({ page }, this.searchSku);
  };

  searchSku = async () => this.fetchResources();

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
    this.searchSku();
  };

  handleChangeSearch = (key, val, cb = () => {}) =>
    this.setState({ [key]: val }, cb);

  searchDropDown = (state, placeholder) => (
    <div className="custom-filter-dropdown">
      <Search
        value={this.state[state]}
        onChange={e => this.handleChangeSearch(state, e.target.value)}
        onSearch={this.searchSku}
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

  searchCategory = () => (
    <div className="custom-select-dropdown">
      <CheckboxGroup
        style={{ display: "grid", gridTemplateRows: "30px 30px 30px 30px" }}
        options={CATEGORIES}
        onChange={checked => this.setState({ qTaxonomy: checked })}
      />
      <div className="cat-filter">
        <a onClick={this.fetchResources}>Ok</a>
        <a
          onClick={() => this.setState({ qTaxonomy: [] }, this.fetchResources)}
        >
          Reset
        </a>
      </div>
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
    const { loading, pageSize, page, showAdd, selectedSku } = this.state;
    const { skus } = this.props;
    return (
      <Row className="agents-con" type="flex" justify="center">
        <Col className="agents-col" xl={23} lg={23} md={23} sm={23} xs={23}>
          <Table
            expandedRowRender={record => <SkuDetails sku={record} />}
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
              skus
                ? skus.map(a => {
                    a.key = a._id;
                    return a;
                  })
                : null
            }
          >
            <Column
              filterDropdown={() => this.searchDropDown("qName", "name")}
              title="Product-code"
              dataIndex="product_code"
              key="product_code"
            />
            <Column
              filterDropdown={() => this.searchDropDown("qName", "name")}
              title="Name"
              dataIndex="name"
              key="name"
              render={text => this.handleSearchHighlight("qName", text)}
            />
            <Column
              filterDropdown={() => this.searchCategory()}
              title="Category"
              dataIndex="taxonomy"
              key="taxonomy"
              render={text => text.map(t => <Tag key={t}>{t}</Tag>)}
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
                      this.setSelectedSku(agent);
                    }}
                  >
                    Edit
                  </a>
                </span>
              )}
            />
          </Table>
        </Col>

        <AddSku
          fetchResources={this.fetchResources}
          visible={showAdd}
          toggleShowAdd={this.toggleShowAdd}
        />

        {selectedSku && (
          <EditSku
            fetchResources={this.fetchResources}
            setSelectedSku={this.setSelectedSku}
            selectedSku={selectedSku}
          />
        )}
      </Row>
    );
  }
}

export default ComponentConnect(
  ["skus", "totalSkuCount", "setSkuState"],
  SkuConsumer
)(Skus);
