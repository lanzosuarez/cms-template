import React, { Component } from "react";
import { Avatar } from "antd";
import { formatIsTodayMessage } from "../helpers";

class ClientMessage extends Component {
  render() {
    const {
      message: {
        message: { text },
        timestamp
      }
    } = this.props;
    return (
      <div className="client-message-con message">
        <Avatar size="large" style={{ marginRight: 15 }}>
          U
        </Avatar>
        <div style={{ textAlign: "right" }} className="msg-con">
          <p>{text}</p>
          <div>
            <span>{formatIsTodayMessage(timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default ClientMessage;
