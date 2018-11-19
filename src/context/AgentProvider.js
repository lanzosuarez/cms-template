import React from "react";

export const AgentContext = React.createContext();
export const AgentConsumer = AgentContext.Consumer;

export class AgentProvider extends React.Component {
  state = {
    agents: null,
    totalAgentCount: 0
  };

  setAgents = agents => this.setState({ agents });
  setTotalAgentCount = totalAgentCount => this.setState({ totalAgentCount });

  render() {
    return (
      <AgentContext.Provider
        value={{
          agents: this.state.agents,
          totalAgentCount: this.state.totalAgentCount,
          setAgents: this.setAgents,
          setTotalAgentCount: this.setTotalAgentCount
        }}
      >
        {this.props.children}
      </AgentContext.Provider>
    );
  }
}
