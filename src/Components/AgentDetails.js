import React from "react";
import { Card, Avatar, Tag } from "antd";
import format from "date-fns/format";
import { ACTIVE_USER, DEACTIVATED } from "../globals";

const { Meta } = Card;

const AgentDetails = props => {
  const { username, email, timestamp, status } = props.agent;
  return (
    <Card style={{ width: 300, marginTop: 16 }}>
      <Meta
        avatar={<Avatar>{username[0]}</Avatar>}
        title={
          <div>
            <span style={{ marginRight: 10 }}>{username}</span>
            <Tag color={status ? ACTIVE_USER : DEACTIVATED}>
              {status ? "ACTIVE" : "DEACTIVATED"}
            </Tag>
          </div>
        }
        description={
          <div>
            <span>{email}</span> <br />
            <span>{format(timestamp, "MMM DD, YYYY hh:mm a")}</span>
          </div>
        }
      />
    </Card>
  );
};

export default AgentDetails;
