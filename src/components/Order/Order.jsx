import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, DatePicker, Button, Row, Col, Select, Form, Modal, Popconfirm, Popover, Icon, message } from 'antd';
import OrderModal from './OrderModal';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@window.regStateCache
class Order extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      visible: false,
      title: '', // modal的title
      checkId: [], // 审核时传的id
    };
  }

  handleSubmit(e, page, pageSize) {
    if (e) e.preventDefault();
    const { currentPageSize } = this.props;
    // 清除多选
    this.setState({ checkId: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
        if (err) return;
        if (fieldsValue.orderTime && fieldsValue.orderTime[0] && fieldsValue.orderTime[1]) {
          fieldsValue.startGmtCreate = new Date(fieldsValue.orderTime[0]).format('yyyy-MM-dd');
          fieldsValue.endGmtCreate = new Date(fieldsValue.orderTime[1]).format('yyyy-MM-dd');
        }
        delete fieldsValue.orderTime;
        this.props.dispatch({
          type: 'order/queryOrderList',
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
    this.props.dispatch({
      type: 'sku/querySkuList',
      payload: {},
    });
  }

  handleOrderAction(type) {
    const p = this;
    const { dispatch } = this.props;
    const { checkId } = this.state;
    if (type === 'close') {
      Modal.confirm({
        title: '关闭订单',
        content: '确认要关闭此订单吗？',
        onOk() {
          dispatch({
            type: 'order/closeOrder',
            payload: { orderIds: JSON.stringify(checkId) },
            cb() { p._refreshData(); },
          });
        },
      });
    }
  }

  updateModal(id, e) {
    if (e) e.stopPropagation();
    const p = this;
    p.setState({
      modalVisible: true,
      title: '修改',
    }, () => {
      p.props.dispatch({ type: 'order/queryOrder', payload: { id } });
      p.props.dispatch({ type: 'sku/querySkuList', payload: {} });
    });
  }

  closeModal() {
    this.setState({ modalVisible: false }, () => {
      this.props.dispatch({
        type: 'order/saveOrder',
        payload: {},
      });
      this._refreshData();
    });
  }

  handleProDetail(record, e) {
    if (e) e.stopPropagation();
    const p = this;
    p.setState({
      visible: true,
    }, () => {
      p.props.dispatch({
        type: 'order/queryOrderDetail',
        payload: { id: record.id },
      });
    });
  }

  handleDelete(id, e) {
    if (e) e.stopPropagation();
    const p = this;
    const { currentPage, orderList = [] } = this.props;
    this.props.dispatch({
      type: 'order/deleteOrder',
      payload: { id },
      cb() {
        if (orderList.length < 2 && currentPage > 1) {
          p.handleSubmit(null, currentPage - 1);
        } else p.handleSubmit(null, currentPage);
      },
    });
  }

  exportMainOrder() { // 导出订单
    const { form } = this.props;
    const p = this;
    form.validateFields((err, values) => {
      if (err) return;
      let startGmtCreate;
      let endGmtCreate;
      if (values.orderTime && values.orderTime[0] && values.orderTime[1]) {
        startGmtCreate = new Date(values.orderTime[0]).format('yyyy-MM-dd');
        endGmtCreate = new Date(values.orderTime[1]).format('yyyy-MM-dd');
        delete values.orderTime;
        p.props.dispatch({
          type: 'order/exportMainOrder',
          payload: {
            ...values,
            startGmtCreate,
            endGmtCreate,
          },
        });
      } else {
        message.error('请选择创建时间范围');
      }
    });
  }
  
  outerOrderReview() {	//微信录单确认
  	const p = this;
  	p.props.dispatch({
        type: 'order/outerOrderReview',
        cb() { p._refreshData(); },
      });
  }

  handleEmptyInput(type) { // 清空内容
    const { setFieldsValue } = this.props.form;
    switch (type) {
      case 'orderNo': setFieldsValue({ orderNo: undefined }); break;
      case 'targetNo': setFieldsValue({ targetNo: undefined }); break;
      case 'skuCode': setFieldsValue({ skuCode: undefined }); break;
      case 'itemName': setFieldsValue({ itemName: undefined }); break;
      case 'upc': setFieldsValue({ upc: undefined }); break;
      case 'receiver': setFieldsValue({ receiver: undefined }); break;
      case 'telephone': setFieldsValue({ telephone: undefined }); break;
      default: return false;
    }
  }

  showClear(type) { // 是否显示清除按钮
    const { getFieldValue } = this.props.form;
    const data = getFieldValue(type);
    if (data) {
      return <Icon type="close-circle" onClick={this.handleEmptyInput.bind(this, type)} />;
    }
    return null;
  }

  render() {
    const p = this;
    const { form, dispatch, currentPage, orderList = [], orderTotal, currentPageSize, orderValues = {}, agencyList = [], orderDetailList = [], loginRoler } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { title, visible, modalVisible } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '主订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
      { title: '外部订单号', dataIndex: 'targetNo', key: 'targetNo', width: 120, render(text) { return text || '-'; } },
      { title: '销售员', dataIndex: 'salesName', key: 'salesName', width: 80, render(text) { return text || '-'; } },
      { title: '商户订单号',dataIndex: 'wxPayTradeNo', key: 'wxPayTradeNo', width: 100, render(text) { return text || '-'; } },
      { title: '销售时间', dataIndex: 'orderTime', key: 'orderTime', width: 150, render(text) { return text ? text : '-'; } },
      { title: '创建时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 150, render(text) { return text || '-'; } },
      { title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render(text) {
          switch (text) {
            case 0: return <font color="saddlebrown">新建</font>;
            case 1: return <font color="chocolate">部分发货</font>;
            case 2: return <font color="blue">全部发货</font>;
            case -1: return <font color="red">已关闭</font>;
            case -2: return <font color="red">待确认</font>;
            default: return '-';
          }
        },
      },
      { title: '收件人', dataIndex: 'receiver', key: 'receiver', width: 80 },
      { title: '收件人地址',
        dataIndex: 'address',
        key: 'address',
        width: 200,
        render(t, r) {
          return <span>{`${r.receiverState} ${r.receiverCity} ${r.receiverDistrict} ${r.addressDetail}`}</span>;
        },
      },
      { title: '联系电话', dataIndex: 'telephone', key: 'telephone', width: 100 },
      { title: '备注', dataIndex: 'remark', key: 'remark', width: 200, render(text) { return text || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 150,
        fixed: 'right',
        render(text, record) {
        	  if(p.props.loginRoler) return('-');
          return (
            <div>
              {record.status !== -1 && <a href="javascript:void(0)" onClick={p.handleProDetail.bind(p, record)}>订单明细</a>}
              <a href="javascript:void(0)" style={{ margin: '0 10px' }} onClick={p.updateModal.bind(p, record.id)}>修改</a>
              <Popconfirm title="确定删除此订单？" onConfirm={p.handleDelete.bind(p, record.id)}>
                <a href="javascript:void(0)" style={{ marginRight: 10 }}>删除</a>
              </Popconfirm>
            </div>);
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys: p.state.checkId,
      onChange(selectedRowKeys, selectedRows) {
        const listId = [];
        selectedRows.forEach((el) => {
          listId.push(el.id);
        });
        p.setState({ checkId: listId });
      },
    };

    const listPaginationProps = {
      total: orderTotal,
      current: currentPage,
      pageSize: currentPageSize,
      showSizeChanger: true,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
      pageSizeOptions: ['20', '50', '100', '200', '500'],
      onShowSizeChange(current, size) {
        p.handleSubmit(null, 1, size);
      },
    };

    const skuColumns = [
      { title: '主订单号', dataIndex: 'orderNo', key: 'orderNo', width: 150, render(text) { return text || '-'; } },
      { title: '子订单号', dataIndex: 'erpNo', key: 'erpNo', width: 150, render(text) { return text || '-'; } },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 150, render(text) { return text || '-'; } },
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 150, render(text) { return text || '-'; } },
      { title: '图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 80,
        render(text) {
          const t = text ? JSON.parse(text).picList[0].url : '';
          return (
            t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
              <img role="presentation" src={t} width={60} height={60} />
            </Popover> : '-'
          );
        },
      },
      { title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render(text) {
          switch (text) {
            case 0: return <font color="saddlebrown">新建</font>;
            case 1: return <font color="chocolate">部分发货</font>;
            case 2: return <font color="blue">全部发货</font>;
            case -1: return <font color="red">已关闭</font>;
            default: return '-';
          }
        },
      },
      { title: '备货状态',
        dataIndex: 'stockStatus',
        key: 'stockStatus',
        width: 100,
        render(text) {
          switch (text) {
            case 0: return <font>未备货</font>;
            case 1: return <font color="sienna">部分备货</font>;
            case 2: return <font color="saddlebrown">部分在途备货</font>;
            case 3: return <font color="saddlebrown">全部在途备货</font>;
            case 4: return <font color="sienna">混合备货完成</font>;
            case 9: return <font color="red">已释放</font>;
            case 10: return <font color="blue">已备货</font>;
            case 11: return <font color="green">预出库</font>;
            default: return '-';
          }
        },
      },
      { title: '颜色', dataIndex: 'color', key: 'color', width: 60, render(text) { return text || '-'; } },
      { title: '尺码', dataIndex: 'scale', key: 'scale', width: 60, render(text) { return text || '-'; } },
      { title: '品牌', dataIndex: 'brand', key: 'brand', width: 60, render(text) { return text || '-'; } },
      { title: '销售价', dataIndex: 'salePrice', key: 'salePrice', width: 60, render(text) { return text || 0; } },
      { title: '运费', dataIndex: 'freight', key: 'freight', width: 60, render(text) { return text || 0; } },
      { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60, render(text) { return text || 0; } },
    ];

    const modalProps = {
      title: `订单编号：${(orderDetailList && orderDetailList[0] && orderDetailList[0].orderNo) || '-'}`,
      footer: null,
      visible,
      width: 1200,
      closable: true,
      onCancel() {
        p.setState({ visible: false });
        p.props.dispatch({ type: 'order/saveOrderSkuSnip', payload: {} });
      },
    };

    const isNotSelected = this.state.checkId.length === 0;

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="主订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('orderNo', {})(
                  <Input placeholder="请输入主订单号" suffix={p.showClear('orderNo')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="外部订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('targetNo', {})(
                  <Input placeholder="请输入外部订单号" suffix={p.showClear('targetNo')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="订单状态"
                {...formItemLayout}
              >
                {getFieldDecorator('status', {
                  initialValue: '10',
                })(
                  <Select placeholder="请选择订单状态" >
                    <Option value="10">全部</Option>
                    <Option value="0">新建</Option>
                    <Option value="1">部分发货</Option>
                    <Option value="2">全部发货</Option>
                    <Option value="-1">已关闭</Option>
                    <Option value="-2">待确认</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="收件人"
                {...formItemLayout}
              >
                {getFieldDecorator('receiver', {})(
                  <Input placeholder="请输入收件人" suffix={p.showClear('receiver')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="联系电话"
                {...formItemLayout}
              >
                {getFieldDecorator('telephone', {})(
                  <Input placeholder="请输入联系电话" suffix={p.showClear('telephone')} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label="销售"
                {...formItemLayout}
              >
                {getFieldDecorator('salesName', {})(
                  <Select placeholder="请选择销售" allowClear>
                    {agencyList.map((el) => {
                      return <Option key={el.id} value={el.name}>{el.name}</Option>;
                    })}
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="UPC"
                {...formItemLayout}
              >
                {getFieldDecorator('upc', {})(
                  <Input placeholder="请输入UPC代码" suffix={p.showClear('upc')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                {getFieldDecorator('itemName', {})(
                  <Input placeholder="请输入商品名称" suffix={p.showClear('itemName')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="SKU代码"
                {...formItemLayout}
              >
                {getFieldDecorator('skuCode', {})(
                  <Input placeholder="请输入SKU代码" suffix={p.showClear('skuCode')} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col style={{ marginLeft: 6 }}>
              <FormItem
                label="创建时间范围"
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('orderTime', {})(<RangePicker />)}
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
        		<Row>　</Row> : 
        		<Row className="operBtn">
          <Col>
            <Button type="primary" size="large" onClick={p.showModal.bind(p)} style={{ float: 'left' }}>新增订单</Button>
            <Button type="primary" size="large" onClick={p.exportMainOrder.bind(p)} style={{ float: 'right', marginLeft: 10 }}>导出订单</Button>
            <Button type="primary" disabled={isNotSelected} size="large" onClick={p.handleOrderAction.bind(p, 'close')} style={{ float: 'right' }}>订单关闭</Button>
            <a href='/haierp1/wx/messageList' target="_blank"><Button type="primary" size="large" style={{ float: 'right', marginRight: 10}}>微信录单</Button></a>
            <Button type="primary" size="large" onClick={p.outerOrderReview.bind(p)} style={{ float: 'right', marginRight: 10}}>录单确认</Button>
          </Col>
        </Row>
        	}
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={orderList}
              bordered
              size="large"
              onRowClick={record => p.handleProDetail(record)}
              rowKey={record => record.id}
              pagination={listPaginationProps}
              rowSelection={rowSelection}
              scroll={{ x: 1560, y: 500 }}
            />
          </Col>
        </Row>
        <Modal {...modalProps}>
          <Table
            columns={skuColumns}
            dataSource={orderDetailList}
            bordered
            size="large"
            rowKey={record => record.id}
            pagination={false}
            scroll={{ x: 1400, y: 550 }}
          />
        </Modal>
        <OrderModal
          visible={modalVisible}
          close={this.closeModal.bind(this)}
          modalValues={orderValues}
          agencyList={agencyList}
          title={title}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { orderList, orderTotal, currentPage, currentPageSize, orderValues, orderDetailList, loginRoler } = state.order;
  const { list } = state.agency;
  return {
    orderList,
    orderTotal,
    currentPageSize,
    currentPage,
    orderValues,
    agencyList: list,
    orderDetailList,
    loginRoler
  };
}

const OrderList = Form.create()(Order);

export default connect(mapStateToProps)(OrderList);
