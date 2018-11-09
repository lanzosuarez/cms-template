import React, { Fragment } from "react";
import { Avatar } from "antd";

const AgentMessage = ({ message }) => {
  return (
    <Fragment>
      <div className="agent-message-con message">
        <Avatar size="large" style={{ marginLeft: 15 }}>
          U
        </Avatar>
        <div className="msg-con">
          <p className="chat-msg">{message}</p>
          <div>12:02 pm</div>
        </div>
      </div>
    </Fragment>
  );
};

export default AgentMessage;
