import React, { Component } from "react";
import { Row, Col, Table, Tag, message, Input, Button, Radio } from "antd";
import { AgentContext } from "../context/AgentProvider";
import AgentService from "../services/AgentService";
import { APP_NAME, ACTIVE_USER, DEACTIVATED } from "../globals";
import format from "date-fns/format";
import AgentsHeader from "./AgentsHeader";
import AddAgent from "./AddAgent";
import EditAgent from "./EditAgent";
import AgentDetails from "./AgentDetails";
import { ComponentConnect } from "../context/contextHelper";
import { QueuesConsumer } from "../context/QueuesProvider";

const { Column } = Table;
const { Search } = Input;

class Agents extends Component {
  static contextType = AgentContext;
  state = {
    pageSize: 20,
    loading: false,
    page: 1,
    qName: "",
    qUsername: "",
    qEmail: "",
    fields: "",
    qStatus: "1",
    showAdd: false,
    selectedAgent: null
  };

  cancelGetAgents = () => {};
  cancelGetAgentsCount = () => {};

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));
  toggleShowAdd = () => this.setState(({ showAdd }) => ({ showAdd: !showAdd }));

  componentWillUnmount() {
    this.cancelGetAgents();
    this.cancelGetAgentsCount();
  }

  componentDidMount() {
    this.props.setSelectedQueue(null); //set selected to queue to null
    const { totalAgentCount: tmc, agents: as } = this.context;
    //skip get if theres a cache version
    if (tmc && as) {
      return;
    }
    this.fetchResources();
  }

  fetchResources = async () => {
    try {
      this.toggleLoading();
      const res = await Promise.all([this.getAgents(), this.getAgentsCount()]);
      this.toggleLoading();

      console.log(res);

      const [a, acount] = res;
      const agents = a.data.data;
      const totalAgentCount = acount.data.data;

      //cache initital fetch
      this.context.setAgents(agents);
      this.context.setTotalAgentCount(totalAgentCount);
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

  setSelectdAgent = selectedAgent => this.setState({ selectedAgent });

  getAgents = () => {
    const { page, qName, qUsername, qEmail, qStatus } = this.state;
    console.log(this.state);
    return AgentService.getAgents(
      { qApp: APP_NAME, page, qName, qUsername, qEmail, qStatus },
      cancelToken => (this.cancelGetAgents = cancelToken)
    );
  };

  getAgentsCount = () => {
    const { qName, qUsername, qEmail, qStatus } = this.state;
    return AgentService.getAgentsCount(
      { qApp: APP_NAME, qName, qUsername, qEmail, qStatus },
      cancelToken => (this.cancelGetAgentsCount = cancelToken)
    );
  };

  onShowSizeChange = (_, pageSize) => {
    this.setState({ pageSize }, this.searchAgents);
  };

  onTableChange = (page, _) => {
    this.setState({ page }, this.searchAgents);
  };

  searchAgents = async () => {
    try {
      this.toggleLoading();
      const res = await this.getAgents();
      this.context.setAgents(res.data.data);
      this.toggleLoading();
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
    this.searchAgents();
  };

  handleChangeSearch = (key, val, cb = () => {}) =>
    this.setState({ [key]: val }, cb);

  searchDropDown = (state, placeholder) => (
    <div className="custom-filter-dropdown">
      <Search
        value={this.state[state]}
        onChange={e => this.handleChangeSearch(state, e.target.value)}
        onSearch={this.searchAgents}
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
    const { loading, pageSize, page, showAdd, selectedAgent } = this.state;
    const { agents } = this.context;
    return (
      <Row className="agents-con" type="flex" justify="center">
        <Col className="agents-col" xl={23} lg={23} md={23} sm={23} xs={23}>
          <Table
            expandedRowRender={record => <AgentDetails agent={record} />}
            title={() => (
              <AgentsHeader
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
              onShowSizeChange: this.onShowSizeChange
            }}
            loading={loading}
            bordered
            dataSource={
              agents
                ? agents.map(a => {
                    a.key = a._id;
                    return a;
                  })
                : null
            }
          >
            <Column
              filterDropdown={() => this.searchDropDown("qEmail", "email")}
              title="Email"
              dataIndex="email"
              key="email"
              render={text => this.handleSearchHighlight("qEmail", text)}
            />
            <Column
              filterDropdown={() =>
                this.searchDropDown("qUsername", "username")
              }
              title="Username"
              dataIndex="username"
              key="username"
              render={text => this.handleSearchHighlight("qUsername", text)}
            />
            <Column
              title="Created at"
              dataIndex="timestamp"
              key="timestamp"
              render={text => (
                <span>{format(text, "MMM D, YYYY hh:mm A")}</span>
              )}
            />
            <Column title="Queued" dataIndex="queued" key="queued" />
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
                      this.setSelectdAgent(agent);
                    }}
                  >
                    Edit
                  </a>
                </span>
              )}
            />
          </Table>
        </Col>
        <AddAgent
          fetchResources={this.fetchResources}
          visible={showAdd}
          toggleShowAdd={this.toggleShowAdd}
        />
        <EditAgent
          fetchResources={this.fetchResources}
          setSelectdAgent={this.setSelectdAgent}
          selectedAgent={selectedAgent}
        />
      </Row>
    );
  }
}

export default ComponentConnect(["setSelectedQueue"], QueuesConsumer)(Agents);
