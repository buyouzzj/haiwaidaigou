import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Row, Col, Select, Form, Popconfirm, Input } from 'antd';
import AgencyModal from './AgencyModal';

const FormItem = Form.Item;
const Option = Select.Option;

@window.regStateCache
class Agency extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      visible: false,
      title: '', // modal的title
    };
  }

  handleSubmit(e, page) {
    if (e) e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.props.dispatch({
        type: 'agency/queryAgencyList',
        payload: { ...fieldsValue, pageIndex: typeof page === 'number' ? page : 1 },
      });
    });
  }

  showModal() {
    this.setState({
      modalVisible: true,
      title: '新增',
    });
  }

  updateModal(id) {
    const p = this;
    p.setState({
      modalVisible: true,
      title: '修改',
    }, () => {
      p.props.dispatch({ type: 'agency/queryAgency', payload: { id } });
    });
  }

  closeModal(modalVisible) {
    this.setState({
      modalVisible,
    }, () => {
      this.props.dispatch({
        type: 'agency/saveAgency',
        payload: {},
      });
      this._refreshData();
    });
  }

  handleProDetail(record) {
    const p = this;
    p.setState({
      visible: true,
    }, () => {
      p.props.dispatch({
        type: 'order/queryOrder',
        payload: { id: record.id, type: 'snip' },
      });
    });
  }

  handleDelete(id) {
    const p = this;
    const { currentPage, dispatch, list = [] } = this.props;
    dispatch({
      type: 'agency/deleteAgency',
      payload: { id },
      cb() {
        if (list.length < 2 && currentPage > 1) {
          p.handleSubmit(null, currentPage - 1);
        } else p.handleSubmit(null, currentPage);
      },
    });
  }

  render() {
    const p = this;
    const { form, list = [], typeList = [], total, currentPage, agencyValues = {}, dispatch } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { title } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '用户名称', dataIndex: 'name', key: 'name', render(text) { return text || '-'; } },
      { title: '销售类别名称', dataIndex: 'typeName', key: 'typeName', render(text) { return text || '-'; } },
      { title: '创建时间', dataIndex: 'gmtCreate', key: 'gmtCreate', render(text) { return text || '-'; } },
      { title: '修改时间', dataIndex: 'gmtModify', key: 'gmtModify', render(text) { return text || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 200,
        render(text, record) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.updateModal.bind(p, record.id)}>修改</a>
              <Popconfirm title="确定删除此销售？" onConfirm={p.handleDelete.bind(p, record.id)}>
                <a href="javascript:void(0)" style={{ marginLeft: 10 }}>删除</a>
              </Popconfirm>
            </div>);
        },
      },
    ];

    const listPaginationProps = {
      total,
      current: currentPage,
      pageSize: 20,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
    };

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="用户名称"
                {...formItemLayout}
              >
                {getFieldDecorator('userName', {})(
                  <Input placeholder="请输入用户名称" />,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="销售类别名称"
                {...formItemLayout}
              >
                {getFieldDecorator('typeId', {})(
                  <Select placeholder="请选择销售类别名称" allowClear>
                    {list.map((el, index) => <Option key={index} value={el.typeId && el.typeId.toString()}>{el.typeName}</Option>)}
                  </Select>,
                )}
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
        <Row>
          <Col className="operBtn">
            <Button type="primary" size="large" onClick={p.showModal.bind(p)}>新增销售</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={list}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={listPaginationProps}
            />
          </Col>
        </Row>
        <AgencyModal
          visible={this.state.modalVisible}
          list={typeList}
          close={this.closeModal.bind(this)}
          modalValues={agencyValues}
          title={title}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { list, currentPage, typeList, total, agencyValues } = state.agency;
  return {
    list,
    typeList,
    currentPage,
    total,
    agencyValues,
  };
}

export default connect(mapStateToProps)(Form.create()(Agency));
