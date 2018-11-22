import React, { Component } from "react";

import { List, Avatar, Badge, notification, Button, Icon } from "antd";
import { formatIsToday } from "../helpers";
import MessageService from "../services/MessageService";
import SocketService from "../services/SocketService";
import { CLIENT_MESSAGE } from "../globals";
import { QueuesContext } from "../context/QueuesProvider";

class Queue extends Component {
  static contextType = QueuesContext;

  cancelGetUnreads = () => {};
  cancelGetQueue = () => {};

  componentWillUnmount() {
    this.cancelGetUnreads();
    this.cancelGetQueue();
  }

  UNSAFE_componentWillMount() {
    this.listenFormClientMessage();
  }

  componentDidMount() {
    console.log("get unread", this.props.item.client);
    this.getUnreads();
  }

  componentDidUpdate() {
    if (this.context.readQueue === this.props.item._id) {
      this.clearUnread();
    }
  }

  clearUnread = () => {
    this.updateUnread(this.props.item._id, 0);
    this.context.setReadQueue(null);
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
        item: { client, _id: queueId, unread }
      } = this.props;
      const { setSelectedQueue, selectedQueue } = this.context;

      if (!selectedQueue) {
        console.log("new message no selected queue");
        console.log(client);
        console.log(queue, queueId);
        console.log("------");
        if (queue === queueId) {
          this.updateUnread(queueId, unread + 1);
          this.openNotification(
            "New message",
            `New message from ${client}`,
            () => setSelectedQueue(queueId)
          );
        }
      } else {
        if (selectedQueue === queueId && queueId === queue) {
          this.openNotificationWithNoButton(
            "New message",
            `New message from ${client}`
          );
        } else if (selectedQueue !== queueId && queueId === queue) {
          this.updateUnread(queueId, unread + 1);
          this.openNotification(
            "New message",
            `New message from ${client}`,
            () => setSelectedQueue(queueId)
          );
        }
      }
    });
  }

  updateUnread = (qId, unread) => {
    const { queues, setQueues } = this.context;
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

  render() {
    const {
      item: { _id, client, last_activity, timestamp, status, unread }
    } = this.props;
    const { setSelectedQueue, selectedQueue } = this.context;

    return (
      <List.Item
        className={
          selectedQueue === _id ? "selected-q queue-item" : "queue-item"
        }
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

export default Queue;
