import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Row, Col, Form, Modal, Popconfirm } from 'antd';

const FormItem = Form.Item;

@window.regStateCache
class AgencyType extends Component {

  constructor() {
    super();
    this.state = {
      visible: false,
      title: '-', // modal的title
    };
  }
  // 这里的提交是新增或修改 不是分页， TODO: 分页
  handleSubmit() {
    const { agencyTypeValues, dispatch } = this.props;
    this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (agencyTypeValues && Object.keys(agencyTypeValues).length > 0) {
        dispatch({
          type: 'agency/updateAgencyType',
          payload: { ...fieldsValue, id: agencyTypeValues.id, pageIndex: 1 },
        });
      } else {
        dispatch({
          type: 'agency/addAgencyType',
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
    this.setState({ visible });
    this.props.dispatch({
      type: 'agency/saveAgencyType',
      payload: {},
    }, () => {
      this._refreshData();
    });
  }

  handleQuery(record) {
    const p = this;
    p.setState({
      visible: true,
      title: '修改',
    }, () => {
      p.props.dispatch({
        type: 'agency/queryAgencyType',
        payload: { id: record.id },
      });
    });
  }

  handleDelete(record) {
    this.props.dispatch({
      type: 'agency/deleteAgencyType',
      payload: { id: record.id },
      cb() { this._refreshData(); },
    });
  }

  render() {
    const p = this;
    const { form, typeList = [], agencyTypeValues = {} } = p.props;
    const { getFieldDecorator } = form;
    const { title, visible } = p.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const columns = [
      { title: '类别名称', dataIndex: 'name', key: 'name' },
      { title: '类别代码', dataIndex: 'code', key: 'code' },
      { title: '备注', dataIndex: 'remark', key: 'remark' },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        render(t, r) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.handleQuery.bind(p, r)} style={{ marginRight: 10 }}>修改</a>
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
          <Col style={{ marginBottom: 10 }}>
            <Button type="primary" size="large" onClick={p.showModal.bind(p)}>新增类别</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columns}
              dataSource={typeList}
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
                initialValue: agencyTypeValues.name,
                rules: [{ required: true, message: '请输入类别名称' }],
              })(
                <Input placeholder="请输入类别名称" />,
              )}
            </FormItem>
            <FormItem
              label="类别代码"
              {...formItemLayout}
            >
              {getFieldDecorator('code', {
                initialValue: agencyTypeValues.code,
                rules: [{ required: true, message: '请输入类别代码' }],
              })(
                <Input placeholder="请输入类别代码" />,
              )}
            </FormItem>
            <FormItem
              label="备注"
              {...formItemLayout}
            >
              {getFieldDecorator('remark', {
                initialValue: agencyTypeValues.remark,
              })(
                <Input placeholder="请输入备注" />,
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { typeList, agencyTypeValues } = state.agency;
  return {
    agencyTypeValues,
    typeList,
  };
}

export default connect(mapStateToProps)(Form.create()(AgencyType));
