import React from "react";

import { Input } from "antd";

const { Search } = Input;

export default React.memo(
  ({ handleSearch, handleInputChange, fetchMore, loading }) => (
    <div className="searchq">
      <Search
        disabled={fetchMore || loading}
        className="search-input"
        size="large"
        placeholder="Search queues"
        onChange={handleInputChange}
        onSearch={handleSearch}
        style={{ width: "100%" }}
        enterButton
      />
    </div>
  )
);
