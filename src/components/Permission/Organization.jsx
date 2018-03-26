import React, { Component } from 'react';
import { Form, Table, Row, Col, Button, Modal, Input, InputNumber, Popconfirm, Select } from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;
const Option = Select.Option;

@window.regStateCache
class Organization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '',
    };
  }
  handleSubmit() {
    const p = this;
    const { orgModal = {}, dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.createTime) values.createTime = new Date(values.createTime).format('yyyy-MM-dd hh:mm:ss');
      if (orgModal.data) {
        dispatch({ type: 'permission/updateOrg', payload: { ...values, id: orgModal.data.id } });
      } else {
        dispatch({ type: 'permission/addOrg', payload: { ...values } });
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
    this.props.dispatch({ type: 'permission/queryOrg', payload: { id: r.id } });
  }
  handleDelete(r) {
    this.props.dispatch({ type: 'permission/deleteOrg', payload: { id: r.id } });
  }
  render() {
    const p = this;
    const { orgList = [], total, form, orgModal = {} } = this.props;
    const { visible, title } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 },
    };
    const columns = [
      { title: '编号', key: 'code', dataIndex: 'code' },
      { title: '部门名称', key: 'name', dataIndex: 'name' },
      { title: '排序', key: 'seq', dataIndex: 'seq' },
      { title: '图标', key: 'iconCls', dataIndex: 'iconCls' },
      { title: '创建时间', key: 'createTime', dataIndex: 'createTime' },
      { title: '地址', key: 'address', dataIndex: 'address' },
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
        p.props.dispatch({ type: 'permission/queryOrgList', payload: { pageIndex } });
      },
    };
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col style={{ paddingBottom: '15px' }}>
            <Button type="primary" size="large" onClick={this.showModal.bind(this)}>增加部门</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table columns={columns} dataSource={orgList} rowKey={r => r.id} pagination={paginationProps} bordered />
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
                <FormItem label="部门名称" {...formItemLayout}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入部门名称' }],
                    initialValue: orgModal.name,
                  })(
                    <Input placeholder="请输入部门名称" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="编号" {...formItemLayout}>
                  {getFieldDecorator('code', {
                    rules: [{ required: true, message: '请输入编号' }],
                    initialValue: orgModal.code,
                  })(
                    <Input placeholder="请输入编号" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="排序" {...formItemLayout}>
                  {getFieldDecorator('seq', {
                    rules: [{ required: true, message: '请输入排序' }],
                    initialValue: orgModal.seq,
                  })(
                    <InputNumber placeholder="请输入排序" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="图标" {...formItemLayout}>
                  {getFieldDecorator('iconCls', {
                    initialValue: orgModal.iconCls,
                  })(
                    <Input placeholder="请输入图标" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="地址" {...formItemLayout}>
                  {getFieldDecorator('address', {
                    initialValue: orgModal.address,
                  })(
                    <Input placeholder="请输入地址" />,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem label="上级部门" {...formItemLayout}>
                  {getFieldDecorator('pid', {
                    initialValue: orgModal.pid ? orgModal.pid.toString() : undefined,
                  })(
                    <Select placeholder="请选择上级部门" allowClear>
                      {orgList.map(el => <Option key={el.id} value={el.id.toString()}>{el.name}</Option>)}
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
  const { orgList, orgTotal, orgModal } = state.permission;
  return { orgList, total: orgTotal, orgModal };
}

export default connect(mapStateToProps)(Form.create()(Organization));
