import React, { lazy, Suspense } from "react";
import { Layout, Menu, Icon, message, Button, notification } from "antd";

import Conversations from "./Conversations";
import { Route, withRouter } from "react-router-dom";
import SocketService from "../services/SocketService";
import { JOIN, NEW_QUEUE, CLIENT_MESSAGE, END_QUEUE } from "../globals";
import { QueuesConsumer } from "../context/QueuesProvider";
import { ComponentConnect } from "../context/contextHelper";
import { AuthConsumer } from "../context/AuthProvider";
import sound from "../assets/new_message.mp3";
import Loading from "./Loading";

const Agents = lazy(() => import("./Agents"));

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

const audio = new Audio(sound);

class Admin extends React.Component {
  state = {
    collapsed: false
  };

  componentDidMount() {
    //check if accessing archive first
    if (this.props.location.pathname === "/a/archive") {
      this.props.setInbox(false); //setibox to archive mode
    }
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

  listenForClientMessage = () => {
    SocketService.listenToEvent(CLIENT_MESSAGE, payload => {
      this.playAudio();
      this.updateQueueLatestActivity(payload.message);
    });
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
        setSelectedQueue,
        inbox,
        setInbox
      } = this.props;
      this.playAudio();
      if (inbox) {
        setTotalCount(totalCount + 1);
        queue.unread = 0; //assign an initial unread value
        queues.push(queue);
        setQueues(queues);
      }
      //open notif
      const { client, _id } = queue;
      this.openNotification(
        "New ticket",
        `New ticket from ${client} has been assigned to you`,
        () => {
          if (!inbox) {
            setQueues(null);
            setTotalCount(null);
            setInbox(true);
            setSelectedQueue(_id);
            this.props.history.push("/a");
          } else {
            setSelectedQueue(_id);
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
        selectedQueue,
        inbox
      } = this.props;
      this.playAudio();
      if (!inbox) {
        //viewing archive
        setTotalCount(totalCount + 1);
        setQueues([queue, ...queues]);
      } else {
        //viewing inbox
        console.log("end chat viewing inbox");
        console.log(selectedQueue, queue._id);
        const qIndex = queues.findIndex(q => q._id === queue._id);
        if (qIndex > -1) {
          setTotalCount(totalCount - 1);
          queues.splice(qIndex, 1);
          setQueues([...queues]);
          if (selectedQueue === queue._id) {
            setSelectedQueue(null);
          }
        }
      }
      //open notif
      const { client } = queue;
      this.openNotification(
        "Livechat End",
        `${client} has ended the live chat. This ticket can be found in the archive`,
        () => {},
        false
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

  resetCache = inbox => {
    const { setQueues, setTotalCount, setSelectedQueue, setInbox } = this.props;
    setQueues([]);
    setTotalCount(null);
    setSelectedQueue(null);
    setInbox(inbox);
  };

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
            defaultOpenKeys={["conversation"]}
            mode="inline"
          >
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
            <Route
              exact
              path={this.navItemUrl("")}
              render={() => <Conversations status={1} />}
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
      "setInbox",
      "selectedQueue",
      "inbox"
    ],
    QueuesConsumer
  )(withRouter(Admin))
);
