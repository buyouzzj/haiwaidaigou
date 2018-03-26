import React, { Component } from 'react';
import { Form, Input, Button, Popover, InputNumber } from 'antd';

const FormItem = Form.Item;

class TransTo extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
    };
  }
  toggleVisible() {
    this.setState({ visible: !this.state.visible }, () => {
      setTimeout(() => { this.props.form.resetFields(['toTrans', 'positionNo']); }, 0);
    });
  }
  submit() {
    const { record, form, handleSubmit, page } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.toggleVisible();
      this.props.dispatch({
        type: 'inventory/transTo',
        payload: { ...values, inventoryAreaId: record.id },
        cb() { handleSubmit(null, page); },
      });
    });
  }
  render() {
    const { record, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Popover
        content={<Form>
          <div style={{ margin: '12px 0 12px' }}>商品名称：{record.itemName}</div>
          <FormItem
            label="入仓数量"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator('toTrans', {
              initialValue: 1,
              rules: [{ required: true, message: '请输入' }],
            })(
              <InputNumber placeholder="请输入" step={1} />,
            )}
          </FormItem>
          <FormItem
            label="货架号"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator('positionNo', {
              initialValue: record.positionNo,
              rules: [{ required: true, message: '请输入' }],
            })(
              <Input placeholder="请输入" />,
            )}
          </FormItem>
          <Button size="small" type="primary" onClick={this.submit.bind(this)}>保存</Button>
        </Form>}
        title="在途入仓"
        style={{ minWidth: 200 }}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.toggleVisible.bind(this)}
      >
        <a href="javascript:void(0)" style={{ marginRight: 10 }}>在途入仓</a>
      </Popover>
    );
  }
}

export default Form.create()(TransTo);
