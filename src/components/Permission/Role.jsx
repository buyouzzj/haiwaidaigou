import React, { Component } from 'react';
import { Form, Table, Row, Col, Button, Modal, Input, Popconfirm, message } from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;

@window.regStateCache
class Role extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '',
      authModalVisible: false, // 授权的modal
      roleId: '', // 授权要传的角色id
      resourceIds: [], // 授权要传的资源ID
    };
  }
  handleSubmit() {
    const p = this;
    const { roleModal = {}, dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (roleModal.id) {
        dispatch({ type: 'permission/updateRole', payload: { ...values, id: roleModal.id } });
      } else {
        dispatch({ type: 'permission/addRole', payload: { ...values } });
      }
      p.handleCancel();
    });
  }
  handleCancel() {
    this.setState({ visible: false });
    this.props.form.resetFields();
  }
  showModal(type, r) {
    switch (type) {
      case 'add':
        this.setState({ visible: true, title: '新增' }); break;
      case 'update':
        this.setState({ visible: true, title: '修改' });
        this.props.dispatch({ type: 'permission/queryRole', payload: { id: r.id } });
        break;
      default: return false;
    }
  }
  handleDelete(r) {
    this.props.dispatch({ type: 'permission/deleteRole', payload: { id: r.id } });
  }
  showAuthModal(r) {
    this.props.dispatch({ type: 'permission/queryResourceList', payload: {} });
    this.setState({ authModalVisible: true, roleId: r.id });
  }
  handleAuth() {
    const { roleId, resourceIds } = this.state;
    if (!resourceIds.length) {
      message.error('请选择需要授权的资源');
      return;
    }
    this.props.dispatch({
      type: 'permission/authRole',
      payload: { id: roleId, resourceIds: JSON.stringify(resourceIds) },
    });
    this.setState({ authModalVisible: false });
  }
  render() {
    const p = this;
    const { resourceList = [], roleList = [], total, form, roleModal = {} } = this.props;
    const { visible, title, authModalVisible } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 },
    };
    const columns = [
      { title: '角色id', key: 'id', dataIndex: 'id' },
      { title: '角色名称', key: 'name', dataIndex: 'name' },
      { title: '排序', key: 'seq', dataIndex: 'seq' },
      { title: '角色介绍', key: 'description', dataIndex: 'description' },
      { title: '状态',
        key: 'status',
        dataIndex: 'status',
        render(t) {
          if (t === 0) return '正常';
          return '停用';
        },
      },
      { title: '操作',
        key: 'oper',
        dataIndex: 'oper',
        render(t, r) {
          return (
            <div>
              <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.showModal.bind(p, 'update', r)}>修改</a>
              <Popconfirm title="确定删除" onConfirm={p.handleDelete.bind(p, r)}>
                <a href="javascript:void(0)" style={{ marginRight: 10 }} >删除</a>
              </Popconfirm>
              <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.showAuthModal.bind(p, r)}>授权</a>
            </div>
          );
        },
      },
    ];
    const authColumns = [
      { title: '系统资源', key: 'name', dataIndex: 'name' },
    ];
    const paginationProps = {
      total,
      pageSize: 20,
      onChange(pageIndex) {
        p.props.dispatch({ type: 'permission/queryRoleList', payload: { pageIndex } });
      },
    };
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        const checkId = [];
        selectedRows.forEach((el) => {
          checkId.push(el.id);
        });
        p.setState({ resourceIds: checkId });
      },
    };
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col style={{ paddingBottom: '15px' }}>
            <Button type="primary" size="large" onClick={this.showModal.bind(this, 'add')}>增加角色</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table columns={columns} dataSource={roleList} rowKey={r => r.id} pagination={paginationProps} bordered />
          </Col>
        </Row>
        <Modal
          visible={visible}
          title={title}
          onOk={this.handleSubmit.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <Form>
            <Row>
              <Col>
                <FormItem label="角色名称" {...formItemLayout}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入角色名称' }],
                    initialValue: roleModal.name,
                  })(
                    <Input placeholder="请输入角色名称" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="排序" {...formItemLayout}>
                  {getFieldDecorator('seq', {
                    rules: [{ required: true, message: '请输入排序' }],
                    initialValue: roleModal.seq,
                  })(
                    <Input placeholder="请输入排序" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="状态" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    rules: [{ required: true, message: '请输入状态' }],
                    initialValue: roleModal.status,
                  })(
                    <Input placeholder="请输入状态" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="角色介绍" {...formItemLayout}>
                  {getFieldDecorator('description', {
                    initialValue: roleModal.description,
                  })(
                    <Input placeholder="请输入角色介绍" />,
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Modal
          visible={authModalVisible}
          title="授权"
          onOk={this.handleAuth.bind(this)}
          onCancel={() => this.setState({ authModalVisible: false })}
        >
          <Table
            columns={authColumns}
            dataSource={resourceList}
            rowSelection={rowSelection}
            rowKey={r => r.id}
            pagination={false}
            bordered
          />
        </Modal>
      </div>);
  }
}

function mapStateToProps(state) {
  const { roleList, roleTotal, roleModal, resourceList } = state.permission;
  return { roleList, total: roleTotal, roleModal, resourceList };
}

export default connect(mapStateToProps)(Form.create()(Role));
