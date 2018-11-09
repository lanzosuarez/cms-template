import React, { Fragment, forwardRef } from "react";
import AgentMessage from "./AgentMessage";
import ClientMessage from "./ClientMessage";

// import { Button, Icon } from "antd";

export default forwardRef(({ queue }, ref) => {
  return (
    <div ref={ref}>
      {queue ? (
        <Fragment>
          <ClientMessage
            message={
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled"
            }
          />
          <AgentMessage
            message={
              "it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of"
            }
          />
          <AgentMessage message={"dsadasdsadsa"} />
          <ClientMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <ClientMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <ClientMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <ClientMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <ClientMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
          <AgentMessage message={"dsadasdsadsa"} />
        </Fragment>
      ) : null}
    </div>
  );
});
