import React, { Component, Fragment, createRef } from "react";
import { Row, Col, message, Input, Icon } from "antd";
import { QueuesConsumer } from "../context/QueuesProvider";
import { ComponentConnect } from "../context/contextHelper";
import QueueService from "../services/QueueService";
import Loading from "./Loading";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";

class Chat extends Component {
  state = { queue: null, loading: false };

  chatboxRef = createRef();

  cancelGetQueue = () => {};

  componentWillUnmount() {
    this.cancelGetQueue();
  }

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));

  componentDidUpdate(prevProps) {
    if (prevProps.selectedQueue !== this.props.selectedQueue) {
      console.log("NEW QUEUR");
      this.cancelGetQueue();
      this.getQueue();
    }
  }

  scrollToBottom = () => {
    this.chatboxRef.current.scrollTop = this.chatboxRef.current.scrollHeight;
  };

  getQueue = async () => {
    try {
      this.toggleLoading();
      const res = await QueueService.getQueue(
        this.props.selectedQueue,
        cancel => (this.cancelGetQueue = cancel)
      );
      this.setState({ queue: res.data.data });
      this.scrollToBottom();
      console.log(res);
      this.toggleLoading();
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        message.error(response.errorMessage);
      }
    }
  };

  render() {
    const { queue, loading } = this.state;
    return (
      <Row
        className={queue ? "chat-con h100" : ""}
        type="flex"
        justify={loading ? "center" : "start"}
        align="middle"
      >
        {loading ? (
          <Loading tip="Fetching conversation" />
        ) : (
          <Fragment>
            <Col
              className={queue ? "header-con" : ""}
              style={{ padding: queue ? 20 : 0 }}
              xl={24}
              lg={24}
              md={24}
            >
              <ChatHeader queue={queue} />
            </Col>
            <Col
              className="chat-box-con"
              style={{ padding: queue ? 20 : 0 }}
              xl={24}
              lg={24}
              md={24}
            >
              <ChatBox ref={this.chatboxRef} queue={queue} />
            </Col>
            <Col style={{ padding: queue ? 20 : 0 }} xl={24} lg={24} md={24}>
              {queue && (
                <div className="chat-input-con">
                  <Icon
                    theme="twoTone"
                    style={{ fontSize: 30, marginRight: 12, cursor: "pointer" }}
                    type="picture"
                  />
                  <Input.TextArea
                    className="chat-input"
                    placeholder="Say something..."
                  />
                </div>
              )}
            </Col>
          </Fragment>
        )}
      </Row>
    );
  }
}

export default ComponentConnect(["selectedQueue"], QueuesConsumer)(Chat);
