import React, { Fragment } from "react";
import format from "date-fns/format";

// import { Button, Icon } from "antd";

export default ({ queue }) => {
  const { client, timestamp } = queue || {};

  return (
    <div className="chat-header">
      {queue ? (
        <Fragment>
          <div className="chat-title">
            <h2>{client}</h2>
            <p> {format(timestamp,"MMMM DD, YYYY HH:mm A")}</p>
          </div>
          {/* <Button.Group size="default">
            <Button ghost>
              Mute
              <Icon type="disconnect" />
            </Button>
            <Button ghost>
              Archive
              <Icon type="delete" />
            </Button>
          </Button.Group> */}
        </Fragment>
      ) : null}
    </div>
  );
};
