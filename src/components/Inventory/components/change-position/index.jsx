import React, { Component } from 'react';
import { Button, Popover, Input } from 'antd';

export default class ChangePosition extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      showError: false,
    };
  }
  toggleVisible() {
    this.setState({ visible: !this.state.visible, showError: false });
    if (this.positionNo) this.positionNo.refs.input.value = '';
  }
  submit() {
    const { record, handleSubmit, page } = this.props;
    const positionNo = this.positionNo.refs.input.value;
    if (!positionNo) {
      this.setState({ showError: true });
      return;
    }
    this.toggleVisible();
    this.props.dispatch({
      type: 'inventory/changePositionNo',
      payload: { positionNo, inventoryAreaId: record.id },
      cb() { handleSubmit(null, page); },
    });
  }
  render() {
    const { showError } = this.state;
    const { record } = this.props;
    return (
      <Popover
        content={<div>
          <div style={{ paddingTop: 6 }}>货架号：
            <Input placeholder="请输入" defaultValue={record.positionNo} ref={(c) => { this.positionNo = c; }} />
          </div>
          {showError && <div style={{ paddingTop: 6, color: 'red' }}>请填写货架号</div>}
          <Button size="small" type="primary" style={{ marginTop: 6 }} onClick={this.submit.bind(this)}>保存</Button>
        </div>}
        title="修改货架号"
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.toggleVisible.bind(this)}
      >
        <a style={{ marginLeft: 10 }} href="javascript:void(0)">修改货架号</a>
      </Popover>
    );
  }
}
