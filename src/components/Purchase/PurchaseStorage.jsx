import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Row, Col, Select, DatePicker, Form, Popconfirm, Modal, Popover } from 'antd';
import PurchaseStorageModal from './PurchaseStorageModal';
import BarcodeModal from './component/BarcodeStorageModal';

const FormItem = Form.Item;
const Option = Select.Option;

@window.regStateCache
class PurchaseStorage extends Component {

  constructor() {
    super();
    this.state = {
      selectedRowKeys: [],
      showDetail: false,
      data: [],
    };
  }

  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  batchStorage() {
    const p = this;
    Modal.confirm({
      title: '确认将选中项批量入库？',
      content: '操作不可撤回，请预先核对',
      onOk() {
        p.props.dispatch({
          type: 'purchaseStorage/multiConfirmStorage',
          payload: { ids: JSON.stringify(p.state.selectedRowKeys) },
          cb() { p.handleSubmit(); },
        });
        p.setState({ selectedRowKeys: [] });
      },
    });
  }
  //合并小程序入库
  mergeStorage() {
    const p = this;
    Modal.confirm({
      title: '确认将选中的入库单合并为一个入库？',
      content: '操作不可撤回，请预先核对',
      onOk() {
        p.props.dispatch({
          type: 'purchaseStorage/mergePurchaseStorage',
          payload: { ids: JSON.stringify(p.state.selectedRowKeys) },
          cb() { p.handleSubmit(); },
        });
        p.setState({ selectedRowKeys: [] });
      },
    });
  }

