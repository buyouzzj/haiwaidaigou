import React, { Component } from 'react';
import { Button, Popover, InputNumber } from 'antd';

export default class extends Component {
  constructor() {
    super();
    this.state = {
      data: {},
      visible: false,
      splitCount: 1,
      showError: false,
    };
  }
  toggleVisible() {
    this.setState({ visible: !this.state.visible, splitCount: 1, showError: false });
  }
  submit() {
    const { record, handleSubmit } = this.props;
    const { splitCount } = this.state;
    if (!splitCount) {
      this.setState({ showError: true });
      return;
    }
    this.toggleVisible();
    this.props.dispatch({
      type: 'order/splitOrder',
      payload: { splitCount, orderId: record.id },
      cb() { handleSubmit(); },
    });
  }
  render() {
    const { showError } = this.state;
    const { record } = this.props;
    return (
      <Popover
        content={<div>
          <div>商品名称：{record.itemName}</div>
          <div style={{ paddingTop: 6 }}>拆分数量：<InputNumber placeholder="请输入" step={1} value={this.state.splitCount} onChange={v => this.setState({ splitCount: v })} /></div>
          {showError && <div style={{ paddingTop: 6, color: 'red' }}>请填写拆分数量</div>}
          <Button size="small" type="primary" style={{ marginTop: 6 }} onClick={this.submit.bind(this)}>保存</Button>
        </div>}
        title="订单拆分"
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.toggleVisible.bind(this)}
      >
        <a href="javascript:void(0)" style={{ marginRight: 10 }}>拆单</a>
      </Popover>
    );
  }
}
