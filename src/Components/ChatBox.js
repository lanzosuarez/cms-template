import React, { Component } from "react";
import { QueuesContext } from "../context/QueuesProvider";
import { Spin } from "antd";
import getMilliseconds from "date-fns/get_milliseconds";
import * as randomstring from "randomstring";

import Loading from "./Loading";
import Message from "./Message";
import { CLIENT_MESSAGE } from "../globals";
import SocketService from "../services/SocketService";

class ChatBox extends Component {
  static contextType = QueuesContext;

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate({ messages }) {
    const { messages: msgs, more } = this.props;
    if (messages.length !== msgs.length && !more) {
      this.listenFormClientMessage();
      this.scrollToBottom();
    }
  }

  listenFormClientMessage() {
    SocketService.listenToEvent(CLIENT_MESSAGE, ({ message }) => {
      const { queue } = message;
      const { selectedQueue } = this.context;
      //if the incoming message queue is not equal to the selected qeueue
      //if incoming message queue is equal to this queue
      //then scroll to bottom
      if (selectedQueue === queue) {
        console.log("scroll");
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom = () => {
    if (this.bottomAnchor) {
      this.bottomAnchor.scrollIntoView({ behavior: "instant" });
    }
  };

  sortMessages = messages =>
    messages.sort(
      (msg1, msg2) =>
        getMilliseconds(new Date(msg2.timestamp)) -
        getMilliseconds(new Date(msg1.timestamp))
    );

  readFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };

  onDrop = async e => {
    e.preventDefault();
    let dt = e.dataTransfer;
    let files = [...dt.files];
    await Promise.all(
      files.map(async f => {
        f.uid = randomstring.generate(7);
        f.url = await this.readFile(f);
        return f;
      })
    );
    this.props.setFiles(files);
  };

  onDragover = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  replaceMessage = (id, message) => {
    const { messages, setMessagesState } = this.props;
    const msgIndex = messages.findIndex(msg => msg._id === id);
    if (msgIndex > -1) {
      messages.splice(msgIndex, 1, message);
      setMessagesState("messages", messages);
    }
  };

  render() {
    const { messages, messageLoading, fetchMore } = this.props;

    return (
      <div onDrop={this.onDrop} onDragOver={this.onDragover} className="cbox">
        {fetchMore ? (
          <div className="loading-container">
            <Spin tip="Fetching more messages..." />
          </div>
        ) : (
          <div />
        )}
        {messageLoading ? (
          <Loading tip="Fetching latest messages" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column-reverse" }}>
            {messages.map((msg, index) => (
              <Message
                replaceMessage={this.replaceMessage}
                key={index}
                message={msg}
              />
            ))}
          </div>
        )}
        <div className="bottomAnchor" ref={el => (this.bottomAnchor = el)} />
      </div>
    );
  }
}

export default ChatBox;
