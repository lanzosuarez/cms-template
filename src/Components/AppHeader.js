import React from "react";
import { Layout, Col, Row, Icon, Dropdown, Menu } from "antd";

const { Header } = Layout;

const AppHeader = () => {
  const logout = () => {
    window.location.pathname = "/";
    localStorage.clear();
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={logout}>Log Out</Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ padding: 0 }}>
      <Row className="h100">
        <Col className="h100" span={4} push={20}>
          <div className="header-actions h100">
            <Dropdown overlay={menu}>
              <Icon className="header-item" type="caret-down" />
            </Dropdown>
          </div>
        </Col>
      </Row>
    </Header>
  );
};
export default AppHeader;
