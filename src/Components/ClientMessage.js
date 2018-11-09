import React from "react";
import { Avatar } from "antd";

const ClientMessage = ({ message }) => {
  return (
    <div className="client-message-con message">
      <Avatar size="large" style={{ marginRight: 15 }}>
        U
      </Avatar>
      <div style={{ textAlign: "right" }} className="msg-con">
        <p>{message}</p>
        <div>12:02 pm</div>
      </div>
    </div>
  );
};

export default ClientMessage;
