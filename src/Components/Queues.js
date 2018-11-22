import React from "react";
import { List, Spin } from "antd";
import { QueuesConsumer } from "../context/QueuesProvider";
import Queue from "./Queue";
import { sortQueues } from "../helpers";

const Queues = ({ scrollListener, loading, fetchMore, status }) => {
  const queueList = queues => (
    <List
      split
      loading={loading}
      className="qs"
      bordered
      dataSource={sortQueues([...queues])}
      renderItem={item => <Queue status={status} item={item} />}
    >
      {fetchMore ? (
        <div className="loading-container">
          <Spin tip="Fetching more queues..." />
        </div>
      ) : null}
    </List>
  );

  return (
    <div onScroll={scrollListener} className="qs-con">
      <QueuesConsumer>
        {({ queues }) => {
          const qs = [...queues];
          return queueList(qs);
        }}
      </QueuesConsumer>
    </div>
  );
};

export default Queues;
