import React from "react";
import { Card, Avatar, Tag } from "antd";
import format from "date-fns/format";
import { ACTIVE_USER, DEACTIVATED } from "../globals";
import { formatPrice } from "../helpers";

const { Meta } = Card;

const SkuDetails = props => {
  const { name, price, timestamp, status } = props.sku;
  return (
    <Card style={{ width: 300, marginTop: 16 }}>
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
            <span>&#8369; {formatPrice(price)}</span> <br />
            <span>
              Added: &nbsp; {format(timestamp, "MMM DD, YYYY")}
            </span>
          </div>
        }
      />
    </Card>
  );
};

export default SkuDetails;
