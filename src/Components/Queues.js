import React from "react";

import { List, Avatar, Spin, Badge } from "antd";
import { QueuesConsumer } from "../context/QueuesProvider";
import format from "date-fns/format";

const Queues = ({ scrollListener, loading, fetchMore }) => {
  return (
    <div onScroll={scrollListener} className="qs-con">
      <QueuesConsumer>
        {({ queues, selectedQueue, setSelectedQueue }) => (
          <List
            loading={loading}
            className="qs"
            bordered
            dataSource={queues || []}
            renderItem={({ _id, client, last_activity, timestamp }) => (
              <List.Item
                className={selectedQueue === _id ? "selected-q" : ""}
                onClick={() => setSelectedQueue(_id)}
                style={{ cursor: "pointer" }}
                key={_id}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={1}>
                      <Avatar icon="user" />
                    </Badge>
                  }
                  title={client}
                  description={
                    last_activity
                      ? last_activity.message.text
                      : "Start conversation.."
                  }
                />
                <div className="msg-timestamp">
                  {last_activity
                    ? format(last_activity.timestamp, "MM/DD/YY hh:mma")
                    : format(timestamp, "MM/DD/YY hh:mma")}
                </div>
              </List.Item>
            )}
          >
            {fetchMore ? (
              <div className="loading-container">
                <Spin tip="Fetching more queues..." />
              </div>
            ) : null}
          </List>
        )}
      </QueuesConsumer>
    </div>
  );
};

export default Queues;
