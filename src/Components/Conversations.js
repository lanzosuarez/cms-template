import React, { Component } from "react";
import { Row, Col, message } from "antd";
import SearchQueues from "./SearchQueues";
import Queues from "./Queues";
import QueueService from "../services/QueueService";
import { ComponentConnect } from "../context/contextHelper";
import { AuthConsumer } from "../context/AuthProvider";
import { QueuesConsumer } from "../context/QueuesProvider";
import SocketService from "../services/SocketService";
import { NEW_QUEUE } from "../globals";
import Chat from "./Chat";

class Conversations extends Component {
  state = {
    loading: false,
    page: 1,
    fetchMore: false,
    qName: ""
  };

  cancelGetQueues = () => {};
  cancelGetQueuesCount = () => {};
  cancelGetMoreQueues = () => {};
  cancelSearchQueue = () => {};

  toggleLoading = () => this.setState(({ loading }) => ({ loading: !loading }));
  toggleFetchMore = () =>
    this.setState(({ fetchMore }) => ({ fetchMore: !fetchMore }));

  componentWillUnmount() {
    //request cancellations
    this.cancelGetQueues();
    this.cancelGetQueuesCount();
    this.cancelGetMoreQueues();
    this.cancelSearchQueue();
    this.props.setSelectedQueue(null);
  }

  async componentDidMount() {
    try {
      const { totalCount: tc, queues: qs } = this.props;
      if (tc && qs) {
        return;
      }
      this.toggleLoading();
      const res = await Promise.all([this.getQueues(), this.getQueuesCount()]);
      console.log(res);
      const [q, qcount] = res;
      const queues = q.data.data;
      const totalCount = qcount.data.data;
      console.log(totalCount);

      //cache initital fetch
      this.props.setQueues(queues);
      this.props.setTotalCount(totalCount);
      this.toggleLoading();
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        message.error(response.errorMessage);
      }
    }
  }

  listenForNewQueues = () => {
    SocketService.listenToEvent(NEW_QUEUE, payload => {
      const { setTotalCount, setQueues, totalCount, queues } = this.props;
      setTotalCount(totalCount + 1);
      setQueues([payload, ...queues]);
    });
  };

  getQueues = () => {
    const { _id } = this.props.user;
    const { page, qName } = this.state;
    return QueueService.getQueues(
      { qAgent: _id, page, qName },
      cancelToken => (this.cancelGetQueues = cancelToken)
    );
  };

  searchQueues = async () => {
    try {
      this.toggleLoading();
      const res = await this.getQueues();
      console.log(res.data.data);
      this.props.setQueues(res.data.data);
      this.toggleLoading();
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleLoading();
        message.error(response.errorMessage);
      }
    }
  };

  getQueuesCount = () => {
    const { _id } = this.props.user;
    const { page, qName } = this.state;
    return QueueService.getQueuesCount(
      { page, qName, qAgent: _id },
      cancelToken => (this.cancelGetQueuesCount = cancelToken)
    );
  };

  getMoreQueues = async () => {
    try {
      const { page, qName } = this.state;
      const { _id } = this.props.user;
      const { queues } = this.props;
      this.toggleFetchMore();
      const res = await QueueService.getQueues(
        {
          qAgent: _id,
          page: page + 1, //increment page
          qName
        },
        cancelToken => (this.cancelGetMoreQueues = cancelToken)
      );
      this.toggleFetchMore();
      const fetchedQueues = res.data.data;

      //add new queues to prev queues
      this.props.setQueues([...queues, ...fetchedQueues]);
    } catch (error) {
      const { response } = error;
      if (response) {
        this.toggleFetchMore();
        message.error(response.errorMessage);
      }
    }
  };

  scrollListener = e => {
    const { totalCount, queues } = this.props;
    const { scrollTop, scrollHeight, offsetHeight } = e.target;

    if (
      scrollHeight - scrollTop === offsetHeight && //reacth the end of the scroll height
      !this.state.fetchMore && //check if fetching more queues
      queues.length !== totalCount //check if all queues are fetched
    ) {
      console.log("get more");
      this.getMoreQueues();
    }
  };

  handleInputChange = e => this.setState({ qName: e.target.value });

  handleSearch = () => this.searchQueues();

  render() {
    const { fetchMore, loading } = this.state;
    return (
      <Row className="conv-con h100" type="flex" justify="space-around">
        <Col className="bgw qlist" xl={7} lg={7} md={7}>
          <SearchQueues
            loading={loading}
            fetchMore={fetchMore}
            handleInputChange={this.handleInputChange}
            handleSearch={this.handleSearch}
          />
          <Queues
            loading={loading}
            fetchMore={fetchMore}
            scrollListener={this.scrollListener}
          />
        </Col>
        <Col xl={16} lg={16} md={16}>
          <Chat />
        </Col>
      </Row>
    );
  }
}

export default ComponentConnect(["user"], AuthConsumer)(
  ComponentConnect(
    ["queues", "totalCount", "setQueues", "setTotalCount", "selectedQueue", "setSelectedQueue"],
    QueuesConsumer
  )(Conversations)
);
