import React, { Component } from 'react';
import { Form, Table, Row, Col, Button, Modal, Input, Popconfirm } from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;

@window.regStateCache
class Warehouse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '',
    };
  }
  // TODO: 分页
  handleSubmit() {
    const p = this;
    const { modalValues = {}, dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (modalValues.data) {
        dispatch({ type: 'inventory/updateWare', payload: { ...values, id: modalValues.data.id } });
      } else {
        dispatch({ type: 'inventory/addWare', payload: { ...values } });
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
    this.props.dispatch({ type: 'inventory/queryWare', payload: { id: r.id } });
  }
  handleDelete(r) {
    this.props.dispatch({ type: 'inventory/deleteWare', payload: { id: r.id } });
  }
  render() {
    const p = this;
    const { wareList = [], total, form, modalValues = {} } = this.props;
    const { visible, title } = this.state;
    const { getFieldDecorator } = form;
    const columns = [
      { title: '仓库名称', key: 'name', dataIndex: 'name' },
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
      total : 0,
      pageSize: 20,
    };
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col style={{ paddingBottom: '15px' }}>
            <Button type="primary" size="large" onClick={this.showModal.bind(this)}>增加仓库</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table columns={columns} bordered dataSource={wareList} rowKey={record => record.id} pagination={paginationProps} />
          </Col>
        </Row>
        <Modal
          visible={visible}
          title={title}
          onOk={this.handleSubmit.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <Form>
            <FormItem label="仓库名称" labelCol={{ span: 6 }} wrapperCol={{ span: 10 }}>
              {getFieldDecorator('name', {
                initialValue: modalValues.name || undefined,
              })(
                <Input placeholder="请输入仓库名" />,
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>);
  }
}

function mapStateToProps(state) {
  const { wareList, total, modalValues } = state.inventory;
  return { wareList, total, modalValues };
}

export default connect(mapStateToProps)(Form.create()(Warehouse));
