import React, { Component } from 'react';
import { Form, Table, Row, Col, Button, Modal, Input, Popconfirm, Select, TreeSelect } from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;
const { Option } = Select;

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
    const { resourceModal = {}, dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.createTime) values.createTime = new Date(values.createTime).format('yyyy-MM-dd hh:mm:ss');
      if (resourceModal.id) {
        dispatch({ type: 'permission/updateResource', payload: { ...values, id: resourceModal.id } });
      } else {
        dispatch({ type: 'permission/addResource', payload: { ...values } });
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
        this.props.dispatch({ type: 'permission/queryResource', payload: { id: r.id } });
        break;
      default: return false;
    }
  }
  handleDelete(r) {
    this.props.dispatch({ type: 'permission/deleteResource', payload: { id: r.id } });
  }
  render() {
    const p = this;
    const { resourceList = [], resourceExpandedKeys, form, resourceModal = {} } = this.props;
    const { visible, title } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const columns = [
      { title: '资源名称', key: 'name', dataIndex: 'name' },
      { title: '资源路径', key: 'url', dataIndex: 'url' },
      { title: '打开方式', key: 'openMode', dataIndex: 'openMode' },
      { title: '排序', key: 'seq', dataIndex: 'seq' },
      { title: '图标', key: 'iconCls', dataIndex: 'iconCls' },
      { title: '资源类型',
        key: 'resourceType',
        dataIndex: 'resourceType',
        render(t) {
          if (t === 0) return '菜单';
          else if (t === 1) return '按钮';
        },
      },
      { title: '资源编码', key: 'resCode', dataIndex: 'resCode' },
      { title: '状态',
        key: 'status',
        dataIndex: 'status',
        render(t) {
          return t === 0 ? '正常' : '停用';
        },
      },
      { title: '操作',
        key: 'oper',
        dataIndex: 'oper',
        render(t, r) {
          return (
            <div>
              <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.showModal.bind(p, 'update', r)}>修改</a>
              <Popconfirm title="确定删除？" onConfirm={p.handleDelete.bind(p, r)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col style={{ paddingBottom: '15px' }}>
            <Button type="primary" size="large" onClick={this.showModal.bind(this, 'add')}>增加资源</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columns}
              dataSource={resourceList}
              rowKey={r => r.id}
              pagination={false}
              expandedRowKeys={resourceExpandedKeys}
              bordered
            />
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
                <FormItem label="资源名称" {...formItemLayout}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入资源名称' }],
                    initialValue: resourceModal.name,
                  })(
                    <Input placeholder="请输入资源名称" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="资源类型" {...formItemLayout}>
                  {getFieldDecorator('resourceType', {
                    rules: [{ required: true, message: '请输入资源类型' }],
                    initialValue: typeof (resourceModal.resourceType) === 'number' ? resourceModal.resourceType.toString() : undefined,
                  })(
                    <Select placeholder="请输入资源类型" allowClear>
                      <Option key="0" value="0">菜单</Option>
                      <Option key="1" value="1">按钮</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="资源路径" {...formItemLayout}>
                  {getFieldDecorator('url', {
                    initialValue: resourceModal.url,
                  })(
                    <Input placeholder="请输入资源路径" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="打开方式" {...formItemLayout}>
                  {getFieldDecorator('openMode', {
                    initialValue: resourceModal.openMode || undefined,
                  })(
                    <Select placeholder="请选择打开方式" allowClear>
                      <Option key="ajax" value="ajax">ajax</Option>
                      <Option key="iframe" value="iframe">iframe</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="资源图标" {...formItemLayout}>
                  {getFieldDecorator('iconCls', {
                    initialValue: resourceModal.iconCls,
                  })(
                    <Input placeholder="请输入资源图标" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="排序" {...formItemLayout}>
                  {getFieldDecorator('seq', {
                    rules: [{ required: true, message: '请输入排序' }],
                    initialValue: resourceModal.seq,
                  })(
                    <Input placeholder="请输入排序" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="状态" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    rules: [{ required: true, message: '请输入状态' }],
                    initialValue: typeof (resourceModal.status) === 'number' ? resourceModal.status.toString() : undefined,
                  })(
                    <Select placeholder="请输入状态" allowClear>
                      <Option key="0" value="0">正常</Option>
                      <Option key="1" value="1">停用</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="资源编码" {...formItemLayout}>
                  {getFieldDecorator('code', {
                    initialValue: resourceModal.code,
                  })(
                    <Input placeholder="请输入资源编码" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="父级资源" {...formItemLayout}>
                  {getFieldDecorator('pid', {
                    initialValue: (resourceModal.pid && resourceModal.pid.toString()) || undefined,
                  })(
                    <TreeSelect
                      placeholder="请输入父级资源"
                      treeData={resourceList}
                    />,
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
  const { resourceList, resourceExpandedKeys, resourceModal } = state.permission;
  return { resourceList, resourceExpandedKeys, resourceModal };
}

export default connect(mapStateToProps)(Form.create()(Resource));
