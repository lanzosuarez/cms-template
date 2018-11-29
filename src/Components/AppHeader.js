import React from "react";
import { Layout, Col, Row, Icon, Dropdown, Menu } from "antd";
import UserService from "../services/UserService";
import { AuthConsumer } from "../context/AuthProvider";

const { Header } = Layout;

const AppHeader = () => {
  const logout = id => {
    UserService.logout(id);
    window.location.pathname = "/";
    localStorage.clear();
  };

  const menu = (
    <AuthConsumer>
      {user => (
        <Menu>
          <Menu.Item onClick={() => logout(user._id)}>Log Out</Menu.Item>
        </Menu>
      )}
    </AuthConsumer>
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
