import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Row, Col, Button, Input, Popover, Select, Icon } from 'antd';

import TransTo from './components/trans-to';
import CheckIn from './components/check-in';
import CheckOut from './components/check-out';
import ChangePosition from './components/change-position';
import CheckOutStock from './components/check-out-stock';
import TransInvCheckOut from './components/trv-out';
const FormItem = Form.Item;
const Option = Select.Option;

@window.regStateCache
class Inventory extends Component {
  constructor() {
    super();
    this.state = {
      sortField: null,
      sortOrder: null,
    };
  }
  handleSubmit(e, page,pageSize) {
    if (e) e.preventDefault();
    const { currentPageSize } = this.props;
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { warehouseId, skuCode, upc, itemName, positionNo,buySite } = values;
      const payload = { warehouseId, skuCode, upc, itemName, positionNo, buySite,pageIndex: typeof page === 'number' ? page : 1,pageSize: pageSize || currentPageSize, };
      if (this.state.sortField) payload.orderBy = this.state.sortField;
      if (this.state.sortOrder) payload.sort = this.state.sortOrder.match('asc') ? 'asc' : 'desc';

      dispatch({
        type: 'inventory/queryList',
        payload,
      });
    });
  }
  exportInv() {
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      const { warehouseId, skuCode, upc, itemName, positionNo,buySite } = values;
      const payload = { warehouseId, skuCode, upc, itemName, positionNo,buySite};

      dispatch({
        type: 'inventory/exportInv',
        payload: { ...payload },
      });
    });
  }
  handleEmptyInput(type) { // 清空内容
    const { setFieldsValue } = this.props.form;
    switch (type) {
      case 'positionNo': setFieldsValue({ positionNo: undefined }); break;
      case 'skuCode': setFieldsValue({ skuCode: undefined }); break;
      case 'itemName': setFieldsValue({ itemName: undefined }); break;
      case 'upc': setFieldsValue({ upc: undefined }); break;
      case 'buySite': setFieldsValue({ buySite: undefined }); break;
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
  handleTableChange(pagination, filters, sorter) {
    const { sortField, sortOrder } = this.state;
    const { field, order } = sorter;
    if (field !== sortField || order !== sortOrder) {
      if (field === undefined && order === undefined && sortField === null && sortOrder === null) {
        // do nothing.
      } else {
        this.setState({ sortField: field || null, sortOrder: order || null }, () => {
          this.handleSubmit(null, this.props.currentPage);
        });
      }
    }
  }
  render() {
    const p = this;
    const { list = [], total, form, dispatch, wareList = [], currentPage,loginRoler,currentPageSize } = this.props;
    const { getFieldDecorator, resetFields } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columns = [
      { title: 'SKU代码', key: 'skuCode', dataIndex: 'skuCode', width: 150 },
      { title: '商品名称', key: 'itemName', dataIndex: 'itemName', width: 200 },
      { title: '商品图片',
        key: 'skuPic',
        dataIndex: 'skuPic',
        width: 88,
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
      { title: '仓库名称', key: 'warehouseName', dataIndex: 'warehouseName', width: 100 },
      { title: 'UPC', key: 'upc', dataIndex: 'upc', width: 100 },
      { title: '颜色', key: 'color', dataIndex: 'color', width: 80 },
      { title: '尺寸', key: 'scale', dataIndex: 'scale', width: 80 },
      { title: '销售价', dataIndex: 'salePrice', key: 'salePrice', width: 80},
      { title: '采购地点', dataIndex: 'buySite', key: 'buySite', width: 80, render(text) { return text || '-'; } },
      { title: '可售库存', key: 'totalAvailableInv', dataIndex: 'totalAvailableInv', sorter: true, width: 80 },
      { title: '现货库存', key: 'inventory', dataIndex: 'inventory', sorter: true, width: 80 },
      { title: '现货占用', key: 'lockedInv', dataIndex: 'lockedInv', sorter: true, width: 80 },
      // { title: '虚拟库存', key: 'virtualInv', dataIndex: 'virtualInv' },
      { title: '在途库存', key: 'transInv', dataIndex: 'transInv', sorter: true, width: 80 },
      { title: '在途占用', key: 'lockedTransInv', dataIndex: 'lockedTransInv', sorter: true, width: 80 },
      { title: '货架号', key: 'positionNo', dataIndex: 'positionNo', width: 60 },
      { title: '操作',
        key: 'oper',
        width: 130,
        render(text, record) {
        if(p.props.loginRoler) return('-')
          return (
            <div>
              <TransTo dispatch={dispatch} record={record} handleSubmit={p.handleSubmit.bind(p)} page={currentPage} />
              <CheckIn dispatch={dispatch} record={record} handleSubmit={p.handleSubmit.bind(p)} page={currentPage} />
              <CheckOut dispatch={dispatch} record={record} handleSubmit={p.handleSubmit.bind(p)} page={currentPage} />
              <ChangePosition dispatch={dispatch} record={record} handleSubmit={p.handleSubmit.bind(p)} page={currentPage} />
              <TransInvCheckOut dispatch={dispatch} record={record} handleSubmit={p.handleSubmit.bind(p)} page={currentPage} />
              <br/>
              <CheckOutStock dispatch={dispatch} record={record} handleSubmit={p.handleSubmit.bind(p)} page={currentPage} />
            </div>
          );
        },
      },
    ];
     const paginationProps = {
      total,
      defaultPageSize: 20,
      showSizeChanger: true,
      pageSizeOptions: ['20', '50', '100', '200', '500'],
      onShowSizeChange(current, size) {
        p.handleSubmit(null, 1, size);
      },
      current: currentPage,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex, currentPageSize);
      },
    };
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
                label="SKU代码"
                {...formItemLayout}
              >
                {getFieldDecorator('skuCode', {})(
                  <Input placeholder="请输入SKU代码" suffix={p.showClear('skuCode')} />,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="UPC"
                {...formItemLayout}
              >
                {getFieldDecorator('upc', {})(
                  <Input placeholder="请输入UPC" suffix={p.showClear('upc')} />,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                {getFieldDecorator('itemName', {})(
                  <Input placeholder="请输入商品名称" suffix={p.showClear('itemName')} />,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="货架号"
                {...formItemLayout}
              >
                {getFieldDecorator('positionNo', {})(
                  <Input placeholder="请输入货架号" suffix={p.showClear('positionNo')} />,
                )}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="发现站点"
                {...formItemLayout}
              >
                {getFieldDecorator('buySite', {})(
                  <Input placeholder="请输入发现站点" suffix={p.showClear('buySite')} />,
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
          <Row className="operBtn">
            <Button style={{ float: 'right' }} type="primary" size="large" onClick={p.exportInv.bind(p)}>导出库存</Button>
          </Row>
        </Form>
        <Row style={{ marginTop: 15 }}>
          <Col>
            <Table
              bordered
              dataSource={list}
              columns={columns}
              pagination={paginationProps}
              rowKey={record => record.id}
              onChange={this.handleTableChange.bind(this)}
              rowSelection={rowSelection}
              scroll={{ y: 500, x: 1500 }}
            />
          </Col>
        </Row>
      </div>);
  }
}

function mapStateToProps(state) {
  const { list, total, wareList, currentPage,loginRoler,currentPageSize} = state.inventory;
  return { list, total, wareList, currentPage,loginRoler,currentPageSize };
}

export default connect(mapStateToProps)(Form.create()(Inventory));
