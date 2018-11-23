import React from "react";

export const QueuesContext = React.createContext();
export const QueuesConsumer = QueuesContext.Consumer;

export class QueuesProvider extends React.Component {
  state = {
    queues: [],
    totalCount: null,
    selectedQueue: null,
    readQueue: null
  };

  setQueues = queues => this.setState({ queues });
  setTotalCount = totalCount => this.setState({ totalCount });
  setSelectedQueue = selectedQueue => {
    console.log("selected", selectedQueue);
    this.setState({ selectedQueue });
  };
  setReadQueue = readQueue => this.setState({ readQueue });

  render() {
    return (
      <QueuesContext.Provider
        value={{
          inbox: this.state.inbox,
          queues: this.state.queues,
          totalCount: this.state.totalCount,
          selectedQueue: this.state.selectedQueue,
          readQueue: this.state.readQueue,
          setSelectedQueue: this.setSelectedQueue,
          setTotalCount: this.setTotalCount,
          setQueues: this.setQueues,
          setReadQueue: this.setReadQueue
        }}
      >
        {this.props.children}
      </QueuesContext.Provider>
    );
  }
}
