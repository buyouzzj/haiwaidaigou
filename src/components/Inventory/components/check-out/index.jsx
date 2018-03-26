import React, { Component } from 'react';
import { Button, Popover, InputNumber } from 'antd';

export default class CheckOut extends Component {
  constructor() {
    super();
    this.state = {
      data: {},
      visible: false,
      quantity: 1,
      showError: false,
    };
  }
  toggleVisible() {
    this.setState({ visible: !this.state.visible, quantity: 1, showError: false });
  }
  submit() {
    const { record, handleSubmit, page } = this.props;
    const { quantity } = this.state;
    if (!quantity) {
      this.setState({ showError: true });
      return;
    }
    this.toggleVisible();
    this.props.dispatch({
      type: 'inventory/checkOut',
      payload: { quantity, inventoryAreaId: record.id },
      cb() { handleSubmit(null, page); },
    });
  }
  render() {
    const { showError } = this.state;
    const { record } = this.props;
    return (
      <Popover
        content={<div>
          <div>商品名称：{record.itemName}</div>
          <div style={{ paddingTop: 6 }}>盘出数量：<InputNumber placeholder="请输入" step={1} value={this.state.quantity} onChange={v => this.setState({ quantity: v })} /></div>
          {showError && <div style={{ paddingTop: 6, color: 'red' }}>请填写盘出数量</div>}
          <Button size="small" type="primary" style={{ marginTop: 6 }} onClick={this.submit.bind(this)}>保存</Button>
        </div>}
        title="库存盘出"
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.toggleVisible.bind(this)}
      >
        <a href="javascript:void(0)">库存盘出</a>
      </Popover>
    );
  }
}
