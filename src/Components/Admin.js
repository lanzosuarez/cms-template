import React, { lazy, Suspense } from "react";
import { Layout, Menu, Icon, message, Button, notification } from "antd";

import Conversations from "./Conversations";
import { Route, withRouter } from "react-router-dom";
import SocketService from "../services/SocketService";
import { JOIN, NEW_QUEUE, CLIENT_MESSAGE } from "../globals";
import { QueuesConsumer } from "../context/QueuesProvider";
import { ComponentConnect } from "../context/contextHelper";
import { AuthConsumer } from "../context/AuthProvider";
import sound from "../assets/new_message.mp3";
import Loading from "./Loading";

const Agents = lazy(() => import("./Agents"));

const { Header, Content, Sider } = Layout;

class Admin extends React.Component {
  state = {
    collapsed: true,
    audio: new Audio(sound)
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

    this.listenForNewQueues();
    this.listenForClientMessage();
  }

  playAudio = () => {
    // this.audio.currentTime = 0;
    this.state.audio.play();
  };

  openNotification = (title, description, cb = () => {}) => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        size="small"
        onClick={() => {
          notification.close(key);
          cb();
        }}
      >
        View
      </Button>
    );
    notification.info({
      message: title,
      description,
      btn,
      key,
      duration: 4
    });
  };

  listenForClientMessage = () => {
    SocketService.listenToEvent(CLIENT_MESSAGE, payload => {
      this.playAudio();
      this.updateQueueLatestActivity(payload.message);
    });
  };

  updateQueueLatestActivity = last_activity => {
    const { queue } = last_activity;
    console.log(queue);
    let { queues, setQueues } = this.props;
    const qIndex = queues.findIndex(q => q._id === queue);
    if (qIndex > -1) {
      let q = queues[qIndex];
      q.last_activity = last_activity;
      queues.splice(qIndex, 1, q);
      setQueues(queues);
    }
  };

  listenForNewQueues = () => {
    SocketService.listenToEvent(NEW_QUEUE, ({ queue }) => {
      const {
        setTotalCount,
        setQueues,
        totalCount,
        queues,
        setSelectedQueue
      } = this.props;
      this.playAudio();
      setTotalCount(totalCount + 1);
      setQueues([queue, ...queues]);

      //open notif
      const { client, _id } = queue;

      this.openNotification(
        "New ticket",
        `New ticket from ${client} has been assigned to you`,
        () => setSelectedQueue(_id)
      );
    });
  };

  joinSocket = () => SocketService.emitEvent(JOIN, this.props.user._id);

  onSelect = ({ key }) => this.props.history.push(key);

  navItemUrl = key => {
    const {
      match: { url }
    } = this.props;
    return `${url}${key}`;
  };

  render() {
    const {
      location: { pathname }
    } = this.props;
    console.log(pathname);
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider theme="light" collapsed={this.state.collapsed}>
          <div className="logo" />
          <Menu
            theme="light"
            onSelect={this.onSelect}
            defaultSelectedKeys={[pathname]}
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
            <Route
              path={this.navItemUrl("/agents")}
              render={() => (
                <Suspense fallback={<Loading />}>
                  <Agents />
                </Suspense>
              )}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default ComponentConnect(["user"], AuthConsumer)(
  ComponentConnect(
    ["queues", "totalCount", "setQueues", "setTotalCount", "setSelectedQueue"],
    QueuesConsumer
  )(withRouter(Admin))
);
