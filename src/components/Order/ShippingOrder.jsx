import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Row, Col, Input, Select, Button, Modal, Popover, DatePicker, message } from 'antd';

import InvoiceModal from './component/InvoiceModal';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;

@window.regStateCache
class ShippingOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: {}, // 修改的record
      checkId: [],
      shippingDetail: [],
      showDetail: false,
      shippingTrack: [],
      showTrack: false,
    };
  }
  handleSubmit(e, page, pageSize) {
    if (e) e.preventDefault();
    const { currentPageSize } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (values.orderTime && values.orderTime[0] && values.orderTime[1]) {
        values.startOrderTime = new Date(values.orderTime[0]).format('yyyy-MM-dd');
        values.endOrderTime = new Date(values.orderTime[1]).format('yyyy-MM-dd');
      }
      delete values.orderTime;
      this.props.dispatch({
        type: 'order/queryShippingOrderList',
        payload: {
          ...values,
          pageIndex: typeof page === 'number' ? page : 1,
          pageSize: pageSize || currentPageSize,
        },
      });
    });
  }
  updateModal(r) { // 修改发货单
    this.setState({ visible: true, data: r });
  }
  closeModal() {
    this.setState({ visible: false, checkId: [] }, () => {
      this.props.dispatch({
        type: 'order/saveErpOrderDetail',
        payload: {},
      });
      this._refreshData();
    });
  }
  exportPdf() { // 导出发货标签
    const p = this;
    const { checkId } = this.state;
    this.props.dispatch({
      type: 'order/exportPdf',
      payload: JSON.stringify(checkId),
      success() {
        p._refreshData();
      },
    });
    this.setState({ checkId: [] });
  }
  queryShippingOrderDetail(r) { // 查看明细
    const p = this;
    this.props.dispatch({
      type: 'order/queryShippingOrderDetail',
      payload: { shippingOrderId: r.id },
      cb(data) {
        p.setState({
          shippingDetail: data,
          showDetail: true,
        });
      },
    });
  }
  queryShippingTrack(r){ //查看物流明细
      const p = this;
      this.props.dispatch({
          type:'order/queryShippingTrack',
          payload:{shippingNo:r.shippingNo},
          cb(data) {
          p.setState({
          shippingTrack: data,
          showTrack: true,
        });
      },
      })
  }
  exportOrderDetail() { // 导出发货明细
    const { form } = this.props;
    const p = this;
    form.validateFields((err, values) => {
      if (err) return;
      let startOrderTime;
      let endOrderTime;
      let logisticCompany='';
      if (values.logisticCompany) {
      	logisticCompany=values.logisticCompany;
      }
      if (values.orderTime && values.orderTime[0] && values.orderTime[1]) {     	
        startOrderTime = new Date(values.orderTime[0]).format('yyyy-MM-dd');
        endOrderTime = new Date(values.orderTime[1]).format('yyyy-MM-dd');
        p.props.dispatch({
          type: 'order/exportOrderDetail',
          payload: {
          	logisticCompany,
            startOrderTime,
            endOrderTime,
          },
        });
      } else {
        message.error('请选择发货时间');
      }
    });
  }
  exportOrderDetailPackage() { // 导出包裹明细
    const { form } = this.props;
    const p = this;
    form.validateFields((err, values) => {
      if (err) return;
      let startOrderTime;
      let endOrderTime;
      let logisticCompany='';
      if (values.logisticCompany) {
      	logisticCompany=values.logisticCompany;
      }
      if (values.orderTime && values.orderTime[0] && values.orderTime[1]) {
        startOrderTime = new Date(values.orderTime[0]).format('yyyy-MM-dd');
        endOrderTime = new Date(values.orderTime[1]).format('yyyy-MM-dd');
        p.props.dispatch({
          type: 'order/exportOrderDetailPackage',
          payload: {
          	logisticCompany,
            startOrderTime,
            endOrderTime,
          },
        });
      } else {
        message.error('请选择发货时间');
      }
    });
  }
  render() {
    const p = this;
    const { shippingOrderList, shippingOrderTotal, currentPage, currentPageSize, deliveryCompanyList = [], form, dispatch } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { visible, data, shippingDetail, showDetail, shippingTrack, showTrack} = p.state;

    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        const listId = [];
        selectedRows.forEach((el) => {
          listId.push(el.id);
        });
        p.setState({ checkId: listId });
      },
      selectedRowKeys: p.state.checkId,
    };

    const pagination = {
      pageSize: currentPageSize,
      showSizeChanger: true,
      current: currentPage,
      total: shippingOrderTotal,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
      pageSizeOptions: ['20', '50', '100', '200', '500'],
      onShowSizeChange(current, size) {
        p.handleSubmit(null, 1, size);
      },
    };

    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columns = [
      { title: '发货单号', dataIndex: 'shippingNo', key: 'shippingNo', width: 100, render(text) { return text || '-'; } },
      { title: '子订单号', dataIndex: 'erpNo', key: 'erpNo', width: 120, render(text) { return text || '-'; } },
      { title: '收件人', dataIndex: 'receiver', key: 'receiver', width: 80, render(text) { return text || '-'; } },
      { title: '联系电话', dataIndex: 'telephone', key: 'telephone', width: 85, render(text) { return text || '-'; } },
      { title: '物流订单号', dataIndex: 'logisticNo', key: 'logisticNo', width: 80, render(text) { return <font color="purple">{text}</font> || '-'; } },
      { title: '物流公司名称', dataIndex: 'logisticCompany', width: 100, key: 'logisticCompany', render(text) { return text || '-'; } },
      { title: '商品净重(磅)', dataIndex: 'skuWeight', width: 70, key: 'skuWeight', render(text) { return text || '-'; } },
      { title: '预估物流费用', dataIndex: 'freight', width: 80, key: 'freight', render(text) { return text || '-'; } },
      { title: '物流状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render(text) {
          switch (text) {
            case 0: return '已预报';
            case 1: return <font color="blue">快递已发货</font>;
            case 2: return <font color="red">客户已收货</font>;
            default: return '-';
          }
        },
      },
      { title: '包裹状态', dataIndex: 'tplPkgStatus', key: 'tplPkgStatus', width: 80, render(text) { return text || '-'; } },
      { title: '包裹提示',
        dataIndex: 'isSlowly',
        key: 'isSlowly',
        width: 80,
        render(text) {
          switch (text) {
            case true: return <font color="purple">缓慢</font> ;
            case false: return <font color="green">正常</font>;
            default: return '-';
          }
        },
      },
      { title: '创建者', dataIndex: 'userCreate', key: 'userCreate', width: 80, render(t) { return <font color="blue">{t}</font>; } },
      { title: '打印者', dataIndex: 'userPrinter', key: 'userPrinter', width: 80, render(t) { return <font color="red">{t}</font>; } },
      { title: '创建时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 70, render(text) { return text || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 80,
        render(text, r) {
        	  if(p.props.loginRoler) {
        	  	return (
	            <div>
	              <a href="javascript:void(0)" onClick={p.queryShippingOrderDetail.bind(p, r)} style={{ marginRight: 10 }}>查看</a>
	            </div>);
        	  } else {
        	  	return (
	            <div>
	              <a href="javascript:void(0)" onClick={p.queryShippingOrderDetail.bind(p, r)} style={{ marginRight: 10 }}>查看</a>
	              <a href="javascript:void(0)" onClick={p.updateModal.bind(p, r)} style={{ marginRight: 10 }}>修改</a>
	              <a href="javascript:void(0)" onClick={p.queryShippingTrack.bind(p, r)} style={{ marginRight: 10 }}>轨迹</a>
	            </div>);
        	  }
        },
      },
    ];
    const dailiColumns = [
      { title: '发货单号', dataIndex: 'shippingNo', key: 'shippingNo', width: 100, render(text) { return text || '-'; } },
      { title: '子订单号', dataIndex: 'erpNo', key: 'erpNo', width: 120, render(text) { return text || '-'; } },
      { title: '收件人', dataIndex: 'receiver', key: 'receiver', width: 80, render(text) { return text || '-'; } },
      { title: '联系电话', dataIndex: 'telephone', key: 'telephone', width: 85, render(text) { return text || '-'; } },
      { title: '物流订单号', dataIndex: 'logisticNo', key: 'logisticNo', width: 80, render(text) { return <font color="purple">{text}</font> || '-'; } },
      { title: '物流公司名称', dataIndex: 'logisticCompany', width: 100, key: 'logisticCompany', render(text) { return text || '-'; } },
      { title: '物流状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render(text) {
          switch (text) {
            case 0: return '已预报';
            case 1: return <font color="blue">快递已发货</font>;
            case 2: return <font color="red">客户已收货</font>;
            default: return '-';
          }
        },
      },
      { title: '包裹状态', dataIndex: 'tplPkgStatus', key: 'tplPkgStatus', width: 80, render(text) { return text || '-'; } },
      { title: '创建者', dataIndex: 'userCreate', key: 'userCreate', width: 80, render(t) { return <font color="blue">{t}</font>; } },
      { title: '打印者', dataIndex: 'userPrinter', key: 'userPrinter', width: 80, render(t) { return <font color="red">{t}</font>; } },
      { title: '创建时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 70, render(text) { return text || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 80,
        render(text, r) {
        	  if(p.props.loginRoler) {
        	  	return (
	            <div>
	              <a href="javascript:void(0)" onClick={p.queryShippingOrderDetail.bind(p, r)} style={{ marginRight: 10 }}>查看</a>
	            </div>);
        	  } else {
        	  	return (
	            <div>
	              <a href="javascript:void(0)" onClick={p.queryShippingOrderDetail.bind(p, r)} style={{ marginRight: 10 }}>查看</a>
	              <a href="javascript:void(0)" onClick={p.updateModal.bind(p, r)} style={{ marginRight: 10 }}>修改</a>
	            </div>);
        	  }
        },
      },
    ];
    const detailColumns = [
      { title: '子订单号', dataIndex: 'erpNo', key: 'erpNo', width: 100 },
      { title: 'SKU编号', dataIndex: 'skuCode', key: 'skuCode', width: 200 },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 150 },
      { title: '商品图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 100,
        render(t) {
          if (t) {
            const picObj = JSON.parse(t);
            const picList = picObj.picList;
            if (picList.length) {
              const imgUrl = picList[0].url;
              return (
                <Popover title={null} content={<img role="presentation" src={imgUrl} style={{ width: 400 }} />}>
                  <img role="presentation" src={imgUrl} width={60} height={60} />
                </Popover>
              );
            }
          }
          return '-';
        },
      },
      { title: '物流方式',
        dataIndex: 'logisticType',
        key: 'logisticType',
        width: 60,
        render(t) {
          switch (t) {
            case 0: return '直邮';
            case 1: return '拼邮';
            default: return '-';
          }
        },
      },
      { title: '颜色', dataIndex: 'color', key: 'color', width: 100 },
      { title: '尺码', dataIndex: 'scale', key: 'scale', width: 100 },
      { title: '购买数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
      { title: '发货仓库', dataIndex: 'warehouseName', key: 'warehouseName', width: 100 },
      { title: '配货库位', dataIndex: 'positionNo', key: 'positionNo', width: 100 },
    ];
 const trackColumns = [
      { title: '物流状态', dataIndex: 'info', key: 'info', width: 100 },
      { title: '物流时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 70, render(text) { return text || '-'; } },
    ];
    const isNotSelected = this.state.checkId.length === 0;

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="物流状态"
                {...formItemLayout}
              >
                {getFieldDecorator('status', {})(
                  <Select placeholder="请选择" allowClear>
                    <Option value="0">已预报</Option>
                    <Option value="1">快递已发货</Option>
                    <Option value="2">客户已收货</Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="物流公司名称"
                {...formItemLayout}
              >
                {getFieldDecorator('logisticCompany', {})(
                  <Select placeholder="请选择物流公司名称" allowClear>
                    {deliveryCompanyList.map(v => (
                      <Option value={v.name} key={v.name}>{v.name}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="物流订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('logisticNo', {})(
                  <Input placeholder="请输入" />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="子订单号"
                {...formItemLayout}
              >
                {getFieldDecorator('erpNo', {})(
                  <Input placeholder="请输入" />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="收件人"
                {...formItemLayout}
              >
                {getFieldDecorator('receiver', {})(
                  <Input placeholder="请输入" />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="电话"
                {...formItemLayout}
              >
                {getFieldDecorator('telephone', {})(
                  <Input placeholder="请输入" />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span={8}>
              <FormItem
                label="发货单号"
                {...formItemLayout}
              >
                {getFieldDecorator('shippingNo', {})(
                  <Input placeholder="请输入" />,
                )}
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                label="发货时间"
                {...formItemLayout}
                labelCol={{ span: 6 }}
              >
                {getFieldDecorator('orderTime', {})(
                  <RangePicker />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                  label="渠道"
                  {...formItemLayout}
                >
                  {getFieldDecorator('type', {})(
                    <Select placeholder="请选择渠道" allowClear>
                      <Option value="1" key="1">包税线</Option>
                      <Option value="4" key="4">USA-P</Option>
                      <Option value="5" key="5">USA-C</Option>
                      <Option value="2" key="2">身份证线</Option>
                      <Option value="3" key="3">BC线</Option>
                      <Option value="6" key="6">邮客食品线</Option>
                      <Option value="8" key="8">4PX经济A线</Option>
                      <Option value="9" key="9">4PX经济B线</Option>
                      <Option value="7" key="7">邮客奶粉线</Option>
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
        {p.props.loginRoler ? 
        		<Row>　</Row> : 
        		<Row className="operBtn">
	          <Col>
	            <Button type="primary" style={{ float: 'left' }} disabled={isNotSelected} size="large" onClick={this.exportPdf.bind(this)}>导出发货标签</Button>
	            <Button type="primary" style={{ float: 'right' }} size="large" onClick={this.exportOrderDetail.bind(this)}>导出发货明细</Button>
	            <Button type="primary" style={{float: 'right',marginRight:'10px'}} size="large" onClick={this.exportOrderDetailPackage.bind(this)}>导出包裹明细</Button>
	          </Col>
	        </Row>
        }
        <Row>
          <Table columns={p.props.loginRoler ? dailiColumns : columns} dataSource={shippingOrderList} rowKey={r => r.id} rowSelection={rowSelection} pagination={pagination} bordered />
        </Row>
        <Modal
          visible={showDetail}
          title="详情"
          footer={null}
          width="900"
          onCancel={() => this.setState({ showDetail: false })}
        >
          <Table columns={detailColumns} dataSource={shippingDetail} rowKey={r => r.id} bordered />
        </Modal>
        <Modal
          visible={showTrack}
          title="物流详情"
          footer={null}
          width="900"
          onCancel={() => this.setState({ showTrack: false })}
        >
          <Table columns={trackColumns} dataSource={shippingTrack} rowKey={r => r.info} bordered />
        </Modal>
        <InvoiceModal
          visible={visible}
          data={data}
          deliveryCompanyList={deliveryCompanyList}
          closeModal={this.closeModal.bind(this)}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { shippingOrderList, deliveryCompanyList, shippingOrderTotal, shippingCurrentPage, shippingCurrentPageSize, loginRoler } = state.order;
  return { shippingOrderList, deliveryCompanyList, shippingOrderTotal, currentPage: shippingCurrentPage, currentPageSize: shippingCurrentPageSize, loginRoler };
}

export default connect(mapStateToProps)(Form.create()(ShippingOrder));
