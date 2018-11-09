import React from "react";
import { Layout, Menu, Icon, message } from "antd";
import Agents from "./Agents";
import Conversations from "./Conversations";
import { Route, withRouter } from "react-router-dom";
import SocketService from "../services/SocketService";
import { JOIN } from "../globals";
import { AuthContext } from "../context/AuthProvider";

const { Header, Content, Sider } = Layout;

class Admin extends React.Component {
  static contextType = AuthContext;
  state = {
    collapsed: true
  };

  componentDidMount() {
    SocketService.initSocket();
    const { socket } = SocketService;

    socket.on("connect", () => {
      message.success("Connected to the server");
      this.joinSocket();
    });
    socket.on("disconnect", () => {
      message.error("Disconnected to the server");
    });
    socket.on("error", () => {
      message.error("Disconnected to the server");
    });
    socket.on("reconnecting", attemptNumber => {
      message.loading(
        `Attempting to reconnect to server. Attempt ${attemptNumber}`,
        1
      );
    });
    socket.on("reconnect", () => {
      // message.success("Succesfully reconnected to server");
      // this.joinSocket();
    });
  }

  joinSocket = () => SocketService.emitEvent(JOIN, this.context.user._id);

  onSelect = ({ key }) => this.props.history.push(key);

  navItemUrl = key => {
    const {
      match: { url }
    } = this.props;
    return `${url}${key}`;
  };

  render() {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider theme="light" collapsed={this.state.collapsed}>
          <div className="logo" />
          <Menu
            theme="light"
            onSelect={this.onSelect}
            defaultSelectedKeys={[this.navItemUrl("")]}
            mode="inline"
          >
            <Menu.Item key={this.navItemUrl("")}>
              <Icon type="message" />
              <span>Conversations</span>
            </Menu.Item>
            <Menu.Item key={this.navItemUrl("/agents")}>
              <Icon type="user" />
              <span>Agents</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ padding: 0 }} />
          <Content
            style={{
              minWidth: 1000,
              height: "100%",
              background: "white",
              overflow: "auto"
            }}
          >
            <Route exact path={this.navItemUrl("")} component={Conversations} />
            <Route path={this.navItemUrl("agents")} component={Agents} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(Admin);
