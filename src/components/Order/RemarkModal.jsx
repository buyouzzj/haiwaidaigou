import React, { Component } from 'react';
import { Modal, Cascader, Input, Row, Col, Form } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import divisions from '../../utils/divisions.json';
import * as check from '../../utils/checkLib';

moment.locale('zh-cn');

const FormItem = Form.Item;

class RemarkModal extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues = {} } = p.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) { return; }
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

  render() {
    const p = this;
    const { form, title, visible, modalValues = {} } = p.props;
    const erpOrderData = (modalValues && modalValues.data) || {};
    const { getFieldDecorator } = form;
    const modalProps = {
      visible,
      width: 500,
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

    return (
      <Modal {...modalProps} >
        <Form>
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
                  <Input placeholder="请输入此单的备注信息" size="large" style={{ marginLeft: 3, width: 346 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(RemarkModal);
