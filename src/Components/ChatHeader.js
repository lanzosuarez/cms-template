import React, { Fragment } from "react";
import format from "date-fns/format";

import { Icon, Dropdown, Menu } from "antd";
import { ComponentConnect } from "../context/contextHelper";
import { QueuesConsumer } from "../context/QueuesProvider";

const ChatHeader = ({ queue, setSelectedQueue }) => {
  const { client, timestamp } = queue || {};
  const handleMenuClick = e => {
    console.log(e);
    switch (e.key) {
      case "1": {
        break;
      }
      case "2": {
        setSelectedQueue(null);
        break;
      }
      default: {
        break;
      }
    }
  };
  const menu = (
    <Menu onClick={handleMenuClick}>
      {/* <Menu.Item key="1">
        <Icon type="delete" />
        Stop Chat
      </Menu.Item> */}
      <Menu.Item key="2">
        <Icon type="close" />
        Close
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="chat-header">
      {queue ? (
        <Fragment>
          <div className="chat-title">
            <h2>{client}</h2>
            <p> {format(timestamp, "MMMM DD, YYYY HH:mm A")}</p>
          </div>
          <Dropdown overlay={menu}>
            <div style={{ cursor: "pointer" }}>Options</div>
          </Dropdown>
        </Fragment>
      ) : null}
    </div>
  );
};

export default ComponentConnect(["setSelectedQueue"], QueuesConsumer)(
  ChatHeader
);
