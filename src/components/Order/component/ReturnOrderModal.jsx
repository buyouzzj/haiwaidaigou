import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Select, DatePicker } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';

const FormItem = Form.Item;
const Option = Select.Option;

class ReturnOrderModal extends Component {
  handleSubmit() {
    const p = this;
    const { form, dispatch, data, returnType } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.returnPayTime) {
        values.returnPayTime = values.returnPayTime.format('YYYY-MM-DD');
      }
      if (values.receiveTime) {
        values.receiveTime = values.receiveTime.format('YYYY-MM-DD');
      }
      if (returnType === '新增') {
        const { orderNo, outerOrderId, erpNo } = data;
        const erpOrderId = data.id;
        dispatch({
          type: 'order/addReturnOrder',
          payload: { ...values, orderNo, outerOrderId, erpNo, erpOrderId },
          cb() { p.handleCancel(); },
        });
      } else {
        values.id = data.id;
        dispatch({
          type: 'order/updateReturnOrder',
          payload: { ...values },
          cb() { p.handleCancel(); },
        });
      }
    });
  }
  handleCancel() {
    const { form, close } = this.props;
    form.resetFields();
    close();
  }
  render() {
    const p = this;
    const { visible, form, data = {}, returnType } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <div>
        <Modal
          visible={visible}
          title={returnType}
          onOk={p.handleSubmit.bind(p)}
          onCancel={p.handleCancel.bind(p)}
          width={900}
        >
          <Form>
            <Row>
              <Col span={12}>
                <FormItem
                  label="商品名称"
                  {...formItemLayout}
                >
                  {data.itemName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="退款形式"
                  {...formItemLayout}
                >
                  {getFieldDecorator('returnType', {
                    initialValue: typeof data.returnType === 'number' ? data.returnType.toString() : undefined,
                    rules: [{ required: true, message: '请选择' }],
                  })(
                    <Select placeholder="请选择退款形式" allowClear>
                      <Option key="0">仅退款</Option>
                      <Option key="1">既退货又退款</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="退单状态"
                  {...formItemLayout}
                >
                  {getFieldDecorator('status', {
                    initialValue: typeof data.status === 'number' ? data.status.toString() : undefined,
                    rules: [{ required: true, message: '请选择' }],
                  })(
                    <Select placeholder="请选择退单状态" allowClear>
                      <Option key="0">待审核</Option>
                      <Option key="1">审核通过,退款中</Option>
                      <Option key="2">退款成功</Option>
                      <Option key="-1">关闭</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="退货数量"
                  {...formItemLayout}
                >
                  {getFieldDecorator('returnQuantity', {
                    initialValue: data.returnQuantity,
                  })(
                    <Input placeholder="请输入" />,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="退款金额"
                  {...formItemLayout}
                >
                  {getFieldDecorator('returnPrice', {
                    initialValue: data.returnPrice,
                  })(
                    <Input placeholder="请输入" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="是否国内退货"
                  {...formItemLayout}
                >
                  {getFieldDecorator('isGn', {
                    initialValue: typeof (data.isGn) === 'number' ? data.isGn.toString() : '1',
                    rules: [{ required: true, message: '请选择' }],
                  })(
                    <Select placeholder="请选择" allowClear>
                      <Option key="1">是</Option>
                      <Option key="0">否</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="收货时间"
                  {...formItemLayout}
                >
                  {getFieldDecorator('receiveTime', {
                    initialValue: data.receiveTime && moment(data.receiveTime, 'YYYY-MM-DD'),
                  })(
                    <DatePicker placeholder="请输入收货时间" style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="是否入库"
                  {...formItemLayout}
                >
                  {getFieldDecorator('isCheckin', {
                    initialValue: typeof data.isCheckin === 'number' ? data.isCheckin.toString() : '1',
                    rules: [{ required: true, message: '请选择' }],
                  })(
                    <Select placeholder="请选择" allowClear>
                      <Option key="1">是</Option>
                      <Option key="0">否</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="退款时间"
                  {...formItemLayout}
                >
                  {getFieldDecorator('returnPayTime', {
                    initialValue: data.returnPayTime && moment(data.returnPayTime, 'YYYY-MM-DD'),
                  })(
                    <DatePicker placeholder="请输入退款时间" style={{ width: '100%' }} />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="退单原因"
                  {...formItemLayout}
                >
                  {getFieldDecorator('returnReason', {
                    initialValue: data.returnReason,
                    rules: [{ required: true, message: '请选择' }],
                  })(
                    <Select placeholder="请选择退单原因" allowClear>
                      <Option key="发错货">发错货</Option>
                      <Option key="多发货">多发货</Option>
                      <Option key="采购不到">采购不到</Option>
                      <Option key="质量问题">质量问题</Option>
                      <Option key="尺码问题">尺码问题</Option>
                      <Option key="物流原因">物流原因</Option>
                      <Option key="客户错误下单">客户错误下单</Option>
                      <Option key="其他">其他</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="退单原因详情"
                  {...formItemLayout}
                >
                  {getFieldDecorator('returnReasonDetail', {
                    initialValue: data.returnReasonDetail,
                  })(
                    <Input type="textarea" placeholder="请输入退单原因详情" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="备注"
                  {...formItemLayout}
                >
                  {getFieldDecorator('remark', {
                    initialValue: data.remark,
                  })(
                    <Input type="textarea" placeholder="请输入备注详情" />,
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(ReturnOrderModal);
