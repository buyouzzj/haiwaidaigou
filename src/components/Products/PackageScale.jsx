import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Row, Col, Form, Modal, Popconfirm } from 'antd';
import styles from './Products.less';

const FormItem = Form.Item;

@window.regStateCache
class PackageScale extends Component {

  constructor() {
    super();
    this.state = {
      visible: false,
      title: '', // modal的title
    };
  }

  handleSubmit() {
    const { scaleValues, dispatch } = this.props;
    this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (scaleValues.data) {
        dispatch({
          type: 'pack/updatePackageScale',
          payload: { ...fieldsValue, id: scaleValues.data.id, pageIndex: 1 },
        });
      } else {
        dispatch({
          type: 'pack/addPackageScale',
          payload: { ...fieldsValue, pageIndex: 1 },
        });
      }
      this.closeModal(false);
    });
  }

  showModal() {
    this.setState({ visible: true, title: '新增' });
  }

  closeModal(visible) {
    this.setState({
      visible,
    });
    this.props.dispatch({
      type: 'pack/saveScale',
      payload: {},
    });
  }

  handleQuery(record) {
    const p = this;
    p.setState({
      visible: true,
    }, () => {
      p.props.dispatch({
        type: 'pack/queryPackageScale',
        payload: { id: record.id },
      });
    });
  }

  handleDelete(record) {
    this.props.dispatch({
      type: 'pack/deletePackageScale',
      payload: { id: record.id },
    });
  }

  render() {
    const p = this;
    const { form, scaleList = [], scaleValues = {} } = p.props;
    const modalValues = scaleValues.data || {};
    const { getFieldDecorator } = form;
    const { title, visible } = p.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const columns = [
      { title: '包装类别名称', dataIndex: 'name', key: 'name' },
      { title: '包装类别英文名称', dataIndex: 'enName', key: 'enName' },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        render(t, r) {
          return (
            <div className={styles.operation}>
              <a href="javascript:void(0)" onClick={p.handleQuery.bind(p, r)}>修改</a>
              <Popconfirm title="确定删除此类别？" onConfirm={p.handleDelete.bind(p, r)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    const modalProps = {
      title,
      visible,
      closable: true,
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal(false);
      },
    };

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col className={styles.productModalBtn}>
            <Button type="primary" size="large" onClick={p.showModal.bind(p)}>新增类别</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columns}
              dataSource={scaleList}
              bordered
              size="large"
              rowKey={record => record.id}
            />
          </Col>
        </Row>
        <Modal {...modalProps}>
          <Form>
            <FormItem
              label="类别名称"
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                initialValue: modalValues.name,
                rules: [{ required: true, message: '请输入类别名称' }],
              })(
                <Input placeholder="请输入类别名称" />,
              )}
            </FormItem>
            <FormItem
              label="类别英文名称"
              {...formItemLayout}
            >
              {getFieldDecorator('enName', {
                initialValue: modalValues.enName,
                rules: [{ required: true, message: '请输入类别英文名称' }],
              })(
                <Input placeholder="请输入类别英文名称" />,
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { scaleList, scaleValues } = state.pack;
  return {
    scaleValues,
    scaleList,
  };
}

export default connect(mapStateToProps)(Form.create()(PackageScale));
