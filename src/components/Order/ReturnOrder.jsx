import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, DatePicker, Button, Row, Col, Select, Form, Icon, Popover } from 'antd';
import ReturnOrderModal from './component/ReturnOrderModal';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@window.regStateCache
class ReturnOrder extends Component {

  constructor() {
    super();
    this.state = {
      visible: false,
    };
  }

  handleSubmit(e, page) {
    const p = this;
    if (e) e.preventDefault();
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
          type: 'order/queryReturnOrderList',
          payload: {
            ...fieldsValue,
            pageIndex: typeof page === 'number' ? page : 1,
          },
          cb() {
            p.closeModal();
          },
        });
      });
    });
  }

  updateModal(id) {
    const p = this;
    p.setState({
      visible: true,
    }, () => {
      p.props.dispatch({ type: 'order/queryReturnOrderById', payload: { id } });
    });
  }

  closeModal() {
    this.setState({ visible: false }, () => {
      this._refreshData();
    });
  }

  exportReturnOrder() {
    const { form } = this.props;
    const p = this;
    form.validateFields((err, values) => {
      let startGmtCreate;
      let endGmtCreate;
      if (values.orderTime && values.orderTime[0] && values.orderTime[1]) {
        startGmtCreate = new Date(values.orderTime[0]).format('yyyy-MM-dd');
        endGmtCreate = new Date(values.orderTime[1]).format('yyyy-MM-dd');
        delete values.orderTime;
      }
      p.props.dispatch({
        type: 'order/exportReturnOrder',
        payload: {
          ...values,
          startGmtCreate,
          endGmtCreate,
        },
      });
    });
  }

  handleEmptyInput(type) { // 清空内容
    const { setFieldsValue } = this.props.form;
    switch (type) {
      case 'orderNo': setFieldsValue({ orderNo: undefined }); break;
      case 'erpNo': setFieldsValue({ erpNo: undefined }); break;
      case 'skuCode': setFieldsValue({ skuCode: undefined }); break;
      case 'itemName': setFieldsValue({ itemName: undefined }); break;
      case 'upc': setFieldsValue({ upc: undefined }); break;
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
    const { form, dispatch, currentPage, returnOrderList = [], returnOrderTotal, returnOrderValues = {}, agencyList = [] } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { visible } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '主订单号', dataIndex: 'orderNo', key: 'orderNo', width: 120 },
      { title: '子订单号', dataIndex: 'erpNo', key: 'erpNo', width: 120, render(text) { return text || '-'; } },
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 100 },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 200 },
      { title: 'UPC', dataIndex: 'upc', key: 'upc', width: 100, render(text) { return text || '-'; } },
      { title: 'sku图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 100,
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
      { title: '销售员', dataIndex: 'salesName', key: 'salesName', width: 80, render(text) { return text || '-'; } },
      { title: '退单原因', dataIndex: 'returnReason', key: 'returnReason', width: 80, render(text) { return text || '-'; } },
      { title: '退单原因详情', dataIndex: 'returnReasonDetail', key: 'returnReasonDetail', width: 130, render(text) { return text ? text.slice(0, 10) : '-'; } },
      { title: '退款凭证',
        dataIndex: 'proofImg',
        key: 'proofImg',
        width: 100,
        render(text) {
          if (!text) return '-';
          return (
            <Popover title={null} content={<img role="presentation" src={text} style={{ width: 400 }} />}>
              <img role="presentation" src={text} width={60} height={60} />
            </Popover>
          );
        },
      },
      { title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 60,
        render(text) {
          switch (text) {
            case 0: return <font color="">待审核</font>;
            case 1: return <font color="chocolate">审核通过,退款中</font>;
            case 2: return <font color="blue">退款成功</font>;
            case -1: return <font color="red">关闭</font>;
            default: return '-';
          }
        },
      },
      { title: '退货数量', dataIndex: 'returnQuantity', key: 'returnQuantity', width: 60, render(text) { return text || '-'; } },
      { title: '退款金额', dataIndex: 'returnPrice', key: 'returnPrice', width: 60, render(text) { return text || '-'; } },
      { title: '是否国内退货', dataIndex: 'isGn', key: 'isGn', width: 60, render(text) { return text === 1 ? '是' : '否'; } },
      { title: '是否入库', dataIndex: 'isCheckin', key: 'isCheckin', width: 80, render(text) { return text === 1 ? '是' : '否'; } },
      { title: '退款形式', dataIndex: 'returnType', key: 'returnType', width: 80, 
      	render(text) {
      		if(text===0) {
      			return '仅退款'
      		} else if(text===1) {
      			return '既退货又退款'
      		} else {
      			return '-'
      		}
      }},
      { title: '退款来源', dataIndex: 'returnRefer', key: 'returnRefer', width: 80, 
      	render(text) {
      		if(text===0) {
      			return 'ERP创建'
      		} else if(text===1) {
      			return '微信小程序'
      		} else {
      			return '-'
      		}
      }},
      { title: '收货时间', dataIndex: 'receiveTime', key: 'receiveTime', width: 100, render(text) { return text || '-'; } },
      { title: '退款时间', dataIndex: 'returnPayTime', key: 'returnPayTime', width: 100, render(text) { return text || '-'; } },
      { title: '备注', dataIndex: 'remark', key: 'remark', width: 60, render(text) { return text || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 60,
        fixed: 'right',
        render(text, record) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.updateModal.bind(p, record.id)}>修改</a>
            </div>);
        },
      },
    ];

    const listPaginationProps = {
      total: returnOrderTotal,
      pageSize: 20,
      current: currentPage,
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
                label="主订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('orderNo', {})(
                  <Input placeholder="请输入主订单号" suffix={p.showClear('orderNo')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="子订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('erpNo', {})(
                  <Input placeholder="请输入子订单号" suffix={p.showClear('erpNo')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="订单状态"
                {...formItemLayout}
              >
                {getFieldDecorator('status', {})(
                  <Select placeholder="请选择订单状态" allowClear>
                    <Option value="0">待审核</Option>
                    <Option value="1">审核通过,退款中</Option>
                    <Option value="2">退款成功</Option>
                    <Option value="-1">关闭</Option>
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
                  <Input placeholder="请输入UPC" suffix={p.showClear('upc')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="商品代码"
                {...formItemLayout}
              >
                {getFieldDecorator('skuCode', {})(
                  <Input placeholder="请输入商品代码" suffix={p.showClear('skuCode')} />)}
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
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
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
            <Col span={8}>
              <FormItem
                label="退款形式"
                {...formItemLayout}
              >
                {getFieldDecorator('returnType', {})(
                  <Select placeholder="请选择退单类型" allowClear>
                    <Option key="0">仅退款</Option>
                    <Option key="1">既退货又退款</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label="退款来源"
                {...formItemLayout}
              >
                {getFieldDecorator('returnRefer', {})(
                  <Select placeholder="请选择退款来源" allowClear>
                    <Option key="0">ERP创建</Option>
                    <Option key="1">微信小程序</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="退单原因"
                {...formItemLayout}
              >
                {getFieldDecorator('returnReason', {})(
                  <Select placeholder="请选择" allowClear>
                  	<Option key="不想要了">不想要了</Option>
                    <Option key="发错货">发错货</Option>
                    <Option key="多发货">多发货</Option>
                    <Option key="采购不到">采购不到</Option>
                    <Option key="质量问题">质量问题</Option>
                    <Option key="尺码问题">尺码问题</Option>
                    <Option key="物流原因">物流原因</Option>
                    <Option key="客户错误下单">客户错误下单</Option>
                    <Option key="其他">其他</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span="12" style={{ marginLeft: 6 }}>
              <FormItem
                label="退款时间"
                labelCol={{ span: 6 }}
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
        <Row className="operBtn">
          <Col>
            <Button type="primary" style={{ float: 'right' }} size="large" onClick={this.exportReturnOrder.bind(this)}>导出退单</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={returnOrderList}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={listPaginationProps}
              scroll={{ x: 1960, y: 500 }}
            />
          </Col>
        </Row>
        <ReturnOrderModal
          visible={visible}
          close={this.closeModal.bind(this)}
          data={returnOrderValues}
          returnType="修改"
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { returnOrderList, returnOrderTotal, returnCurrentPage, returnOrderValues } = state.order;
  const { list } = state.agency;
  return {
    returnOrderList,
    returnOrderTotal,
    currentPage: returnCurrentPage,
    returnOrderValues,
    agencyList: list,
  };
}

export default connect(mapStateToProps)(Form.create()(ReturnOrder));
