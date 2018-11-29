import React from "react";
import { Card, Avatar, Tag, Row, Col, List } from "antd";
import format from "date-fns/format";
import { ACTIVE_USER, DEACTIVATED } from "../globals";

const { Meta } = Card;

const ProductDetails = props => {
  const { name, timestamp, status, skus } = props.product;
  console.log(skus);
  return (
    <Row type="flex" justify="space-between">
      <Col xl={8} lg={8} md={8} sm={8} xs={8}>
        <Card style={{ marginTop: 14 }}>
          <Meta
            avatar={<Avatar>{name[0]}</Avatar>}
            title={
              <div>
                <span style={{ marginRight: 10 }}>{name}</span>
                <Tag color={status ? ACTIVE_USER : DEACTIVATED}>
                  {status ? "ACTIVE" : "DEACTIVATED"}
                </Tag>
              </div>
            }
            description={
              <div>
                <span>Added: &nbsp; {format(timestamp, "MMM DD, YYYY")}</span>
              </div>
            }
          />
        </Card>
      </Col>
      <Col xl={14} lg={14} md={14} sm={14} xs={14}>
        <List
          className="product-skus"
          header={<h3>Skus</h3>}
          bordered
          dataSource={skus}
          renderItem={item => (
            <List.Item className="product-skus-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%"
                }}
              >
                <span>{item.name}</span>
                <div>
                  {item.taxonomy.map(t => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};

export default ProductDetails;