  handleSubmit(e, page) {
    if (e) e.preventDefault();
    // 清除多选
    this.setState({ selectedRowKeys: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        if (values.orderDate && values.orderDate[0] && values.orderDate[1]) {
          values.startTime = new Date(values.orderDate[0]).format('yyyy-MM-dd');
          values.endTime = new Date(values.orderDate[1]).format('yyyy-MM-dd');
        }
        if (values.storageDate && values.storageDate[0] && values.storageDate[1]) {
          values.putInStart = new Date(values.storageDate[0]).format('yyyy-MM-dd');
          values.putInEnd = new Date(values.storageDate[1]).format('yyyy-MM-dd');
        }
        delete values.orderDate;
        delete values.storageDate;
        this.props.dispatch({
          type: 'purchaseStorage/queryPurchaseStorageList',
          payload: {
            ...values,
            pageIndex: typeof page === 'number' ? page : 1,
          },
        });
      });
    });
  }

  closeModal() {
    this._refreshData();
  }

  showModal(type, id) {
    const p = this;	
    if (type === 'update') {
     this.props.dispatch({ type: 'purchaseStorage/queryStorage', payload: { id },cb(data) {
          if (data && data.purchaseStorageDetailList) {
            p.setState({ data: data.purchaseStorageDetailList });
          }
        }, });
    }
    this.props.dispatch({ type: 'purchaseStorage/toggleShowModal'});
  }

  showBarcodeModal(type, id) {
    if (type === 'update') {
      this.props.dispatch({ type: 'purchaseStorage/queryStorage', payload: { id } });
    } else {
      this.setState({ data: [] });
    }
    this.props.dispatch({ type: 'purchaseStorage/toggleBarcodeModal' });
  }

  handleDelete(id) {
    const p = this;
    const { list = [], currentPage, dispatch } = this.props;
    dispatch({
      type: 'purchaseStorage/deleteStorage',
      payload: { id },
      cb() {
        if (list.length < 2 && currentPage > 1) {
          p.handleSubmit(null, currentPage - 1);
        } else p.handleSubmit(null, currentPage);
      },
    });
  }

  updateModal(id) {
    const p = this;
    this.setState({ modalVisible: true }, () => {
      p.props.dispatch({ type: 'products/queryProduct', payload: { id } });
    });
  }

  queryDetail(r) {
    const p = this;
    p.setState({ showDetail: true }, () => {
      p.props.dispatch({
        type: 'purchaseStorage/queryStorage',
        payload: { id: r.id },
        cb(data) {
          if (data && data.purchaseStorageDetailList) {
            data.purchaseStorageDetailList.push({
              skuCode: <font color="#00f" >明细合计</font>,
              quantity: data.totalQuantity,
              transQuantity: data.totalTransQuantity,
              taskDailyCount: data.totalTaskDailyCount,
              id: 0,
            });
            p.setState({ data: data.purchaseStorageDetailList });
          }
        },
      });
    });
  }

  exportDetail(id) {
    this.props.dispatch({
      type: 'purchaseStorage/exportDetail',
      payload: { id },
    });
  }

  closeDetailModal() {
    const detailList = this.props.editInfo.purchaseStorageDetailList || [];
    const len = detailList.length;
    if (detailList[len - 1].id === 0) detailList.pop();
    this.props.dispatch({ type: 'purchaseStorage/clearEditInfo' });
    setTimeout(() => {
      this.setState({ showDetail: false });
    }, 300);
  }

  render() {
    const p = this;
    const { form, dispatch, list = [], currentPage, total, buyer = [], wareList = [], showModal, editInfo = {}, buyerTaskList = [], showBarcodeModal } = p.props;
    const { selectedRowKeys, showDetail, data } = p.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '入库单号', dataIndex: 'stoOrderNo', key: 'stoOrderNo' },
      { title: '买手姓名', dataIndex: 'buyerName', key: 'buyerName' },
      { title: '操作员名字', dataIndex: 'userCreate', key: 'userCreate' },
      { title: '仓库名称', dataIndex: 'warehouseName', key: 'warehouseName' },
      { title: '新增时间', dataIndex: 'gmtCreate', key: 'gmtCreate', render(t) { return t && t.split(' ')[0]; } },
      { title: '修改时间', dataIndex: 'gmtModify', key: 'gmtModify', render(t) { return t && t.split(' ')[0]; } },
      { title: '入库时间', dataIndex: 'putInDate', key: 'putInDate', render(t) { return (t && t.split(' ')[0]) || '-'; } },
      { title: '状态', dataIndex: 'status', key: 'status',         
          render(t) {
          switch (t) {
            case 0: return <font color="red">未入库</font>;
            case 1: return <font color="blue">已入库</font>;
            case -1: return <font color="green">已合并</font>;
            default: return '已入库';
          }
        }, 
      },
      { title: '备注', dataIndex: 'remark', key: 'remark', render(t) { return t || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 160,
        render(t, r) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.queryDetail.bind(p, r)} style={{ marginRight: 10 }}>查看</a>
              {r.storageType === 1 ?
                <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.showBarcodeModal.bind(p, 'update', r.id)}>修改</a> :
                <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.showModal.bind(p, 'update', r.id)}>修改</a>}
              <Popconfirm title="确认删除？" onConfirm={p.handleDelete.bind(p, r.id)} >
                <a href="javascript:void(0)" style={{ marginRight: 10 }}>删除</a>
              </Popconfirm>
              <a href="javascript:void(0)" onClick={p.exportDetail.bind(p, r.id)} >导出</a>
            </div>);
        },
      },
    ];

    const columnsStorageList = [
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 80 },
      { title: 'UPC', dataIndex: 'upc', key: 'upc', width: 80 },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 100 },
      { title: '采购站点', dataIndex: 'buySite', key: 'buySite', width: 70 },
      { title: '图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 80,
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
      { title: '颜色', dataIndex: 'color', key: 'color', width: 60 },
      { title: '规格', dataIndex: 'scale', key: 'scale', width: 60 },
      { title: '计划采购数', dataIndex: 'taskDailyCount', key: 'taskDailyCount', width: 60 },
      { title: '入库数', dataIndex: 'quantity', key: 'quantity', width: 70, render(t) { return t || 0; } },
      { title: '在途入库数', dataIndex: 'transQuantity', key: 'transQuantity', width: 70, render(t) { return t || 0; } },
      { title: '仓库', dataIndex: 'warehouseName', key: 'warehouseName', width: 80 },
      { title: '货架号', dataIndex: 'shelfNo', key: 'shelfNo', width: 80 },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
    };

    const paginationProps = {
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
                label="买手"

                {...formItemLayout}
              >
                {getFieldDecorator('buyerId', {})(
                  <Select placeholder="请选择用户" optionLabelProp="title" combobox allowClear>
                    {buyer.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="入库单号"

                {...formItemLayout}
              >
                {getFieldDecorator('stoOrderNo', {})(
                  <Input placeholder="请输入入库单号" />)}
              </FormItem>
            </Col>
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
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col style={{ marginLeft: 6 }}>
              <FormItem
                label="订单时间"
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('orderDate', {})(<DatePicker.RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col style={{ marginLeft: 6 }}>
              <FormItem
                label="入库时间"
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('storageDate', {})(<DatePicker.RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col className="listBtnGroup" style={{ marginLeft: 14 }}>
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => form.resetFields()}>清空</Button>
            </Col>
          </Row>
        </Form>
        <Row className="operBtn">
          <Button type="primary" size="large" onClick={this.showModal.bind(this, 'add')} style={{ float: 'left', marginRight: 10 }}>新增入库</Button>
          <Button type="primary" size="large" onClick={this.showBarcodeModal.bind(this, 'add')} style={{ float: 'left' }}>扫描入库</Button>
          <Button type="primary" size="large" onClick={this.batchStorage.bind(this)} style={{ float: 'right'}} disabled={selectedRowKeys.length === 0}>批量入库</Button>
          <Button type="primary" size="large" onClick={this.mergeStorage.bind(this)} style={{ float: 'right',marginRight: 10  }} disabled={selectedRowKeys.length === 0}>合并入库</Button>
        </Row>
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
        <Modal
          visible={showDetail}
          title="详情"
          footer={null}
          width={1200}
          onCancel={this.closeDetailModal.bind(this)}
        >
          <Table columns={columnsStorageList} pagination={false} dataSource={data} rowKey={r => r.id} bordered scroll={{ y: 500 }} />
        </Modal>
        {showModal && <PurchaseStorageModal
          visible={showModal}
          title={Object.keys(editInfo).length > 0 ? '修改入库单' : '新增入库单'}
          buyer={buyer}
          wareList={wareList}
          buyerTaskList={buyerTaskList}
          purchaseStorageData={editInfo}
          isShowDetail={showDetail}
          dispatch={dispatch}
          close={this.closeModal.bind(this)}
        />}
        {showBarcodeModal && <BarcodeModal
          visible={showBarcodeModal}
          title={Object.keys(editInfo).length > 0 ? '修改入库单' : '新增入库单'}
          wareList={wareList}
          buyer={buyer}
          barcodeStorageData={editInfo}
          isShowDetail={showDetail}
          dispatch={dispatch}
          close={this.closeModal.bind(this)}
        />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { list, total, currentPage, buyer, showModal, editInfo, buyerTaskList, showBarcodeModal } = state.purchaseStorage;
  const { wareList } = state.inventory;
  return {
    list, total, currentPage, buyer, wareList, showModal, editInfo, buyerTaskList, showBarcodeModal,
  };
}

export default connect(mapStateToProps)(Form.create()(PurchaseStorage));
