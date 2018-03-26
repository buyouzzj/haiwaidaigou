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
    const { receiptTaskPageSize } = this.props;
    if (e) e.preventDefault();
    p.setState({ taskDailyIds: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
        if (err) return;
        let startGmtCreate;
        let endGmtCreate;
        if (fieldsValue.gmtCreate && fieldsValue.gmtCreate[0] && fieldsValue.gmtCreate[1]) {
          startGmtCreate = new Date(fieldsValue.gmtCreate[0]).format('yyyy-MM-dd');
          endGmtCreate = new Date(fieldsValue.gmtCreate[1]).format('yyyy-MM-dd');
        }
       delete fieldsValue.gmtCreate;
        this.props.dispatch({
          type: 'purchase/purchaseReceiptTaskList',
          payload: {
            ...fieldsValue,
            pageIndex: typeof page === 'number' ? page : 1,
            pageSize: pageSize || receiptTaskPageSize,
            startGmtCreate,
            endGmtCreate,
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

  render() {
    const p = this;
    const { form,  purchaseValues = {},  dispatch,receiptTaskList = [] ,receiptTaskTotal, receiptTaskPage } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { title } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
const columnsList = [
      { title: '小票单号', dataIndex: 'receiptNo', key: 'receiptNo', width: 150 },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 150 },
      { title: '商品图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 80,
        render(text) {
          if (!text) return '-';
          const t = text;
          return (
            t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
              <img role="presentation" src={t} width={60} height={60} />
            </Popover> : '-'
          );
        },
      },
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 150 },
      { title: '商品upc', dataIndex: 'upc', key: 'upc', width: 150 },
      { title: '商品原价', dataIndex: 'costPrice', key: 'costPrice', width: 100 },
      { title: '折扣率', dataIndex: 'discount', key: 'discount', width: 100 },
      { title: '折后价', dataIndex: 'purchasePrice', key: 'purchasePrice', width: 100 },
      { title: '真实采购价', dataIndex: 'price', key: 'price', width: 100 },
      { title: '线下数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
      { title: '在途数量', dataIndex: 'transQuantity', key: 'transQuantity', width: 100 },
      { title: '订购站点', dataIndex: 'skuBuysite', key: 'skuBuysite', width: 100 },
      { title: '生成时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 130, render(text) { return text ? text : '-'; } },
    ];
    const paginationProps = {
     total : receiptTaskTotal,
     current: receiptTaskPage,
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
          <Row gutter={20} style={{ width: 1000 }}>
            <Col span="8">
              <FormItem
                label="小票单号"
                {...formItemLayout}
              >
                {getFieldDecorator('receiptNo', {})(
                  <Input placeholder="请输入小票单号" />)}
              </FormItem>
            </Col>
            <Col span="8">
               <FormItem
                label="商品UPC"
                {...formItemLayout}
              >
                {getFieldDecorator('upc', {})(
                  <Input placeholder="请输入商品的upc" />)}
              </FormItem>
            </Col>
            <Col span="8">
               <FormItem
                label="sku代码"
                {...formItemLayout}
              >
                {getFieldDecorator('skuCode', {})(
                  <Input placeholder="请输入sku代码" />)}
              </FormItem>
            </Col>
            <Col span="8">
               <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                {getFieldDecorator('itemName', {})(
                  <Input placeholder="请输入商品名称" />)}
              </FormItem>
            </Col>
            <Col span="8">
               <FormItem
                label="发现站点"
                {...formItemLayout}
              >
                {getFieldDecorator('skuBuysite', {})(
                  <Input placeholder="请输入发现站点" />)}
              </FormItem>
            </Col>
          </Row>
         <Row gutter={20} style={{ width: 800 }}>
          <Col span="10">
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
              dataSource={receiptTaskList}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={paginationProps}
            />
          </Col>
        </Row>
        <PurchaseModal
          visible={this.state.modalVisible}
          modalValues={purchaseValues}
          title={title}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { list, total, currentPage, currentPageSize, purchaseValues, buyer,receiptTaskList = [] ,receiptTaskTotal, receiptTaskPage } = state.purchase;
  return {
    list,
    total,
    currentPage,
    currentPageSize,
    purchaseValues,
    buyer,
    receiptTaskList,
    receiptTaskTotal,
    receiptTaskPage,
  };
}

export default connect(mapStateToProps)(Form.create()(Purchase));
