import React, { Component } from "react";
import { Avatar, Icon } from "antd";
import MessageService from "../services/MessageService";
import { formatIsTodayMessage } from "../helpers";
import { QueuesContext } from "../context/QueuesProvider";
import UploadService from "../services/UploadService";
import { CLOUDINARY_UPLOAD_PRESET } from "../globals";

class AgentMessage extends Component {
  static contextType = QueuesContext;
  state = { loading: false, error: false };

  cancelSendMsg = () => {};

  componentWillUnmount() {
    this.cancelSendMsg();
  }

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));
  toggleError = () => this.setState(({ error }) => ({ error: !error }));

  async componentDidMount() {
    const {
      message: { message: msg, newMsg }
    } = this.props;
    if (newMsg) {
      if ((msg.text && msg.attachments) || msg.attachments) {
        this.toggleLoading();
        const attachments = await this.uploadFiles(msg.attachments);
        this.toggleLoading();
        const message = { ...this.props.message };
        msg.attachments = attachments;
        this.createMessage(message);
      } else {
        this.createMessage();
      }
    }
  }

  //handle drag and drop
  uploadFiles = async files => {
    const fs = await Promise.all(
      files.map(async f => {
        const res = await UploadService.uploadImage(this.formData(f));
        return res.data.secure_url;
      })
    );
    return fs;
  };

  formData = file => {
    var formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    return formData;
  };

  updateQueueLatestActivity = last_activity => {
    let { selectedQueue, queues, setQueues } = this.context;
    const qIndex = queues.findIndex(q => q._id === selectedQueue);
    if (qIndex > -1) {
      let q = queues[qIndex];
      q.last_activity = last_activity;
      queues.splice(qIndex, 1);
      queues = [...queues, q];
      setQueues(queues);
    }
  };

  createMessage = async (message = this.props.message) => {
    try {
      this.toggleLoading();
      const { _id, newMsg, ...msg } = message;
      const res = await MessageService.sendMessage(
        msg,
        token => (this.cancelSendMsg = token)
      );
      this.toggleLoading();
      const m = res.data.data;
      m.fromCms = true;
      this.props.replaceMessage(message._id, m);
      this.updateQueueLatestActivity(m);
    } catch (error) {
      console.error(error);
      this.toggleError();
    }
  };

  statusIcon = () => {
    const { loading, error } = this.state;
    const {
      message: { fromCms, newMsg }
    } = this.props;
    if (fromCms || newMsg) {
      if (loading) {
        return (
          <Icon
            className="msg-icon"
            type="loading"
            style={{ color: "#1890ff" }}
          />
        );
      } else {
        if (error) {
          return (
            <Icon
              className="msg-icon"
              type="warning"
              theme="twoTone"
              twoToneColor="#eb2f96"
            />
          );
        } else {
          return (
            <Icon
              className="msg-icon"
              type="check-circle"
              theme="twoTone"
              twoToneColor="#52c41a"
            />
          );
        }
      }
    }
  };

  displayMessage = () => {
    const {
      message: {
        message: { text, attachments }
      }
    } = this.props;
    const { loading } = this.state;
    if (text && attachments && attachments.length > 0) {
      return (
        <div>
          <p className="chat-msg">{text}</p>
          <div className="agent-attachment">
            {attachments.map(a => (
              <img
                style={{ filter: loading ? "blur(5px)" : "" }}
                width="100%"
                height={100}
                key={a}
                src={a}
                alt="attachment"
              />
            ))}
          </div>
        </div>
      );
    } else if (text) {
      return <p className="chat-msg">{text}</p>;
    } else if (attachments && attachments.length > 0) {
      return (
        <div className="agent-attachment">
          <div className="load-msg" />
          {attachments.map(a => (
            <img
              style={{ filter: loading ? "blur(5px)" : "" }}
              width="100%"
              height={100}
              key={a}
              src={a}
              alt="attachment"
            />
          ))}
        </div>
      );
    }
  };

  render() {
    const {
      message: { timestamp }
    } = this.props;
    return (
      <div className="agent-message-con message">
        <Avatar size="large" style={{ marginLeft: 15 }}>
          U
        </Avatar>
        <div className="msg-con">
          {this.displayMessage()}
          <div style={{ display: "flex", alignItems: "center" }}>
            {this.statusIcon()}
            <span>{formatIsTodayMessage(timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default AgentMessage;
