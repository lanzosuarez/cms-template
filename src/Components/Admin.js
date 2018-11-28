import React, { lazy, Suspense } from "react";
import {
  Layout,
  Menu,
  Icon,
  message,
  Button,
  notification,
  Badge,
  Tooltip
} from "antd";

import Conversations from "./Conversations";
import { Route, withRouter } from "react-router-dom";
import SocketService from "../services/SocketService";
import { JOIN, NEW_QUEUE, CLIENT_MESSAGE, END_QUEUE } from "../globals";
import { QueuesConsumer } from "../context/QueuesProvider";
import { ComponentConnect } from "../context/contextHelper";
import { AuthConsumer } from "../context/AuthProvider";
import sound from "../assets/new_message.mp3";
import Loading from "./Loading";
import AppHeader from "./AppHeader";

const Agents = lazy(() => import("./Agents"));
const Skus = lazy(() => import("./Skus"));
const Products = lazy(() => import("./Products"));

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

const audio = new Audio(sound);

class Admin extends React.Component {
  state = {
    collapsed: false,
    newQueues: 0
  };

  cancelGetInboxCount = () => {};
  cancelGetArchiveCount = () => {};

  componentWillUnmount() {
    this.cancelGetArchiveCount();
    this.cancelGetInboxCount();
  }

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
    this.listenForEndQueue();
  }

  checkInbox = () => {
    if (this.props.location.pathname === "/a") {
      return true;
    }
    return false;
  };

  playAudio = () => {
    audio.currentTime = 0;
    audio.play();
  };

  openNotification = (title, description, cb = () => {}, withAction = true) => {
    const key = `open${Date.now()}`;
    const btn = withAction ? (
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
    ) : null;
    notification.info({
      message: title,
      description,
      btn,
      key,
      duration: 4
    });
  };

  handleClientMessage = payload => {
    const {
      message: { queue }, //incoming message q
      queue: { client }
    } = payload;
    const {
      setSelectedQueue,
      selectedQueue,
      setReadQueue,
      setTotalCount
    } = this.props;
    this.playAudio();
    if (!selectedQueue) {
      this.updateUnread(queue);
      this.openNotification("New message", `New message from ${client}`, () => {
        console.log("here", queue);
        setSelectedQueue(queue);
        setReadQueue(queue);
        if (!this.checkInbox()) {
          setTotalCount(null);
        }
        this.props.history.push("/a");
      });
    } else {
      if (selectedQueue === queue) {
        this.openNotificationWithNoButton(
          "New message",
          `New message from ${client}`
        );
      } else if (selectedQueue !== queue) {
        this.updateUnread(queue);
        this.openNotification(
          "New message",
          `New message from ${client}`,
          () => {
            setSelectedQueue(queue);
            setReadQueue(queue);
          }
        );
      }
    }
    this.updateQueueLatestActivity(payload.message);
  };

  listenForClientMessage() {
    SocketService.listenToEvent(CLIENT_MESSAGE, this.handleClientMessage);
  }

  updateUnread = qId => {
    const { queues, setQueues } = this.props;
    const qIndex = queues.findIndex(q => q._id === qId);
    if (qIndex > -1) {
      const q = queues[qIndex];
      q.unread = q.unread + 1;
      queues.splice(qIndex, 1, q);
      setQueues(queues);
    }
  };

  updateQueueLatestActivity = last_activity => {
    const { queue } = last_activity;
    let { queues, setQueues } = this.props;
    const qIndex = queues.findIndex(q => q._id === queue);
    if (qIndex > -1) {
      let q = queues[qIndex];
      q.last_activity = last_activity;
      queues.splice(qIndex, 1, q);
      setQueues([...queues]);
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
      if (this.checkInbox()) {
        //viewing inbox
        setTotalCount(totalCount + 1);
        queue.unread = 0; //assign an initial unread value
        queues.push(queue);
        setQueues(queues);
      } else {
        if (!this.checkInbox()) {
          this.setState(({ newQueues }) => ({ newQueues: newQueues + 1 }));
        }
      }
      //open notif
      const { client, _id } = queue;
      this.openNotification(
        "New ticket",
        `New ticket from ${client} has been assigned to you`,
        () => {
          if (!this.checkInbox()) {
            setQueues([]);
            setTotalCount(null);
            setSelectedQueue(_id);
            this.props.history.push("/a");
          } else {
            if (this.checkInbox()) {
              setSelectedQueue(_id);
            }
          }
        }
      );
    });
  };

  listenForEndQueue = () => {
    SocketService.listenToEvent(END_QUEUE, ({ queue }) => {
      const {
        setTotalCount,
        setQueues,
        totalCount,
        queues,
        setSelectedQueue,
        selectedQueue
      } = this.props;
      this.playAudio();
      if (!this.checkInbox()) {
        //viewing archive
        setTotalCount(totalCount + 1);
        setQueues([queue, ...queues]);
      } else {
        //viewing inbox
        const qIndex = queues.findIndex(q => q._id === queue._id);
        if (qIndex > -1) {
          setTotalCount(totalCount - 1);
          queues.splice(qIndex, 1);
          setQueues([...queues]);
          if (selectedQueue === queue._id) {
            setSelectedQueue(selectedQueue);
          }
        }
      }
      //open notif depengs on what youre viewing
      const { client } = queue;
      if (this.checkInbox()) {
        this.openNotification(
          "Livechat End",
          `${client} has ended the live chat. This ticket can be found in the archive`,
          () => {},
          false
        );
      } else {
        this.openNotification(
          "Livechat End",
          `${client} has ended the live chat. This ticket has been added in the archive`,
          () => {},
          false
        );
      }
    });
  };

  openNotificationWithNoButton = (title, description) => {
    const key = `open${Date.now()}`;
    const btn = null;
    notification.info({
      message: title,
      description,
      btn,
      key,
      duration: 10
    });
  };

  joinSocket = () => SocketService.emitEvent(JOIN, this.props.user._id);

  onSelect = ({ key }) => this.props.history.push(key);

  clearNew;

  navItemUrl = key => {
    const {
      match: { url }
    } = this.props;
    return `${url}${key}`;
  };

  resetCache = () => {
    const { setQueues, setTotalCount, setSelectedQueue } = this.props;
    setQueues([]);
    setTotalCount(null);
    setSelectedQueue(null);
  };

  clearNew = () => this.setState({ newQueues: 0 });

  render() {
    const {
      location: { pathname }
    } = this.props;

    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider theme="light" collapsed={this.state.collapsed}>
          <div className="logo" />
          <Menu
            theme="light"
            onSelect={this.onSelect}
            selectedKeys={[pathname]}
            defaultSelectedKeys={[pathname]}
            defaultOpenKeys={["conversation", "sku"]}
            mode="inline"
          >
            <Menu.Item key={this.navItemUrl("/analytics")}>
              <Icon type="dashboard" />
              <span>Analytics</span>
            </Menu.Item>
            <SubMenu
              title={
                <span>
                  <Icon type="message" />
                  Conversations
                </span>
              }
              key={"conversation"}
            >
              <Menu.Item
                onClick={() => {
                  this.resetCache(true);
                }}
                key={this.navItemUrl("")}
              >
                <Icon type="inbox" />
                <span>Inbox</span>

                <Tooltip title="New tickets">
                  <Badge
                    count={this.state.newQueues}
                    style={{ backgroundColor: "var(--new)", marginLeft: 5 }}
                  />
                </Tooltip>
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  this.resetCache(false);
                }}
                key={this.navItemUrl("/archive")}
              >
                <Icon type="folder" />
                <span>Archive</span>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              title={
                <span>
                  <Icon type="shop" />
                  SKU Management
                </span>
              }
              key={"sku"}
            >
              <Menu.Item key={this.navItemUrl("/sku")}>
                <Icon type="tag" />
                <span>SKU's</span>
              </Menu.Item>
              <Menu.Item key={this.navItemUrl("/product")}>
                <Icon type="tag" />
                <span>Products</span>
              </Menu.Item>
              <Menu.Item key={this.navItemUrl("/product-group")}>
                <Icon type="tag" />
                <span>Product Group</span>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key={this.navItemUrl("/agents")}>
              <Icon type="team" />
              <span>Agent Management</span>
            </Menu.Item>
            <Menu.Item key={this.navItemUrl("/blast")}>
              <Icon type="notification" />
              <span>Blast</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <AppHeader />
          <Content
            style={{
              minWidth: 1000,
              height: "100%",
              background: "white",
              overflow: "auto"
            }}
          >
            <Route
              exact
              path={this.navItemUrl("")}
              render={() => (
                <Conversations clearNew={this.clearNew} status={1} />
              )}
            />
            <Route
              exact
              path={this.navItemUrl("/archive")}
              render={() => <Conversations status={0} />}
            />
            <Route
              path={this.navItemUrl("/agents")}
              render={() => (
                <Suspense fallback={<Loading />}>
                  <Agents />
                </Suspense>
              )}
            />
            <Route
              path={this.navItemUrl("/sku")}
              render={() => (
                <Suspense fallback={<Loading />}>
                  <Skus />
                </Suspense>
              )}
            />
            <Route
              path={this.navItemUrl("/product")}
              render={() => (
                <Suspense fallback={<Loading />}>
                  <Products />
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
    [
      "queues",
      "totalCount",
      "setQueues",
      "setTotalCount",
      "setSelectedQueue",
      "selectedQueue",
      "setReadQueue"
    ],
    QueuesConsumer
  )(withRouter(Admin))
);
