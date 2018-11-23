import React, { Fragment } from "react";
import { List, Spin, Tag } from "antd";
import { QueuesConsumer } from "../context/QueuesProvider";
import Queue from "./Queue";
import { sortQueues } from "../helpers";

const Queues = ({ scrollListener, loading, fetchMore, status }) => {
  const queueList = queues => (
    <List
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
    <QueuesConsumer>
      {({ queues, totalCount }) => {
        const qs = [...queues];
        return (
          <Fragment>
            <div style={{ paddingLeft: 20, paddingBottom: 10 }}>
              {!loading && !fetchMore && (
                <Fragment>
                  <Tag color="#2db7f5">Total Tickets: {totalCount}</Tag>
                </Fragment>
              )}
            </div>
            <div onScroll={scrollListener} className="qs-con">
              {queueList(qs)}
            </div>
          </Fragment>
        );
      }}
    </QueuesConsumer>
  );
};

export default Queues;
