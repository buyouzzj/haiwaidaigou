import React, { Component } from 'react';
import { Modal, Cascader, Input, Row, Col, Form } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import divisions from '../../utils/divisions.json';
import * as check from '../../utils/checkLib';

moment.locale('zh-cn');

const FormItem = Form.Item;

class ErpOrderModal extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues = {} } = p.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) { return; }
      if (fieldsValue.address) {
        fieldsValue.receiverState = fieldsValue.address[0];
        fieldsValue.receiverCity = fieldsValue.address[1];
        fieldsValue.receiverDistrict = fieldsValue.address[2];
        delete fieldsValue.address;
      }
      if (modalValues.data) {
        dispatch({
          type: 'order/updateErpOrder',
          payload: { ...fieldsValue, id: modalValues.data.id },
        });
      }
      p.closeModal();
    });
  }

  closeModal() {
    const { form, close } = this.props;
    form.resetFields();
    close(false);
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

  render() {
    const p = this;
    const { form, title, visible, modalValues = {} } = p.props;
    const erpOrderData = (modalValues && modalValues.data) || {};
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
    if (erpOrderData.receiverState) initialAddress.push(erpOrderData.receiverState);
    if (erpOrderData.receiverCity) initialAddress.push(erpOrderData.receiverCity);
    if (erpOrderData.receiverDistrict) initialAddress.push(erpOrderData.receiverDistrict);

    return (
      <Modal {...modalProps} >
        <Form>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                {getFieldDecorator('itemName', {
                  initialValue: erpOrderData.itemName,
                })(
                  <Input placeholder="请输入商品名称" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="颜色"
                {...formItemLayout}
              >
                {getFieldDecorator('color', {
                  initialValue: erpOrderData.color,
                })(
                  <Input disabled placeholder="请输入颜色" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="尺码"
                {...formItemLayout}
              >
                {getFieldDecorator('scale', {
                  initialValue: erpOrderData.scale,
                })(
                  <Input disabled placeholder="请输入尺码" />)}
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
                  initialValue: erpOrderData.receiver,
                })(
                  <Input placeholder="请输入收件人" />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="联系电话"
                {...formItemLayout}
              >
                {getFieldDecorator('telephone', {
                  initialValue: erpOrderData.telephone,
                })(
                  <Input placeholder="请输入电话号码" />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="身份证号"
                {...formItemLayout}
              >
                {getFieldDecorator('idCard', {
                  initialValue: erpOrderData.idCard,
                })(
                  <Input placeholder="请输入身份证号" />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="销售价"
                {...formItemLayout}
              >
                {getFieldDecorator('salePrice', {
                  initialValue: erpOrderData.salePrice,
                })(
                  <Input placeholder="请输入销售价" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="销售数量"
                {...formItemLayout}
              >
                {getFieldDecorator('quantity', {
                  initialValue: erpOrderData.quantity,
                })(
                  <Input disabled placeholder="请输入销售数量" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="邮编"
                {...formItemLayout}
              >
                {getFieldDecorator('postcode', {
                  initialValue: erpOrderData.postcode,
                })(
                  <Input placeholder="请输入邮编" />,
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
                })(
                  <Cascader options={divisions} placeholder="请选择" style={{ marginLeft: 5 }} popupClassName="cascaderPop" />,
                )}
              </FormItem>
            </Col>
            <Col span={9}>
              <FormItem>
                {getFieldDecorator('addressDetail', {
                  initialValue: erpOrderData.addressDetail,
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
                  initialValue: erpOrderData.remark,
                })(
                  <Input placeholder="请输入备注信息" size="large" style={{ marginLeft: 3, width: 646 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(ErpOrderModal);
