import React from "react";
import { Row, Col, Button, Icon } from "antd";

const AgentsHeader = ({
  clearFilterState,
  fetchResources,
  loading,
  toggleShowAdd
}) => {
  return (
    <Row type="flex" justify="space-between">
      <Col>
        <Button disabled={loading} onClick={() => clearFilterState("", true)}>
          Clear Filters
        </Button>
      </Col>
      <Col>
        <Button
          onClick={toggleShowAdd}
          style={{ marginRight: 10 }}
          type="primary"
        >
          Add
          <Icon type="plus" />
        </Button>
        <Button
          disabled={loading}
          onClick={fetchResources}
          ghost
          type="primary"
        >
          Refresh
          <Icon type="reload" />
        </Button>
      </Col>
    </Row>
  );
};
export default AgentsHeader;
