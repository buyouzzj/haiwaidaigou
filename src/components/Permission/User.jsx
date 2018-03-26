import React, { Component } from 'react';
import { Form, Table, Row, Col, Button, Modal, Input, Popconfirm, Select } from 'antd';
import { connect } from 'dva';

import check from '../../utils/checkLib';
import isNull from '../../utils/isNull';

const FormItem = Form.Item;
const Option = Select.Option;

@window.regStateCache
class Resource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '',
    };
  }
  handleSubmit() {
    const p = this;
    const { userModal = {}, dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.createTime) values.createTime = new Date(values.createTime).format('yyyy-MM-dd hh:mm:ss');
      if (userModal.id) {
        dispatch({ type: 'permission/updateUser', payload: { ...values, id: userModal.id } });
      } else {
        dispatch({ type: 'permission/addUser', payload: { ...values } });
      }
      p.handleCancel();
    });
  }
  handleCancel() {
    this.setState({ visible: false });
    this.props.form.resetFields();
  }
  showModal() {
    this.setState({ visible: true, title: '新增' });
  }
  handleQuery(r) {
    this.setState({ visible: true, title: '修改' });
    this.props.dispatch({ type: 'permission/queryUser', payload: { id: r.id } });
  }
  handleDelete(r) {
    this.props.dispatch({ type: 'permission/deleteUser', payload: { id: r.id } });
  }
  checkPhone(rules, value, cb) {
    if (!check.phone(value)) cb('请输入正确的手机号码');
    cb();
  }
  render() {
    const p = this;
    const { userList = [], total, form, userModal = {}, orgList = [], roleList = [] } = this.props;
    const { visible, title } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const _roleIds = [];
    if (userModal.rolesList) {
      userModal.rolesList.forEach((el) => {
        if (el && el.id) _roleIds.push(el.id.toString());
      });
    }
    const columns = [
      { title: '登录名', key: 'loginName', dataIndex: 'loginName' },
      { title: '姓名', key: 'name', dataIndex: 'name' },
      { title: '所属部门', key: 'organizationName', dataIndex: 'organizationName' },
      { title: '创建时间', key: 'createTime', dataIndex: 'createTime' },
      { title: '性别',
        key: 'sex',
        dataIndex: 'sex',
        render(t) {
          if (t === 1) return '男';
          return '女';
        },
      },
      { title: '年龄', key: 'age', dataIndex: 'age' },
      { title: '手机号', key: 'phone', dataIndex: 'phone' },
      { title: '角色',
        key: 'rolesList',
        dataIndex: 'rolesList',
        render(t) {
          const role = [];
          if (t && t[0]) {
            t.forEach((el) => {
              role.push(el.name);
            });
          }
          return role.join(', ');
        },
      },
      { title: '用户类型',
        key: 'userType',
        dataIndex: 'userType',
        render(t) {
          if (t === 0) return '管理员';
          return '用户';
        },
      },
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
              <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.handleQuery.bind(p, r)}>修改</a>
              <Popconfirm title="确定删除" onConfirm={p.handleDelete.bind(p, r)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    const paginationProps = {
      total,
      pageSize: 20,
      onChange(pageIndex) {
        p.props.dispatch({ type: 'permission/queryUserList', payload: { pageIndex } });
      },
    };

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col style={{ paddingBottom: '15px' }}>
            <Button type="primary" size="large" onClick={this.showModal.bind(this)}>增加用户</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table columns={columns} dataSource={userList} rowKey={r => r.id} pagination={paginationProps} bordered />
          </Col>
        </Row>
        <Modal
          visible={visible}
          width={600}
          title={title}
          onOk={this.handleSubmit.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <Form>
            <Row>
              <Col span={12}>
                <FormItem label="登录名" {...formItemLayout}>
                  {getFieldDecorator('loginName', {
                    rules: [{ required: true, message: '请输入登录名' }],
                    initialValue: userModal.loginName,
                  })(
                    <Input placeholder="请输入登录名" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="姓名" {...formItemLayout}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入姓名' }],
                    initialValue: userModal.name,
                  })(
                    <Input placeholder="请输入姓名" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="密码" {...formItemLayout}>
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: '请输入密码' }],
                    initialValue: userModal.password,
                  })(
                    <Input type="password" placeholder="请输入密码" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="性别" {...formItemLayout}>
                  {getFieldDecorator('sex', {
                    rules: [{ required: true, message: '请选择性别' }],
                    initialValue: !isNull(userModal.sex) ? userModal.sex.toString() : undefined,
                  })(
                    <Select placeholder="请选择性别" allowClear>
                      <Option value="1">男</Option>
                      <Option value="2">女</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="年龄" {...formItemLayout}>
                  {getFieldDecorator('age', {
                    rules: [{ required: true, message: '请输入年龄' }],
                    initialValue: userModal.age,
                  })(
                    <Input placeholder="请输入年龄" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="用户类别" {...formItemLayout}>
                  {getFieldDecorator('userType', {
                    rules: [{ required: true, message: '请输入用户类别' }],
                    initialValue: typeof (userModal.userType) === 'number' ? userModal.userType.toString() : undefined,
                  })(
                    <Select placeholder="请输入用户类别" allowClear>
                      <Option value="1">用户</Option>
                      <Option value="0">管理员</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="部门" {...formItemLayout}>
                  {getFieldDecorator('organizationId', {
                    rules: [{ required: true, message: '请选择部门' }],
                    initialValue: userModal.organizationId ? userModal.organizationId.toString() : undefined,
                  })(
                    <Select placeholder="请选择部门" allowClear>
                      {orgList.map(el => <Option key={el.id} value={el.id.toString()}>{el.name}</Option>)}
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="角色" {...formItemLayout}>
                  {getFieldDecorator('roleIds', {
                    rules: [{ required: true, message: '请选择角色' }],
                    initialValue: _roleIds,
                  })(
                    <Select placeholder="请选择角色" mode="multiple" allowClear>
                      {roleList.map(el => <Option key={el.id} value={el.id.toString()}>{el.name}</Option>)}
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="手机号" {...formItemLayout}>
                  {getFieldDecorator('phone', {
                    rules: [{ validator: this.checkPhone.bind(this) }],
                    initialValue: userModal.phone,
                  })(
                    <Input placeholder="请输入手机号" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="状态" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    rules: [{ required: true, message: '请选择状态' }],
                    initialValue: !isNull(userModal.status) ? userModal.status.toString() : undefined,
                  })(
                    <Select placeholder="请选择状态" allowClear>
                      <Option value="0">正常</Option>
                      <Option value="1">停用</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>);
  }
}

function mapStateToProps(state) {
  const { userList, userTotal, userModal, orgList, roleList } = state.permission;
  return { userList, total: userTotal, userModal, orgList, roleList };
}

export default connect(mapStateToProps)(Form.create()(Resource));
