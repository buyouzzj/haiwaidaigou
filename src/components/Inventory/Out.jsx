import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Row, Col, Button, Select, Input, DatePicker, Popconfirm } from 'antd';

import OutModal from './components/OutModal';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@window.regStateCache
class Out extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
    };
  }
  handleSubmit(e, page) {
    if (e) e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.outTime) {
        values.startGmt = new Date(values.outTime[0]).format('yyyy-MM-dd');
        values.endGmt = new Date(values.outTime[1]).format('yyyy-MM-dd');
      }
      delete values.outTime;
      dispatch({
        type: 'inventory/queryOutList',
        payload: {
          ...values,
          page: typeof page === 'number' ? page : 1,
        },
      });
    });
  }
  showModal(type, r) {
    switch (type) {
      case 'add': this.setState({ visible: true }); break;
      case 'update':
        this.setState({ visible: true }, () => {
          this.props.dispatch({
            type: 'inventory/queryOut',
            payload: { id: r.id },
          });
        });
        break;
      default: return false;
    }
  }
  closeModal() {
    this.props.dispatch({
      type: 'inventory/saveOut',
      payload: {},
    });
    this.handleSubmit();
    this.setState({ visible: false });
  }
  handleDelete(r) {
    const p = this;
    this.props.dispatch({
      type: 'inventory/deleteOut',
      payload: { id: r.id },
      cb() { p.handleSubmit(); },
    });
  }
  render() {
    const p = this;
    const { list = [], total, form, wareList = [], currentPage, outValues } = this.props;
    const { getFieldDecorator, resetFields } = form;
    const { visible } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columns = [
      { title: '出库单ID', key: 'invOutNo', dataIndex: 'invOutNo', width: 100 },
      { title: '仓库名称', key: 'warehouseName', dataIndex: 'warehouseName', width: 100 },
      { title: '状态',
        key: 'status',
        dataIndex: 'status',
        width: 80,
        render(t) {
          switch (t) {
            case 0: return <font color="red" >未出库</font>;
            case 1: return <font color="blue" >已出库</font>;
            default: return false;
          }
        },
      },
      { title: '创建者', key: 'userCreate', dataIndex: 'userCreate', width: 80 },
      { title: '修改者', key: 'userModify', dataIndex: 'userModify', width: 80 },
      { title: '修改时间', key: 'gmtModify', dataIndex: 'gmtModify', width: 80 },
      { title: '描述', key: 'remark', dataIndex: 'remark', width: 80 },
      { title: '操作',
        key: 'oper',
        width: 80,
        render(text, record) {
          return (
            <div>
              <a onClick={p.showModal.bind(p, 'update', record)} style={{ marginRight: 10 }}>修改</a>
              <Popconfirm onConfirm={p.handleDelete.bind(p, record)} title="确认删除？">
                <a style={{ marginRight: 10 }}>删除</a>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    const paginationProps = {
      total,
      pageSize: 20,
      current: currentPage,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
    };
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={p.handleSubmit.bind(p)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="仓库"
                {...formItemLayout}
              >
                {getFieldDecorator('warehouseId', {})(
                  <Select placeholder="请选择仓库" optionLabelProp="title" allowClear>
                    {wareList.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="出库单号"
                {...formItemLayout}
              >
                {getFieldDecorator('invOutNo', {})(
                  <Input placeholder="请输入" />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col style={{ marginLeft: 6 }}>
              <FormItem
                label="创建时间范围"
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('outTime', {})(<RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => { resetFields(); }}>清空</Button>
            </Col>
          </Row>
        </Form>
        <Row className="operBtn">
          <Button type="primary" size="large" onClick={p.showModal.bind(p, 'add')}>新增出库单</Button>
        </Row>
        <Row>
          <Col>
            <Table
              bordered
              dataSource={list}
              columns={columns}
              pagination={paginationProps}
              rowKey={record => record.id}
              scroll={{ y: 500 }}
            />
          </Col>
        </Row>
        <OutModal
          visible={visible}
          close={this.closeModal.bind(this)}
          data={outValues}
        />
      </div>);
  }
}

function mapStateToProps(state) {
  const { outList, outTotal, wareList, outCurrent, outValues } = state.inventory;
  return { list: outList, total: outTotal, wareList, currentPage: outCurrent, outValues };
}

export default connect(mapStateToProps)(Form.create()(Out));
