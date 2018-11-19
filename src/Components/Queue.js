import React, { Component } from "react";

import { List, Avatar, Badge, notification, Button, Icon } from "antd";
import { formatIsToday } from "../helpers";
import MessageService from "../services/MessageService";
import SocketService from "../services/SocketService";
import { CLIENT_MESSAGE } from "../globals";
import QueueService from "../services/QueueService";
import { ComponentConnect } from "../context/contextHelper";
import { QueuesConsumer } from "../context/QueuesProvider";

class Queue extends Component {
  state = { unread: 0, client: "" };

  cancelGetUnreads = () => {};
  cancelGetQueue = () => {};

  componentWillMount() {
    this.listenFormClientMessage();
  }

  componentWillUnmount() {
    this.cancelGetUnreads();
    this.cancelGetQueue();
  }

  componentDidMount() {
    this.getUnreads();
    this.getQueue();
  }

  componentDidUpdate() {
    if (this.props.readQueue === this.props.item._id) {
      this.clearUnread();
    }
  }

  clearUnread = () => {
    this.setState({ unread: 0 });
    this.props.setReadQueue(null);
  };

  getQueue = async () => {
    try {
      const res = await QueueService.getQueue(
        this.props.item._id,
        token => (this.cancelGetQueue = token),
        "client"
      );
      this.setState({ client: res.data.data.client, queue: res.data.data._id });
    } catch (error) {
      console.error(error);
    }
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

  listenFormClientMessage() {
    SocketService.listenToEvent(CLIENT_MESSAGE, payload => {
      const {
        message: { queue } //incoming message q
      } = payload;
      const {
        setSelectedQueue,
        selectedQueue //open q
      } = this.props;
      const { client, queue: queueId } = this.state; //state q
      if (!selectedQueue) {
        if (queue === queueId) {
          this.setState(({ unread }) => ({ unread: unread + 1 }));
          this.openNotification(
            "New message",
            `New message from ${client}`,
            () => setSelectedQueue(queueId)
          );
        }
      } else {
        console.log("--------", this.state.client);
        console.log(selectedQueue);
        console.log(queueId);
        console.log(queue);
        if (selectedQueue === queueId && queueId === queue) {
          this.openNotificationWithNoButton(
            "New message",
            `New message from ${client}`
          );
        } else if (selectedQueue !== queueId && queueId === queue) {
          this.setState(({ unread }) => ({ unread: unread + 1 }));
          this.openNotification(
            "New message",
            `New message from ${client}`,
            () => setSelectedQueue(queueId)
          );
        }
      }
    });
  }

  getUnreads = async () => {
    try {
      const { _id } = this.props.item;
      const res = await MessageService.getUnread(
        { queue: _id },
        token => (this.cancelGetUnreads = token)
      );
      this.setState({ unread: res.data.data });
    } catch (error) {
      console.error(error);
    }
  };

  activityText = (client, { type, message: { text, attachnemt } }) => {
    const attachIcon = "paper-clip";
    const msgIcon = "message";
    const atIcon = (msg, type) => (
      <span>
        <Icon type={type} style={{ marginRight: 3 }} />
        {msg}
      </span>
    );

    if ((text && attachnemt) || text) {
      return type === 0
        ? atIcon(`${client.split(" ")[0]}: ${text}`, msgIcon)
        : atIcon(`You: ${text}`, msgIcon);
    } else {
      return type === 0
        ? atIcon(`${client} sent an attachment`, attachIcon)
        : atIcon("You sent an attachment", attachIcon);
    }
  };

  render() {
    const {
      item: { _id, client, last_activity, timestamp },
      setSelectedQueue,
      selectedQueue
    } = this.props;
    const { unread } = this.state;

    return (
      <List.Item
        className={selectedQueue === _id ? "selected-q" : ""}
        onClick={() => setSelectedQueue(_id)}
        style={{ cursor: "pointer" }}
        key={_id}
      >
        <List.Item.Meta
          avatar={
            <Badge count={unread}>
              <Avatar>{client[0]}</Avatar>
            </Badge>
          }
          title={client}
          description={
            last_activity
              ? this.activityText(client, last_activity)
              : "Start conversation"
          }
        />
        <div className="msg-timestamp">
          {last_activity
            ? formatIsToday(last_activity.timestamp)
            : formatIsToday(timestamp)}
        </div>
      </List.Item>
    );
  }
}

export default ComponentConnect(
  [
    "setReadQueue",
    "readQueue",
    "queues",
    "setQueues",
    "selectedQueue",
    "setSelectedQueue"
  ],
  QueuesConsumer
)(Queue);
