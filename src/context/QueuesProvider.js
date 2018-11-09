import React from "react";

export const QueuesContext = React.createContext();
export const QueuesConsumer = QueuesContext.Consumer;

export class QueuesProvider extends React.Component {
  state = {
    queues: null,
    totalCount: null,
    selectedQueue: null
  };

  setQueues = queues => this.setState({ queues });
  setTotalCount = totalCount => this.setState({ totalCount });
  setSelectedQueue = selectedQueue => this.setState({ selectedQueue });

  render() {
    return (
      <QueuesContext.Provider
        value={{
          queues: this.state.queues,
          totalCount: this.state.totalCount,
          selectedQueue: this.state.selectedQueue,
          setSelectedQueue: this.setSelectedQueue,
          setTotalCount: this.setTotalCount,
          setQueues: this.setQueues
        }}
      >
        {this.props.children}
      </QueuesContext.Provider>
    );
  }
}
