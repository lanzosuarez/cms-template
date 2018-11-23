import React, { Component } from "react";
import { List, Avatar, Badge, notification, Button, Icon } from "antd";
import { formatIsToday } from "../helpers";
import MessageService from "../services/MessageService";
import { QueuesConsumer } from "../context/QueuesProvider";
import { ComponentConnect } from "../context/contextHelper";

class Queue extends Component {
  cancelGetUnreads = () => {};
  cancelGetQueue = () => {};

  componentWillUnmount() {
    this.cancelGetUnreads();
    this.cancelGetQueue();
    // this.removeMessageListener();
    // console.log("unmiunt");
  }

  UNSAFE_componentWillMount() {
    // this.listenFormClientMessage();
  }

  componentDidMount() {
    this.getUnreads();
  }

  componentDidUpdate() {
    if (this.props.readQueue === this.props.item._id) {
      this.clearUnread();
    }
  }

  clearUnread = () => {
    console.log("clear unread", this.props.item);
    this.updateUnread(this.props.item._id, 0);
    this.props.setReadQueue(null);
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

  // handleClientMessage = payload => {
  //   const {
  //     message: { queue } //incoming message q
  //   } = payload;
  //   const {
  //     item: { client, _id: queueId, unread }
  //   } = this.props;
  //   const { setSelectedQueue, selectedQueue } = this.props;
  //   if (!selectedQueue) {
  //     if (queue === queueId) {
  //       console.log("new client q=qid");
  //       this.updateUnread(queueId, unread + 1);
  //       this.openNotification("New message", `New message from ${client}`, () =>
  //         setSelectedQueue(queueId)
  //       );
  //     }
  //   } else {
  //     if (selectedQueue === queueId && queueId === queue) {
  //       this.openNotificationWithNoButton(
  //         "New message",
  //         `New message from ${client}`
  //       );
  //     } else if (selectedQueue !== queueId && queueId === queue) {
  //       this.updateUnread(queueId, unread + 1);
  //       this.openNotification("New message", `New message from ${client}`, () =>
  //         setSelectedQueue(queueId)
  //       );
  //     }
  //   }
  // };

  // removeMessageListener() {
  //   SocketService.unListenToEvent(CLIENT_MESSAGE, this.handleClientMessage);
  // }

  // listenFormClientMessage() {
  //   SocketService.listenToEvent(CLIENT_MESSAGE, this.handleClientMessage);
  // }

  updateUnread = (qId, unread) => {
    const { queues, setQueues } = this.props;
    const qIndex = queues.findIndex(q => q._id === qId);
    if (qIndex > -1) {
      const q = queues[qIndex];
      q.unread = unread;
      queues.splice(qIndex, 1, q);
      setQueues(queues);
    }
  };

  getUnreads = async () => {
    try {
      const { _id } = this.props.item;
      const res = await MessageService.getUnread(
        { queue: _id },
        token => (this.cancelGetUnreads = token)
      );

      this.updateUnread(_id, res.data.data);
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

  updateNew = qId => {
    const { queues, setQueues } = this.props;
    const qIndex = queues.findIndex(q => q._id === qId);
    if (qIndex > -1) {
      const q = queues[qIndex];
      q.new = false;
      queues.splice(qIndex, 1, q);
      setQueues(queues);
    }
  };

  render() {
    const {
      item: { _id, client, last_activity, timestamp, status, unread}
    } = this.props;
    const { setSelectedQueue, selectedQueue, setReadQueue } = this.props;

    return (
      <List.Item
        className={
          selectedQueue === _id ? "selected-q queue-item" : "queue-item"
        }
        onClick={() => {
          setSelectedQueue(_id);
          setReadQueue(_id);
          // this.updateNew(_id);
        }}
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
              : status === 1
              ? "Start conversation"
              : "This chat has ended"
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
    "setQueues",
    "setSelectedQueue",
    "selectedQueue",
    "queues",
    "setReadQueue",
    "readQueue"
  ],
  QueuesConsumer
)(Queue);
