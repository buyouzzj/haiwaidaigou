import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, DatePicker, Button, Row, Col, Select, Form, Popconfirm, Popover, Modal } from 'antd';
import PurchaseModal from './PurchaseModal';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@window.regStateCache
class Purchase extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      title: '', // modal的title
      taskDailyIds: [],
    };
  }

  handleSubmit(e, page, pageSize) {
    const p = this;
    const { currentPageSize } = this.props;
    if (e) e.preventDefault();
    p.setState({ taskDailyIds: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
        if (err) return;
        if (fieldsValue.taskStart && fieldsValue.taskStart[0] && fieldsValue.taskStart[1]) {
          fieldsValue.taskStart1 = new Date(fieldsValue.taskStart[0]).format('yyyy-MM-dd');
          fieldsValue.taskStart2 = new Date(fieldsValue.taskStart[1]).format('yyyy-MM-dd');
        }
        if (fieldsValue.taskEnd && fieldsValue.taskEnd[0] && fieldsValue.taskEnd[1]) {
          fieldsValue.taskEnd1 = new Date(fieldsValue.taskEnd[0]).format('yyyy-MM-dd');
          fieldsValue.taskEnd2 = new Date(fieldsValue.taskEnd[1]).format('yyyy-MM-dd');
        }
        delete fieldsValue.taskStart;
        delete fieldsValue.taskEnd;
        this.props.dispatch({
          type: 'purchase/queryPurchaseList',
          payload: {
            ...fieldsValue,
            pageIndex: typeof page === 'number' ? page : 1,
            pageSize: pageSize || currentPageSize,
          },
        });
      });
    });
  }

  showModal() {
    this.setState({
      modalVisible: true,
      title: '新增',
    });
  }

  updateModal(id, e) {
    if (e) e.stopPropagation();
    const p = this;
    p.setState({
      modalVisible: true,
      title: '修改',
    }, () => {
      p.props.dispatch({ type: 'purchase/queryPurchase', payload: { id } });
    });
  }

  closeModal() {
    this.setState({ modalVisible: false }, () => {
      this.props.dispatch({
        type: 'purchase/savePurchase',
        payload: {},
      });
      this._refreshData();
    });
  }

  handleDelete(record) {
    const p = this;
    const { list = [], currentPage, dispatch } = this.props;
    dispatch({
      type: 'purchase/deletePurchase',
      payload: { id: record.id },
      cb() {
        if (list.length < 2 && currentPage > 1) {
          p.handleSubmit(null, currentPage - 1);
        } else p.handleSubmit(null, currentPage);
      },
    });
  }

  exportPurchase(id) { // 导出采购单
    this.props.dispatch({
      type: 'purchase/exportPurchase',
      payload: { id },
    });
  }

  handlePurchaseAction(type) {
    const p = this;
    const { currentPage, currentPageSize } = this.props;
    const { taskDailyIds } = this.state;
    switch (type) {
      case 'finish':
        Modal.confirm({
          title: '完成采购',
          content: '确定完成采购？',
          onOk() {
            p.props.dispatch({
              type: 'purchase/finishTaskDaily',
              payload: { taskDailyIds: JSON.stringify(taskDailyIds) },
              cb() { p.handleSubmit(null, currentPage, currentPageSize); },
            });
          },
        });
        break;
      case 'close':
        Modal.confirm({
          title: '取消采购',
          content: '确定取消采购？',
          onOk() {
            p.props.dispatch({
              type: 'purchase/closeTaskDaily',
              payload: { taskDailyIds: JSON.stringify(taskDailyIds) },
              cb() { p.handleSubmit(null, currentPage, currentPageSize); },
            });
          },
        });
        break;
      case 'create':
        this.props.dispatch({
          type: 'purchase/createByOrder',
          payload: {},
          cb() {
            p.handleSubmit();
          },
        });
        break;
      default: return false;
    }
  }

  render() {
    const p = this;
    const { form, list = [], currentPage, total, purchaseValues = {}, buyer = [], dispatch, loginRoler} = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { title } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '任务单号', dataIndex: 'taskOrderNo', key: 'taskOrderNo', width: 150 },
      { title: '任务名称', dataIndex: 'taskTitle', key: 'taskTitle', width: 100 },
      { title: '任务描述', dataIndex: 'taskDesc', key: 'taskDesc', width: 100 },
      { title: '买手', dataIndex: 'buyerName', key: 'buyerName', width: 60, render(text) { return text || '-'; } },
      { title: '图片',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        width: 80,
        render(text) {
          if (!text) return '-';
          const picList = JSON.parse(text).picList;
          const t = picList.length ? picList[0].url : '';
          return (
            t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
              <img role="presentation" src={t} width={60} height={60} />
            </Popover> : '-'
          );
        },
     },
      { title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 60,
        render(t) {
          switch (t) {
            case 0: return <font color="">采购中</font>;
            case 1: return <font color="blue">已完成</font>;
            case -1: return <font color="red">已取消</font>;
            default: return '-';
          }
        },
      },
      { title: '任务开始时间', dataIndex: 'taskStartTime', key: 'taskStartTime', width: 120, render(t) { return t ? t.split(' ')[0] : '-'; } },
      { title: '任务结束时间', dataIndex: 'taskEndTime', key: 'taskEndTime', width: 120, render(t) { return t ? t.split(' ')[0] : '-'; } },
      { title: '备注', dataIndex: 'remark', key: 'remark', width: 100, render(text) { return text || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 160,
        render(t, r) {
        		if(p.props.loginRoler) {
				return (
	            <div>
	              <a href="javascript:void(0)" onClick={p.exportPurchase.bind(p, r.id)}>导出</a>
	           </div>);
            	} else {
            		return (
	            <div>
	              <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.updateModal.bind(p, r.id)}>修改</a>
	              <Popconfirm title="确认删除？" onConfirm={p.handleDelete.bind(p, r)} >
	                <a style={{ marginRight: 10 }} href="javascript:void(0)" >删除</a>
	              </Popconfirm>
	              <a href="javascript:void(0)" onClick={p.exportPurchase.bind(p, r.id)}>导出</a>
	           </div>);
            	}
        },
      },
    ];

    const paginationProps = {
      total,
      current: currentPage,
      pageSize: 20,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
    };

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const listId = [];
        selectedRows.forEach((el) => {
          listId.push(el.id);
        });
        p.setState({ taskDailyIds: listId });
      },
      selectedRowKeys: p.state.taskDailyIds,
    };

    const isNotSelected = this.state.taskDailyIds.length === 0;

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="任务单号"
                {...formItemLayout}
              >
                {getFieldDecorator('taskOrderNo', {})(
                  <Input placeholder="请输入任务单号" />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="任务名称"
                {...formItemLayout}
              >
                {getFieldDecorator('taskTitle', {})(
                  <Input placeholder="请输入任务名称" />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="买手"
                {...formItemLayout}
              >
                {getFieldDecorator('buyerId', {})(
                  <Select placeholder="请选择用户" optionLabelProp="title" combobox>
                    {buyer.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800, marginLeft: -6 }}>
            <Col>
              <FormItem
                label="开始时间范围"
                {...formItemLayout}
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('taskStart')(<RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800, marginLeft: -6 }}>
            <Col>
              <FormItem
                label="结束时间范围"
                {...formItemLayout}
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('taskEnd')(<RangePicker />)}
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
        {p.props.loginRoler ? 
        		<Row className="operBtn">
	          <Button style={{ float: 'right', marginLeft: 10 }} type="primary" size="large" disabled={isNotSelected} onClick={p.handlePurchaseAction.bind(p, 'finish')}>完成采购</Button>
	          <Button style={{ float: 'right', marginLeft: 10 }} size="large" disabled={isNotSelected} onClick={p.handlePurchaseAction.bind(p, 'close')}>取消采购</Button>
	        </Row>
        		:
        		<Row className="operBtn">
	          <Button style={{ float: 'left' }} type="primary" size="large" onClick={p.showModal.bind(p)}>新增采购</Button>
	          <Button style={{ float: 'right', marginLeft: 10 }} type="primary" size="large" disabled={isNotSelected} onClick={p.handlePurchaseAction.bind(p, 'finish')}>完成采购</Button>
	          <Button style={{ float: 'right', marginLeft: 10 }} size="large" disabled={isNotSelected} onClick={p.handlePurchaseAction.bind(p, 'close')}>取消采购</Button>
	          <Button style={{ float: 'right', marginLeft: 10 }} size="large" onClick={p.handlePurchaseAction.bind(p, 'create')}>根据当前订单生成采购任务</Button>
	        </Row>
        	}
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={list}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={paginationProps}
              rowSelection={rowSelection}
            />
          </Col>
        </Row>
        <PurchaseModal
          visible={this.state.modalVisible}
          close={this.closeModal.bind(this)}
          modalValues={purchaseValues}
          title={title}
          buyer={buyer}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { list, total, currentPage, currentPageSize, purchaseValues, buyer, loginRoler} = state.purchase;
  return {
    list,
    total,
    currentPage,
    currentPageSize,
    purchaseValues,
    buyer,
    loginRoler
  };
}

export default connect(mapStateToProps)(Form.create()(Purchase));
