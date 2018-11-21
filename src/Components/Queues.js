import React from "react";
import { List, Spin } from "antd";
import { QueuesConsumer } from "../context/QueuesProvider";
import Queue from "./Queue";
import { ComponentConnect } from "../context/contextHelper";

const Queues = ({ scrollListener, loading, fetchMore, queues, status }) => {
  const sortQueues = queues => {
    return queues.sort((curr, next) => {
      const { last_activity: lt1, timestamp: t1 } = curr;
      const { last_activity: lt2, timestamp: t2 } = next;
      let l1, l2;
      l1 = lt1 ? new Date(lt1.timestamp).valueOf() : new Date(t1).valueOf();
      l2 = lt2 ? new Date(lt2.timestamp).valueOf() : new Date(t2).valueOf();
      return l2 - l1;
    });
  };

  return (
    <div onScroll={scrollListener} className="qs-con">
      <List
        loading={loading}
        className="qs"
        bordered
        dataSource={queues ? sortQueues(queues) : []}
        renderItem={item => <Queue status={status} item={item} />}
      >
        {fetchMore ? (
          <div className="loading-container">
            <Spin tip="Fetching more queues..." />
          </div>
        ) : null}
      </List>
    </div>
  );
};

export default ComponentConnect(["queues"], QueuesConsumer)(Queues);
