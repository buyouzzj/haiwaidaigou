import React, { Component } from 'react';
import { Modal, Cascader, Input, Row, Col, DatePicker, Form, Select } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import ProductTable from './ProductTable';
import divisions from '../../utils/divisions.json';
import * as check from '../../utils/checkLib';

moment.locale('zh-cn');

const Option = Select.Option;
const FormItem = Form.Item;

class OrderModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      previewImage: '',
    };

    // skuTable改写父级方法
    this.getSkuValue = null;
    this.clearSkuValue = null;
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues = {}, agencyList = [] } = p.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) { return; }
      let salesName = '';
      agencyList.forEach((el) => {
        if (el.id.toString() === fieldsValue.salesId) {
          salesName = el.name;
        }
      });
      fieldsValue.salesName = salesName;
      if (fieldsValue.address) {
        fieldsValue.receiverState = fieldsValue.address[0];
        fieldsValue.receiverCity = fieldsValue.address[1];
        fieldsValue.receiverDistrict = fieldsValue.address[2];
        delete fieldsValue.address;
      }
      p.getSkuValue((orderDetailList) => {
        if (modalValues.data) {
          dispatch({
            type: 'order/updateOrder',
            payload: { ...fieldsValue, id: modalValues.data.id, outerOrderDetailList: JSON.stringify(orderDetailList) },
          });
        } else {
          dispatch({
            type: 'order/addOrder',
            payload: { ...fieldsValue, outerOrderDetailList: JSON.stringify(orderDetailList) },
          });
        }
        p.closeModal();
      });
    });
  }

  closeModal() {
    const { form, close } = this.props;
    form.resetFields();
    close();
    // 清理skuTable
    setTimeout(() => {
      this.clearSkuValue();
    }, 100);
  }

  checkPhone(rules, value, callback) {
    if (check.phone(value) || check.tel(value)) {
      callback();
    } else {
      callback(new Error('请填写正确的手机或座机'));
    }
  }

  checkIdCard(rules, value, callback) {
    if (!value) callback();
    else if (check.idcard(value)) {
      callback();
    } else {
      callback(new Error('请填写正确的身份证号'));
    }
  }

  checkName(rules, value, callback) {
    if (check.ChineseName(value, { min: 2 })) {
      callback();
    } else {
      callback(new Error('请填写正确的姓名'));
    }
  }

  checkImg(rules, values, cb) { cb(); }

  handleDelete(id) {
    const { skuList } = this.state;
    const skuData = skuList.filter(item => id !== item.id);
    this.setState({ skuList: skuData });
  }

  render() {
    const p = this;
    const { form, title, visible, modalValues = {}, agencyList = [] } = p.props;
    const orderData = (modalValues && modalValues.data) || {};
    const { getFieldDecorator } = form;
    const modalProps = {
      visible,
      width: 900,
      wrapClassName: 'modalStyle',
      okText: '保存',
      title,
      maskClosable: false,
      closable: true,
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal();
      },
    };
    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };
    const initialAddress = [];
    if (orderData.receiverState) initialAddress.push(orderData.receiverState);
    if (orderData.receiverCity) initialAddress.push(orderData.receiverCity);
    if (orderData.receiverDistrict) initialAddress.push(orderData.receiverDistrict);

    return (
      <Modal {...modalProps} >
        <Form onSubmit={p.handleSubmit.bind(p)}>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="订单编号"
                {...formItemLayout}
              >
                {getFieldDecorator('orderNo', {
                  initialValue: orderData.orderNo,
                })(
                  <Input placeholder={!orderData.orderNo && '自动生成'} disabled />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="销售"
                {...formItemLayout}
              >
                {getFieldDecorator('salesId', {
                  initialValue: orderData.salesId ? orderData.salesId.toString() : undefined,
                  rules: [{ required: true, message: '请选择销售' }],
                })(
                  <Select placeholder="请选择销售" allowClear>
                    {agencyList.map((el) => {
                      return <Option key={el.id} value={el.id && el.id.toString()}>{el.name}</Option>;
                    })}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label="订单时间"
                {...formItemLayout}
              >
                {getFieldDecorator('orderTime', {
                  initialValue: (orderData.orderTime && moment(orderData.orderTime, 'YYYY-MM-DD HH:mm:ss')) || moment(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                  rules: [{ required: true, message: '请输入订单时间' }],
                })(
                  <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请输入订单时间" />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="收件人"
                {...formItemLayout}
              >
                {getFieldDecorator('receiver', {
                  initialValue: orderData.receiver,
                  rules: [{ 
                  	required: true, 
                  	//validator: this.checkName.bind(this), 
                  	message: '请输入收件人中文名' 
                  }],
                })(
                  <Input placeholder="请输入收件人" />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="电话号码"
                {...formItemLayout}
              >
                {getFieldDecorator('telephone', {
                  initialValue: orderData.telephone,
                  rules: [{ required: true, validator: this.checkPhone.bind(this) }],
                })(
                  <Input placeholder="请输入电话号码" />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label="身份证号"
                {...formItemLayout}
              >
                {getFieldDecorator('idCard', {
                  initialValue: orderData.idCard,
                  rules: [{ required: false, validator: this.checkIdCard.bind(this) }],
                })(
                  <Input placeholder="请输入身份证号" />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="外部订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('targetNo', {
                  initialValue: orderData.targetNo,
                })(
                  <Input placeholder="请输入外部订单号" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="销售来源"
                {...formItemLayout}
              >
                {getFieldDecorator('platformType', {
                  initialValue: orderData.platformType && orderData.platformType.toString(),
                  rules: [{ required: true, message: '请选择销售来源' }],
                })(
                  <Select placeholder="请选择销售来源" allowClear>
                    <Option key="1">有赞</Option>
                    <Option key="2">微信</Option>
                    <Option key="10">其他</Option>
                    <Option key="3">微信小程序</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label="支付方式"
                {...formItemLayout}
              >
                {getFieldDecorator('payType', {
                  initialValue: orderData.payType && orderData.payType.toString(),
                })(
                  <Select placeholder="请选择支付方式" allowClear>
                    <Option key="0">微信自有支付</Option>
                    <Option key="1">微信代销支付</Option>
                    <Option key="2">支付宝支付</Option>
                    <Option key="3">银行卡支付</Option>
                    <Option key="4">代付</Option>
                    <Option key="5">货到付款</Option>
                    <Option key="6">百度钱包支付</Option>
                    <Option key="12">信用卡</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={12}>
              <FormItem
                label="收件人地址"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                {getFieldDecorator('address', {
                  initialValue: initialAddress.length ? initialAddress : undefined,
                  rules: [{ required: true, message: '请选择' }],
                })(
                  <Cascader options={divisions} placeholder="请选择" style={{ marginLeft: 5 }} popupClassName="cascaderPop" />,
                )}
              </FormItem>
            </Col>
            <Col span={9}>
              <FormItem>
                {getFieldDecorator('addressDetail', {
                  initialValue: orderData.addressDetail,
                  rules: [{ required: true, message: '请输入详细地址' }],
                })(
                  <Input placeholder="请输入详细地址" size="large" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="备注"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 18 }}
              >
                {getFieldDecorator('remark', {
                  initialValue: orderData.remark,
                })(
                  <Input placeholder="请输入备注信息" size="large" style={{ marginLeft: 3, width: 646 }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <ProductTable data={orderData.outerOrderDetails} parent={this} />
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(OrderModal);
