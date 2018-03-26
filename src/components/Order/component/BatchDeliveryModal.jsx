import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Select, Alert } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class BatchDeliveryModal extends Component {
  handleSubmit() {
    const p = this;
    const { form, dispatch, checkId } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      values.erpOrderId = JSON.stringify(checkId);
      dispatch({
        type: 'order/batchDelivery',
        payload: { ...values },
        callback() {
          p.handleCancel();
        },
      });
    });
  }
  handleCancel() {
    const { form, closeModal } = this.props;
    form.resetFields();
    closeModal();
  }
  handleLogisticCompanyChange(name) {
  	const p = this;
  	const { form, dispatch, checkId} = this.props;
  	let logisticCompany = name;
  	let erpOrderIds = JSON.stringify(checkId);
  	let isBatch = true;
  	if(erpOrderIds && logisticCompany) {
  		dispatch({
			type: 'order/checkManyTimesDelivery',
	        payload: { erpOrderIds, logisticCompany, isBatch}
		});
  	}
  }
  render() {
    const p = this;
    const { visible, form, deliveryCompanyList, formInfo } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <div>
        <Modal
          visible={visible}
          title={<font color="#00f" size="4">批量发货(每个子订单作为一个包裹)</font>}
          onOk={p.handleSubmit.bind(p)}
          onCancel={p.handleCancel.bind(p)}
          width={900}
        >
          <Form>
            {formInfo && <Row>
              <Alert
                message={formInfo}
                type="info"
                closable
              />
              <div style={{ height: 10 }} />
            </Row>}
            <Row>
              <Col span={12}>
                <FormItem
                  label="物流公司名称"
                  {...formItemLayout}
                >
                  {getFieldDecorator('logisticCompany', {
                    rules: [{ required: true, message: '请选择物流公司名称' }],
                  })(
                    <Select placeholder="请选择物流公司名称" allowClear onChange={this.handleLogisticCompanyChange.bind(this)}>
                      {deliveryCompanyList.map(v => (
                        <Option value={v.name} key={v.name}>{v.name}</Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="物流状态"
                  {...formItemLayout}
                >
                  {getFieldDecorator('status')(
                    <Select placeholder="请选择物流状态" allowClear>
                      <Option value="0" key="0">已预报</Option>
                      <Option value="1" key="1">快递已发货</Option>
                      <Option value="2" key="2">客户已收货</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="渠道"
                  {...formItemLayout}
                >
                  {getFieldDecorator('type', {
                    rules: [{ required: true, message: '请选择渠道' }],
                  })(
                    <Select placeholder="请选择渠道" allowClear>
                      <Option value="1" key="1">包税线</Option>
                      <Option value="4" key="4">USA-P</Option>
                      <Option value="5" key="5">USA-C</Option>
                      <Option value="2" key="2">身份证线</Option>
                      <Option value="3" key="3">BC线</Option>
                      <Option value="6" key="6">邮客食品线</Option>
                      <Option value="8" key="8">4PX经济A线</Option>
                      <Option value="9" key="9">4PX经济B线</Option>
                      <Option value="7" key="7">邮客奶粉线</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="运费"
                  {...formItemLayout}
                >
                  {getFieldDecorator('freight')(
                    <Input placeholder="请输入运费" />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(BatchDeliveryModal);
