import React, { memo } from "react";
import { Spin } from "antd";

const Loading = ({ tip = "" }) => (
  <div className="loading">
    <Spin tip={tip} size="large" />
  </div>
);

export default memo(Loading);
