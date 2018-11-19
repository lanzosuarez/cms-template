import React from "react";
import AgentMessage from "./AgentMessage";
import ClientMessage from "./ClientMessage";

const Message = props => {
  const { message, replaceMessage } = props;
  const newMsg = message._id ? false : true;

  return message.type !== 0 ? (
    <AgentMessage
      replaceMessage={replaceMessage}
      newMsg={newMsg}
      key={message._id}
      message={message}
    />
  ) : (
    <ClientMessage key={message._id} message={message} />
  );
};
export default Message;
