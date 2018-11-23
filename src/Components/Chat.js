import React, { Component, Fragment } from "react";
import { Row, Col, message, Upload } from "antd";
import { QueuesConsumer } from "../context/QueuesProvider";
import { ComponentConnect } from "../context/contextHelper";
import QueueService from "../services/QueueService";
import MessageService from "../services/MessageService";
import Loading from "./Loading";
import ChatHeader from "./ChatHeader";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { AuthConsumer } from "../context/AuthProvider";
import * as randomstring from "randomstring";
import SocketService from "../services/SocketService";
import { CLIENT_MESSAGE, END_QUEUE } from "../globals";

const MESSAGE_PAGE_SIZE = 10;

class Chat extends Component {
  state = {
    queue: null,
    loading: false,
    messageText: "",
    messages: [],
    files: [],
    totalMessageCount: 0,
    messageLoading: false,
    fetchMore: false,
    more: false,
    page: 1
  };

  cancelGetQueue = () => {};
  cancelGetMessages = () => {};
  cancelGetMessagesCount = () => {};
  cancelGetMoreMessages = () => {};
  cancelReadMessages = () => {};

  componentWillUnmount() {
    this.cancelGetQueue();
    this.cancelGetMessages();
    this.cancelGetMessages();
    this.cancelGetMoreMessages();
    this.cancelReadMessages();
    this.setState({
      loading: false,
      queue: null,
      messageLoading: false,
      fetchMore: false
    });
  }

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));

  toggleMessageLoading = () =>
    this.setState(({ messageLoading }) => ({
      messageLoading: !messageLoading
    }));
  toggleFetchMore = () =>
    this.setState(({ fetchMore }) => ({ fetchMore: !fetchMore }));

  componentDidMount() {
    if (this.props.selectedQueue) {
      this.listenForEndQueue();
      this.listenFormClientMessage();
      this.getQueue();
      this.getMessageResources();
      this.readAllMessages();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.selectedQueue &&
      prevProps.selectedQueue !== this.props.selectedQueue
    ) {
      this.cancelGetQueue();
      this.getQueue();
      this.getMessageResources();
      this.readAllMessages();
    }
  }

  readAllMessages = () => {
    MessageService.readMessages(
      { queue: this.props.selectedQueue },
      token => (this.cancelReadMessages = token)
    );
  };

  listenFormClientMessage = () => {
    SocketService.listenToEvent(CLIENT_MESSAGE, payload => {
      const { selectedQueue } = this.props;
      if (selectedQueue === payload.message.queue) {
        this.setState(({ messages }) => ({
          messages: [payload.message, ...messages]
        }));
        this.readAllMessages();
      }
    });
  };

  listenForEndQueue = () => {
    SocketService.listenToEvent(END_QUEUE, ({ queue }) => {
      console.log("here");
      if (queue._id === this.state.queue._id) {
        this.setState({ queue: { ...this.state.queue, status: 0 } });
      }
    });
  };

  gotoHome = () => {
    message.warn("Your session has expired. Logging you out");
    window.setTimeout(() => (window.location.pathname = ""), 2000);
  };

  setMessagesState = (key, value) => this.setState({ [key]: value });

  getQueue = async () => {
    try {
      this.toggleLoading();
      const { selectedQueue, setSelectedQueue } = this.props;
      const res = await QueueService.getQueue(
        this.props.selectedQueue,
        cancel => (this.cancelGetQueue = cancel),
        "",
        { qStatus: this.props.status }
      );

      //need to reset selected props because unmounting the conversation sets the selected prop to null
      setSelectedQueue(selectedQueue);
      this.setState({ queue: res.data.data });
      this.toggleLoading();
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        if (response.status === 401) {
          this.gotoHome();
          return;
        }
        message.error(response.errorMessage);
      }
    }
  };

  getMessageResources = async () => {
    try {
      console.log("get message resources");
      this.toggleMessageLoading();
      const res = await Promise.all([
        this.getMessages(),
        this.getMessagesCount()
      ]);
      const [m, mcount] = res;
      const messages = m.data.data;
      const totalMessageCount = mcount.data.data;
      this.setMessagesState("messages", messages);
      this.setMessagesState("totalMessageCount", totalMessageCount);
      this.toggleMessageLoading();
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        if (response.status === 401) {
          this.gotoHome();
          return;
        }
        message.error(response.errorMessage);
      }
    }
  };

  getMessages = () => {
    const { selectedQueue } = this.props;

    const { page } = this.state;
    return MessageService.getMessages(
      { qId: selectedQueue, page },
      cancelToken => (this.cancelGetQueues = cancelToken)
    );
  };

  getMessagesCount = () => {
    const { selectedQueue } = this.props;
    return MessageService.getQueuesCount(
      { qId: selectedQueue },
      cancelToken => (this.cancelGetQueuesCount = cancelToken)
    );
  };

  getMoreMessages = async () => {
    console.log("get more");
    try {
      const { page, messages } = this.state;
      const { selectedQueue } = this.props;
      this.toggleFetchMore();
      const res = await MessageService.getMessages(
        {
          qId: selectedQueue,
          page: page + 1 //increment page
        },
        cancelToken => (this.cancelGetMoreMessages = cancelToken)
      );
      this.toggleFetchMore();
      const fetchedMessages = res.data.data;
      //add new messages to prev messages

      this.setState({
        more: true,
        page: page + 1,
        messages: [...messages, ...fetchedMessages]
      });
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleFetchMore();
        if (response.status === 401) {
          this.gotoHome();
          return;
        }
        message.error(response.errorMessage);
      }
    }
  };

  listenForScrollToTop = e => {
    const { scrollTop } = e.target;
    const { messages, totalMessageCount } = this.state;
    if (
      scrollTop === 0 && //reacth the top most aprt
      !this.state.fetchMore && //check if fetching more messages
      messages.length !== totalMessageCount && //check if all messages are fetched
      totalMessageCount > MESSAGE_PAGE_SIZE
    ) {
      this.getMoreMessages();
    }
  };

  handleChangeMessage = messageText => this.setState({ messageText });

  sendMessage = async () => {
    const { user } = this.props;
    const {
      messageText,
      queue,
      messages,
      totalMessageCount,
      files
    } = this.state;
    if (messageText.length > 0 && files.length > 0) {
      //if text and image
      const attachments = files.map(f => f.url);
      const newMessage = {
        fromCms: true,
        newMsg: true,
        _id: randomstring.generate(10),
        agent: { _id: user._id, name: user.username },
        queue: queue._id,
        message: { text: messageText.replace("\n", ""), attachments },
        read: true,
        type: 1,
        timestamp: new Date()
      };
      this.setState({
        messageText: "",
        files: [],
        messages: [newMessage, ...messages],
        totalMessageCount: totalMessageCount + 1
      });
    } else if (messageText.length > 0) {
      //text only
      const newMessage = {
        newMsg: true,
        fromCms: true,
        _id: randomstring.generate(10),
        agent: { _id: user._id, name: user.username },
        queue: queue._id,
        message: { text: messageText.replace("\n", "") },
        read: true,
        type: 1,
        timestamp: new Date()
      };
      this.setState({
        messageText: "",
        messages: [newMessage, ...messages],
        totalMessageCount: totalMessageCount + 1
      });
    } else if (files.length > 0) {
      //image only
      const attachments = files.map(f => f.url);
      const newMessage = {
        fromCms: true,
        newMsg: true,
        _id: randomstring.generate(10),
        agent: { _id: user._id, name: user.username },
        queue: queue._id,
        message: { attachments },
        read: true,
        type: 1,
        timestamp: new Date()
      };
      this.setState({
        messageText: "",
        files: [],
        messages: [newMessage, ...messages],
        totalMessageCount: totalMessageCount + 1
      });
    }
  };

  setFiles = newfiles => {
    const { files } = this.state;
    this.setState({ files: [...files, ...newfiles] });
  };

  onRemoveFile = ({ uid }) => {
    const { files } = this.state;
    const fIndex = files.findIndex(f => f.uid === uid);
    if (fIndex > -1) {
      files.splice(fIndex, 1);
      this.setState({ files });
    }
  };

  render() {
    const {
      queue,
      loading,
      messageText,
      messages,
      messageLoading,
      fetchMore,
      files,
      more
    } = this.state;

    return (
      <Row
        className={queue ? "chat-con h100" : ""}
        type="flex"
        justify={loading ? "center" : "start"}
        align="middle"
      >
        {loading ? (
          <Loading tip="Fetching queue details" />
        ) : (
          <Fragment>
            <Col
              className={queue ? "header-con" : ""}
              style={{ padding: queue ? 20 : 0 }}
              xl={24}
              lg={24}
              md={24}
              sm={24}
              xs={24}
            >
              <ChatHeader queue={queue} />
            </Col>
            <Col
              onScroll={this.listenForScrollToTop}
              className="chat-box-con"
              style={{ padding: queue ? 20 : 0 }}
              xl={24}
              lg={24}
              md={24}
              sm={24}
              xs={24}
            >
              <ChatBox
                more={more}
                setFiles={this.setFiles}
                fetchMore={fetchMore}
                messageLoading={messageLoading}
                messages={messages}
                setMessagesState={this.setMessagesState}
                queue={queue}
              />
            </Col>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
              <div className="upload">
                <Upload
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: true
                  }}
                  onRemove={this.onRemoveFile}
                  fileList={files}
                  multiple
                  beforeUpload={() => false}
                  accept="image/*"
                  listType="picture-card"
                />
              </div>
            </Col>
            <Col
              style={{ padding: queue ? 20 : 0 }}
              xl={24}
              lg={24}
              md={24}
              sm={24}
              xs={24}
            >
              {queue && queue.status === 1 ? (
                <ChatInput
                  setFiles={this.setFiles}
                  sendMessage={this.sendMessage}
                  messageText={messageText}
                  handleChangeMessage={this.handleChangeMessage}
                  queue={queue}
                />
              ) : (
                queue && <span>This chat has ended</span>
              )}
            </Col>
          </Fragment>
        )}
      </Row>
    );
  }
}

export default ComponentConnect(["user"], AuthConsumer)(
  ComponentConnect(
    [
      "selectedQueue",
      "queues",
      "setQueues",
      "setReadQueue",
      "setSelectedQueue"
    ],
    QueuesConsumer
  )(Chat)
);
