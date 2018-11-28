import React from "react";

export const SkuContext = React.createContext();
export const SkuConsumer = SkuContext.Consumer;

export class SkuProvider extends React.Component {
  state = {
    skus: null,
    products: null,
    product_groups: null,
    totalSkuCount: 0,
    totalProductCount: 0,
    totalProductGroupCount: 0
  };

  setSkuState = (key, val) => this.setState({ [key]: val });

  render() {
    return (
      <SkuContext.Provider
        value={{
          skus: this.state.skus,
          products: this.state.products,
          product_groups: this.state.product_groups,
          totalSkuCount: this.state.totalSkuCount,
          totalProductCount: this.state.totalProductCount,
          totalProductGroupCount: this.state.totalProductGroupCount,
          setSkuState: this.setSkuState
        }}
      >
        {this.props.children}
      </SkuContext.Provider>
    );
  }
}
