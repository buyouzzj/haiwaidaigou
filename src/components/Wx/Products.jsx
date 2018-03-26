import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Row, Col, Select, DatePicker, Form, TreeSelect, Modal, Popover, Icon, Popconfirm } from 'antd';
import ProductsModal from './ProductsModal';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@window.regStateCache
class Products extends Component {

  constructor() {
    super();
    this.state = {
      checkId: [],
    };
  }

  handleSubmit(e, page, pageSize) {
    if (e) e.preventDefault();
    const { currentPageSize } = this.props;
    // 清除多选
    this.setState({ checkId: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        if (values.saleDate && values.saleDate[0] && values.saleDate[1]) {
          values.startDate = new Date(values.saleDate[0]).format('yyyy-MM-dd');
          values.endDate = new Date(values.saleDate[1]).format('yyyy-MM-dd');
        }
        delete values.saleDate;
        this.props.dispatch({
          type: 'products/queryItemList',
          payload: {
            ...values,
            pageIndex: typeof page === 'number' ? page : 1,
            pageSize: pageSize || currentPageSize,
          },
        });
      });
    });
  }

  updateModal(id) {
    const p = this;
    this.setState({ modalVisible: true }, () => {
      p.props.dispatch({ type: 'products/queryProduct', payload: { id } });
    });
  }
  
  cleanVirtualInvModal(itemId) {
    const p = this;
     p.props.dispatch({
      type: 'products/updateVirtualInvByItemId',
      payload: { itemId },
      cb() { p._refreshData(); }
    });
  }
  createDimensionPic(itemId) {
    const p = this;
     p.props.dispatch({
      type: 'products/getDimensionCodeUtil',
      payload: { itemId },
      cb() { p._refreshData(); }
    });
  }
  closeModal() {
    const { dispatch } = this.props;
    this.setState({ modalVisible: false }, () => {
      dispatch({
        type: 'products/saveProductsValue',
        payload: {},
      });
      this._refreshData();
    });
  }

  batchAction(batchType) {
    const p = this;
    const { checkId } = this.state;
    let action = '';
    let type = '';
    switch (batchType) {
      case 'syn': action = '同步'; type = 'products/batchSynItemYouzan'; break;
      case 'onSell': action = '上架'; type = 'products/batchListingYouzan'; break;
      case 'offSell': action = '下架'; type = 'products/batchDelistingYouzan'; break;
      default: action = '';
    }
    Modal.confirm({
      title: '确定',
      content: `确定要${action}id为${JSON.stringify(checkId)}的产品吗？`,
      onOk() {
        p.props.dispatch({
          type,
          payload: { itemIds: JSON.stringify(checkId) },
          cb() { p._refreshData(); },
        });
      },
    });
  }

  interator(arr, value, data = []) {
    const p = this;
    arr.forEach((el) => {
      if (el.id.toString() === value) data.push(el);
      else if (el.children.length) p.interator(el.children, value, data);
    });
    return data;
  }

  chooseCate(rules, value, cb) {
    const { tree } = this.props;
    const data = this.interator(tree, value);
    if (data && data[0] && data[0].level !== 3) cb('只能选择最后一级类目');
    else cb();
  }

  handleEmptyInput(type) { // 清空内容
    const { setFieldsValue } = this.props.form;
    switch (type) {
      case 'name': setFieldsValue({ name: undefined }); break;
      case 'itemCode': setFieldsValue({ itemCode: undefined }); break;
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

  render() {
    const p = this;
    const { form, currentPage, currentPageSize, productsList = [], productsTotal, allBrands = [], productsValues = {}, tree = [] ,loginRoler} = this.props;
    const { getFieldDecorator, resetFields } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const yzBasicUrl = 'https://h5.youzan.com/v2/goods/';
    const columns = [
      { title: '商品名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render(t, r) {
          return r.outerAlias ? <a href={`${yzBasicUrl}${r.outerAlias}`} rel="noopener noreferrer" target="_blank">{t}</a> : <span>{t}</span>;
        },
      },
      { title: '商品代码', dataIndex: 'itemCode', key: 'itemCode', width: 100 },
      { title: '商品状态',
        dataIndex: 'status',
        key: 'status',
        width: 60,
        render(t) {
          switch (t) {
            case 0: return <font color="">新建</font>;
            case 1: return <font color="blue">上架</font>;
            case 2: return <font color="red">下架</font>;
            case 3: return <font color="">同步</font>;
            case -1: return <font color="">删除</font>;
            default: return false;
          }
        },
      },
      { title: '商品图片',
        dataIndex: 'mainPic',
        key: 'mainPic',
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
      { title: '二维码图片',
        dataIndex: 'dimensionCodePic',
        key: 'dimensionCodePic',
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
      { title: '商品品牌', dataIndex: 'brand', key: 'brand', width: 100, render(text) { return text || '-'; } },
      { title: '销售类型', dataIndex: 'saleType', key: 'saleType', width: 80, render(text) { return <span>{text === 0 ? '代购' : '现货' }</span>; } },
      { title: '商品类目',
        width: 100,
        dataIndex: 'categoryId',
        key: 'categoryId',
        render(t) {
          const cate = p.interator(tree, t && t.toString()) || [];
          return <span>{cate[0] ? cate[0].name : '-'}</span>;
        },
      },
      { title: '采购地点', dataIndex: 'buySite', key: 'buySite', width: 80, render(text) { return text || '-'; } },
      { title: '是否可售',
        dataIndex: 'isSale',
        key: 'isSale',
        width: 80,
        render(text) {
          switch (text) {
            case 1: return '可售';
            default: return '不可销售';
          }
        },
      },
      { title: '开始销售时间', dataIndex: 'startDate', key: 'startDate', width: 80, render(text) { return text ? text.split(' ')[0] : '-'; } },
      { title: '结束销售时间', dataIndex: 'endDate', key: 'endDate', width: 80, render(text) { return text ? text.split(' ')[0] : '-'; } },
      { title: '操作',
        key: 'oper',
        width: 50,
        render(text, record) {
        	if(!record.dimensionCodePic) return (<div>
	            <a href="javascript:void(0)" onClick={p.updateModal.bind(p, record.id)}>修改</a>
	            <br/>
	             <Popconfirm title="是否要生成改小程序的二维码？" onConfirm={p.createDimensionPic.bind(p, record.id)}>
                		 <a href="javascript:void(0)"><font color='green'>生成二维码</font></a>
              </Popconfirm>
	            <br/>
	            <Popconfirm title="确定清除虚拟库存吗？" onConfirm={p.cleanVirtualInvModal.bind(p, record.id)}>
                		<a href="javascript:void(0)">清除虚拟库存</a>
              </Popconfirm>
	         </div>);
          return (
          	<div>
	            <a href="javascript:void(0)" onClick={p.updateModal.bind(p, record.id)}>修改</a>
	            <br/>
	            <Popconfirm title="确定清除虚拟库存吗？" onConfirm={p.cleanVirtualInvModal.bind(p, record.id)}>
                		<a href="javascript:void(0)">清除虚拟库存</a>
              </Popconfirm>
	         </div>
          );
        },
      },
    ];

    const paginationProps = {
      total: productsTotal,
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

    const isNotSelected = p.state.checkId.length === 0;

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="商品代码"
                {...formItemLayout}
              >
                {getFieldDecorator('itemCode', {})(
                  <Input placeholder="请输入商品代码" suffix={p.showClear('itemCode')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                {getFieldDecorator('name', {})(
                  <Input placeholder="请输入商品名称" suffix={p.showClear('name')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="商品类目"
                {...formItemLayout}
              >
                {getFieldDecorator('categoryId', {
                  rules: [{ validator: this.chooseCate.bind(this) }],
                })(
                  <TreeSelect placeholder="请选择类目" treeData={tree} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span={8}>
              <FormItem
                label="品牌"
                {...formItemLayout}
              >
                {getFieldDecorator('brand', {})(
                  <Select
                    allowClear
                    placeholder="请输入品牌"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {allBrands && allBrands.map(item => <Option key={item.name}>{item.name}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="采购站点"
                {...formItemLayout}
              >
                {getFieldDecorator('buySite', {})(
                  <Input placeholder="请输入采购站点" suffix={p.showClear('buySite')} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={20} style={{ width: 800 }}>
          	<Col span={24}>
              <FormItem
                label="销售时间范围"
                {...formItemLayout}
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('saleDate')(<RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => resetFields()}>清空</Button>
            </Col>
          </Row>
        </Form>
        <Row className="operBtn">
          <Col>
            <Button type="primary" style={{ float: 'left' }} size="large" onClick={() => this.setState({ modalVisible: true })}>添加商品</Button>
            <Button type="primary" style={{ float: 'right', marginLeft: 10 }} disabled={isNotSelected} size="large" onClick={p.batchAction.bind(p, 'syn')}>批量同步</Button>
            <Button type="primary" style={{ float: 'right', marginLeft: 10 }} disabled={isNotSelected} size="large" onClick={p.batchAction.bind(p, 'onSell')}>批量上架</Button>
            <Button type="primary" style={{ float: 'right', marginLeft: 10 }} disabled={isNotSelected} size="large" onClick={p.batchAction.bind(p, 'offSell')}>批量下架</Button>
          </Col>
        </Row>
        <Row>
          <Col className="table-wrapper">
            <Table
              columns={columns}
              dataSource={productsList}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={paginationProps}
              rowSelection={rowSelection}
            />
          </Col>
          <Col className="table-placeholder" />
        </Row>
        <ProductsModal
          visible={this.state.modalVisible}
          close={this.closeModal.bind(this)}
          modalValues={productsValues}
          allBrands={allBrands}
          tree={tree}
          loginRoler={loginRoler}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { productsList, productsTotal, productsValues, allBrands, tree, currentPage, currentPageSize,loginRoler } = state.products;
  return {
    productsList,
    productsTotal,
    productsValues,
    currentPage,
    currentPageSize,
    allBrands,
    tree,
    loginRoler,
  };
}

export default connect(mapStateToProps)(Form.create()(Products));
