import React, { Component } from 'react';
import { Modal, Input, Row, Col, Select, Form, TreeSelect } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

function toString(str, type) {
  if (typeof str !== 'undefined' && str !== null) {
    return str.toString();
  }
  if (type === 'SELECT') return undefined;
  return '';
}

class CategoryModal extends Component {

  constructor() {
    super();
    this.state = {
    };
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, cateData } = p.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (cateData.data) {
        fieldsValue.id = cateData.data.id;
        dispatch({ type: 'cate/updateCate', payload: { ...fieldsValue } });
      } else {
        dispatch({
          type: 'cate/addCate',
          payload: { ...fieldsValue },
        });
      }
      p.closeModal();
    });
  }

  closeModal() {
    const { close, form } = this.props;
    form.resetFields();
    close(false);
  }

  render() {
    const p = this;
    const { form, visible, tree = [], cateData, title } = this.props;
    const { getFieldDecorator } = form;
    const cateModalData = cateData.data || {};
    const pid = cateModalData.pid && cateModalData.pid !== 0 ? toString(cateModalData.pid, 'SELECT') : undefined;
    const modalProps = {
      visible,
      wrapClassName: 'modalStyle',
      title,
      width: 700,
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
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };

    return (
      <Modal
        {...modalProps}
      >
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row>
            <Col span={12}>
              <FormItem
                label="类目名称"
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  initialValue: cateModalData.name,
                  rules: [{ required: true, message: '请输入类别名称' }],
                })(
                  <Input placeholder="请输入类别名称" />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="选择父类目"
                {...formItemLayout}
              >
                {getFieldDecorator('pid', {
                  initialValue: pid,
                })(
                  <TreeSelect placeholder="留空则默认为顶级目录" treeData={tree} allowClear />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                label="排序号"
                {...formItemLayout}
              >
                {getFieldDecorator('seq', {
                  initialValue: cateModalData.seq,
                })(
                  <Input placeholder="请输入排序号" />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="状态"
                {...formItemLayout}
              >
                {getFieldDecorator('status', {
                  initialValue: toString(cateModalData.status, 'SELECT'),
                })(
                  <Select placeholder="请输入状态" allowClear>
                    <Option value="0">失效</Option>
                    <Option value="1">生效</Option>
                  </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(CategoryModal);
