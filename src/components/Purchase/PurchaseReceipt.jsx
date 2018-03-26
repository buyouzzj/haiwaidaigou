import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, DatePicker, Button, Row, Col, Select, Form, Popconfirm, Popover, Modal } from 'antd';
import PurchaseModal from './PurchaseModal';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@window.regStateCache
class PurchaseReceipt extends Component {

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
        if (fieldsValue.gmtCreate && fieldsValue.gmtCreate[0] && fieldsValue.gmtCreate[1]) {
          fieldsValue.startGmtCreate = new Date(fieldsValue.gmtCreate[0]).format('yyyy-MM-dd');
          fieldsValue.endGmtCreate = new Date(fieldsValue.gmtCreate[1]).format('yyyy-MM-dd');
        }
        delete fieldsValue.gmtCreate;
        this.props.dispatch({
          type: 'purchase/purchaseReceiptList',
          payload: {
            ...fieldsValue,
            pageIndex: typeof page === 'number' ? page : 1,
            pageSize: pageSize || currentPageSize,
          },
        });
      });
    });
  }
  render() {
    const p = this;
    const { form, receiptList = [], receiptcurrentPage, total, receiptTotal, purchaseValues = {}, buyer = [], dispatch } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { title } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '小票单号', dataIndex: 'receiptNo', key: 'receiptNo', width: 150 },
      { title: '任务名称', dataIndex: 'taskTitle', key: 'taskTitle', width: 150 },
      { title: '线下数量', dataIndex: 'quantity', key: 'quantity', width: 150 },
      { title: '在途数量', dataIndex: 'transQuantity', key: 'transQuantity', width: 150 },
      { title: '线下总价', dataIndex: 'totalPrice', key: 'totalPrice', width: 100 },
      { title: '在途总价', dataIndex: 'transTotalPrice', key: 'transTotalPrice', width: 100 },
      { title: '生成时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 130, render(text) { return text ? text : '-'; } },
    ];

    const paginationProps = {
      total:receiptTotal,
      current: receiptcurrentPage,
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
                label="小票单号"
                {...formItemLayout}
              >
                {getFieldDecorator('receiptNo', {})(
                  <Input placeholder="请输入小票单号" />)}
              </FormItem>
            </Col>
            <Col span="16">
              <FormItem
                label="小票时间范围"
                {...formItemLayout}
                labelCol={{ span: 8 }}
              >
                {getFieldDecorator('gmtCreate')(<RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => { resetFields(); }}>清空</Button>
            </Col>
          </Row>
          <Row>
          	　
          </Row>
        </Form>
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={receiptList}
              bordered
              size="large"
              rowKey={record => record.receiptNo}
              pagination={paginationProps}
            />
          </Col>
        </Row>
        <PurchaseModal
          visible={this.state.modalVisible}
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
  const {receiptcurrentPageSize, receiptcurrentPage,purchaseValues,receiptList,receiptTotal} = state.purchase;
  return {
    receiptList,
    receiptTotal,
    receiptcurrentPage,
    receiptcurrentPageSize,
    purchaseValues,
  };
}

export default connect(mapStateToProps)(Form.create()(PurchaseReceipt));
