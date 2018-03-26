import React, { Component } from 'react';
import { Modal, Button, Input, InputNumber, Select, Row, Col, Table, Form, Popover } from 'antd';
import fetch from '../../utils/request';
import styles from './Purchase.less';

const FormItem = Form.Item;
const Option = Select.Option;

let firstLoad = true;

function toString(str, type) {
  if (typeof str !== 'undefined' && str !== null) {
    return str.toString();
  }
  if (type === 'SELECT') return undefined;
  return '';
}

function generateRandomSkuId(skuId) {
  return `${skuId && skuId.toString().split('__')[0]}__${new Date().getTime()}`;
}

function restoreSkuId(skuId) {
  return skuId && parseInt(skuId.toString().split('__')[0], 10);
}

function checkPassed(str) {
  if (typeof str === 'undefined' || str === '' || str === null) return false;
  return true;
}

class PurchaseModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      storageList: [],
      id: undefined,
      positionId: undefined,
    };
  }

  componentWillReceiveProps(...args) {
    const { purchaseStorageData, isShowDetail, dispatch } = args[0];
    if (!isShowDetail && purchaseStorageData && purchaseStorageData.purchaseStorageDetailList && firstLoad) {
      this.setState({ storageList: purchaseStorageData.purchaseStorageDetailList, id: purchaseStorageData.id });
      dispatch({ type: 'purchaseStorage/queryBuyerTaskList', payload: { buyerId: purchaseStorageData.buyerId } });
      firstLoad = false;
    }
  }

  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  sendToRight() {
    const { storageList, positionId } = this.state;
    this.state.selectedRowKeys.forEach((key) => {
      const realKey = key.split('__')[0];
      const res = this.props.buyerTaskList.filter(el => el.skuId.toString() === realKey.toString());
      if (res.length > 0) {
        res[0].type = 'add';
        if(!res[0].purchasePrice) {
        		res[0].price = 1;
        } else {
        		res[0].price = res[0].purchasePrice;
        }
        res[0].quantity = typeof (res[0].count) === 'number' && typeof (res[0].inCount === 'number') && (res[0].count - res[0].inCount);
        res[0].shelfNo = positionId;
        storageList.push(res[0]);
      }
    });
    this.setState({ storageList, selectedRowKeys: [] });
    
    this.linstenInputChange();
  }

  // sku拆分
  addRightList(skuId) {
    const { storageList } = this.state;
    let lastIndex = -1;
    storageList.forEach((el, index) => {
      if (el.skuId === skuId) lastIndex = index;
    });
    if (lastIndex >= 0) {
      const newIndex = lastIndex + 1;
      storageList.splice(newIndex, 0, { ...storageList[lastIndex] });
      storageList[newIndex].skuId = generateRandomSkuId(storageList[newIndex].skuId);
      storageList[newIndex].shelfNo = '';
      if (storageList[newIndex].id) delete storageList[newIndex].id;
    }
    this.setState({ storageList });
    
    this.linstenInputChange();
  }

  delRightList(skuId) {
    const p = this;
    let storageList = this.state.storageList;
    for(let i=0; i<storageList.length; i++) {
        if(skuId == storageList[i].skuId) {
            storageList.splice(i--, 1);
        }
    }    
    this.setState({ storageList });
    
    this.linstenInputChange();
  }

  inputChange(type, skuId, value) {
    const storageList = this.state.storageList;
    storageList.forEach((el) => {
      if (el.skuId === skuId) {
        el[type] = typeof value !== 'object' ? value : value.target.value;
      }
    });
    this.setState({ storageList });
    
    this.linstenInputChange();
  }
  
  linstenInputChange() {
  	const p = this;
  	const storageList = this.state.storageList;
    var num = 0;
    var sun = 0
    for(var i = 0;i<storageList.length;i++){
        if(storageList[i].quantity > 0) {
            num += storageList[i].quantity;
        }
        if(storageList[i].transQuantity > 0) {
            sun += storageList[i].transQuantity;
        }
    }
    p.props.purchaseStorageData.totalQuantity = num;
    p.props.purchaseStorageData.totalTransQuantity = sun;
  }

  handleSave(type) {
    const p = this;
    const { form, dispatch } = p.props;
    // TODO: 上传的是skuid
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) { return; }
      const storageList = p.state.storageList;
      if (storageList.length < 1) {
        Modal.error({ title: '请至少添加一项SKU' });
        return;
      }
      let first = true;
      let hasError = false;
      fieldsValue.purchaseStorageDetails = JSON.stringify(storageList.map((el) => {
        const item = {};
        item.skuId = restoreSkuId(el.skuId);
        if (el.id) item.id = el.id;
        if (!first) return false;
        if (!checkPassed(el.price) || !checkPassed(el.shelfNo)) {
          hasError = true;
          Modal.error({ title: '单价、货架号均为必填项' });
          first = false;
          return false;
        } else {
          if (!checkPassed(el.quantity) && !checkPassed(el.transQuantity)) {
            hasError = true;
            Modal.error({ title: '数量、在途数量请至少填写一项' });
            return false;
          }
          item.quantity = el.quantity || 0;
          item.transQuantity = el.transQuantity || 0;
          item.price = el.price;
          if((el.upc==null || el.upc.trim()=='') && el.purchaseUpc ) {
          	item.upc = el.purchaseUpc;
          } else {
          	item.upc = el.upc;
          }
          item.shelfNo = el.shelfNo;
          item.taskDailyDetailId = el.taskDailyDetailId;
          item.taskDailyCount = el.taskDailyCount;
          return item;
        }
      }));

      if (!hasError) {
        fieldsValue.id = p.state.id;
        fieldsValue.storageType = 0;
        delete fieldsValue.stoOrderNo;
        if (type === 'save') {
          dispatch({
            type: fieldsValue.id ? 'purchaseStorage/updateStorage' : 'purchaseStorage/addStorage',
            payload: { fieldsValue },
            cb() { p.closeModal(); },
          });
        } else {
          dispatch({
            type: 'purchaseStorage/confirmStorage',
            payload: { fieldsValue },
            cb() { p.closeModal(); },
          });
        }
      }
    });
  }

  queryBuyerTaskList(buyerId) {
    this.setState({ selectedRowKeys: [] });
    this.props.dispatch({ type: 'purchaseStorage/queryBuyerTaskList', payload: { buyerId } });
  }

  closeModal() {
    const { form, dispatch, close } = this.props;
    form.resetFields();
    dispatch({ type: 'purchaseStorage/toggleShowModal' });
    dispatch({ type: 'purchaseStorage/clearEditInfo' });
    dispatch({ type: 'purchaseStorage/updateBuyerTaskList', payload: { data: [] } });
    this.setState({ selectedRowKeys: [], storageList: [], id: undefined });
    close();
    firstLoad = true;
  }

  queryUpc() {
    const p = this;
    const dom = this.upcInput;
    const input = dom.refs.input;
    const value = input.value;
    if (value) {
      fetch.post('/haierp1/itemSku/queryBySkuCodeOrUpc', { data: { code: value } }).then((res) => {
        if (res.data && res.data.length > 0) {
          res.data[0].skuId = generateRandomSkuId(res.data[0].id);
          res.data[0].id = null;
          const { storageList } = p.state;
          storageList.push(res.data[0]);
          p.setState({ storageList });
          input.value = '';
        } else {
          Modal.info({
            title: '未查找到相关SKU',
            content: '请更换搜索关键词尝试',
          });
        }
      });
    }
  }

  batchSelectPositionNo(value) {
    const { storageList } = this.state;
    if (value) {
      this.setState({ positionId: value });
      storageList.forEach((el) => {
        el.shelfNo = value;
      });
    }
  }

  checkByItem() {
    const { form, dispatch } = this.props;
    const itemName = this.itemName.refs.input.value;
    const buySite = this.buySite.refs.input.value;
    form.validateFields((err, values) => {
      dispatch({
        type: 'purchaseStorage/queryBuyerTaskList',
        payload: {
          buyerId: values.buyerId,
          itemName,
          buySite,
        },
      });
    });
  }

  render() {
    const p = this;
    const { form, title, visible, purchaseStorageData = {}, buyer = [], wareList = [], buyerTaskList = [] } = p.props;
    const { selectedRowKeys, storageList } = p.state;
    const { getFieldDecorator } = form;
    const ARR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const modalProps = {
      visible,
      width: 1280,
      wrapClassName: 'modalStyle',
      okText: '保存',
      title,
      maskClosable: false,
      closable: true,
      footer: (
        <div>
        	<span>
        		预入库总数: <font color='red'>{p.props.purchaseStorageData.totalQuantity}</font>&nbsp;&nbsp;&nbsp;&nbsp;
        	</span>
        	<span>
        		在途总数: <font color='red'>{p.props.purchaseStorageData.totalTransQuantity}</font>&nbsp;&nbsp;&nbsp;&nbsp;
        	</span>
          <Button type="ghost" size="large" onClick={p.closeModal.bind(p)}>取消</Button>
          <Button type="primary" size="large" onClick={p.handleSave.bind(p, 'confirm')}>确认入库</Button>
          <Button type="primary" size="large" onClick={p.handleSave.bind(p, 'save')}>保存入库单</Button>
        </div>
      ),
      onCancel() {
        p.closeModal();
      },
    };

    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
    };

    const columnsTaskList = [
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 50 },
      { title: 'UPC', dataIndex: 'upc', key: 'upc', width: 50 },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 100 },
      { title: '采购站点', dataIndex: 'buySite', key: 'buySite', width: 60 },
      { title: '图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 100,
        render(text) {
          if (!text) return '-';
          const picList = JSON.parse(text).picList;
          const t = picList.length ? JSON.parse(text).picList[0].url : '';
          return (
            t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
              <img role="presentation" src={t} width={60} height={60} />
            </Popover> : '-'
          );
        },
      },
      { title: '颜色', dataIndex: 'color', key: 'color', width: 40 },
      { title: '规格', dataIndex: 'scale', key: 'scale', width: 44 },
      { title: '计划采购数', dataIndex: 'taskDailyCount', key: 'taskDailyCount', width: 60 },
      { title: '已入库数', dataIndex: 'inCount', key: 'inCount', width: 70, render(t) { return t || 0; } },
    ];

    const columnsStorageList = [
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 70 },
      { title: 'UPC',
        dataIndex: 'upc',
        key: 'upc',
        width: 120,
        render(t, r) {
        	if(!t){
        		t= r.purchaseUpc
        	}
          return <Input placeholder="请输入UPC" value={t} onChange={p.inputChange.bind(p, 'upc', r.skuId)} />;
        },
      },
      { title: '扫描UPC',
        dataIndex: 'purchaseUpc',
        key: 'purchaseUpc',
        width: 50,
         render(t, r) {
         	if(t) {
         		if(t == r.upc) {
         			return t;
         		} else {
         			return (<font color="red">{t}</font>);
         		}
         	} else {
         		return '-';
         	}
         }
      },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 100 },
      { title: '采购站点', dataIndex: 'buySite', key: 'buySite', width: 60 },
      { title: '订购站点', dataIndex: 'skuBuysite', key: 'skuBuysite', width: 60 },
      { title: '图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 80,
        render(text) {
          if (!text) return '-';
          const picList = JSON.parse(text).picList;
          const t = picList.length ? JSON.parse(text).picList[0].url : '';
          return (
            t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
              <img role="presentation" src={t} width={60} height={60} />
            </Popover> : '-'
          );
        },
      },
      { title: '颜色', dataIndex: 'color', key: 'color', width: 50 },
      { title: '规格', dataIndex: 'scale', key: 'scale', width: 50 },
      { title: '已入库数', dataIndex: 'inCount', key: 'inCount', width: 60, render(t) { return t || 0; } },
      { title: '计划采购数', dataIndex: 'count', key: 'count', width: 60, render(t, r) { return t || r.taskDailyCount; } },
      { title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 70,
        render(t, r) {
          return <InputNumber min={0} step="1" placeholder="请输入" value={t > 0 ? t : 0} onChange={p.inputChange.bind(p, 'quantity', r.skuId)} />;
        },
      },
      { title: '在途数量',
        dataIndex: 'transQuantity',
        key: 'transQuantity',
        width: 70,
        render(t, r) {
          return <InputNumber min={0} step="1" placeholder="请输入" value={t} onChange={p.inputChange.bind(p, 'transQuantity', r.skuId)} />;
        },
      },
      { title: '真实采购价',
        dataIndex: 'price',
        key: 'price',
        width: 90,
        render(t, r) {
          return <InputNumber min={0} step="0.01" placeholder="请输入" value={t} onChange={p.inputChange.bind(p, 'price', r.skuId)} />;
        },
      },
      { title: '原价',
        dataIndex: 'costPrice',
        key: 'costPrice',
        width: 90
      },
      { title: '折扣率',
        dataIndex: 'discount',
        key: 'discount',
        width: 90
      },
      { title: '折后价格',
        dataIndex: 'purchasePrice',
        key: 'purchasePrice',
        width: 90
      },
      { title: '货架号',
        dataIndex: 'shelfNo',
        key: 'shelfNo',
        width: 80,
        render(t, r) {
          return <Input placeholder="请输入" value={t} onChange={p.inputChange.bind(p, 'shelfNo', r.skuId)} />;
        },
      },
      { title: '操作',
        dataIndex: 'op',
        key: 'op',
        width: 50,
        render(t, r) {
          return (
            <span>
              <a href="javascript:void(0)" onClick={p.addRightList.bind(p, r.skuId)}>拆分</a>
              <br/>
              <a href="javascript:void(0)" onClick={p.delRightList.bind(p, r.skuId)}>删除</a>
            </span>
          );
        },
      },
    ];

    const storageListMapKeys = storageList.map(el => parseInt(el.skuId && el.skuId.toString().split('__')[0], 10));

    const filteredBuyerTask = buyerTaskList ? buyerTaskList.filter(el => storageListMapKeys.indexOf(el.skuId) === -1) : [];

    return (
      <Modal {...modalProps}>
        <Form>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="选择买手"
                {...formItemLayout}
              >
                {getFieldDecorator('buyerId', {
                  initialValue: toString(purchaseStorageData.buyerId, 'SELECT'),
                  rules: [{ required: true, message: '请选择买手' }],
                })(
                  <Select placeholder="请选择买手" optionLabelProp="title" onChange={this.queryBuyerTaskList.bind(this)}>
                    {buyer.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem
                label="仓库"
                {...formItemLayout}
              >
                {getFieldDecorator('warehouseId', {
                  initialValue: toString(purchaseStorageData.warehouseId, 'SELECT'),
                  rules: [{ required: true, message: '请选择仓库' }],
                })(
                  <Select placeholder="请选择仓库" optionLabelProp="title">
                    {wareList.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="备注"
                {...formItemLayout}
              >
                {getFieldDecorator('remark', {
                  initialValue: toString(purchaseStorageData.remark),
                })(
                  <Input placeholder="请填写备注" />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={40}>
            <Col span="12">
              <div className={styles.blockTitle}>采购明细</div>
              <Row style={{ margin: '10px 0' }}>
                <Col span="8"><Input placeholder="请输入商品名称" size="large" ref={(c) => { this.itemName = c; }} /></Col>
                <Col span="4"><Input placeholder="采购站点" size="large" style={{ marginLeft: 10 }} ref={(c) => { this.buySite = c; }} /></Col>
                <Col span="5"><Button type="primary" size="large" style={{ float: 'left', marginLeft: 20 }} onClick={p.checkByItem.bind(p)}>查询</Button></Col>
                <Col span="3"><Button type="primary" size="large" style={{ float: 'right' }} onClick={this.sendToRight.bind(this)} disabled={selectedRowKeys.length < 1}>移到右边</Button></Col>
              </Row>
              <Table columns={columnsTaskList} bordered scroll={{ x: '130%', y: 500 }} dataSource={filteredBuyerTask} rowKey={r => `${r.skuId}__${r.taskDailyDetailId}`} rowSelection={rowSelection} pagination={false} />
            </Col>
            <Col span="12">
              <div className={styles.blockTitle}>入库明细</div>
              <Row style={{ margin: '10px 0' }}>
                <Col span="12"><Input placeholder="请输入SKU代码或UPC码添加" size="large" ref={(c) => { this.upcInput = c; }} /></Col>
                <Col span="3" style={{ marginLeft: 10 }}><Button type="primary" size="large" onClick={this.queryUpc.bind(this)}>添加</Button></Col>
                <Col span="3" style={{ marginTop: 6 }}>批量货架号：</Col>
                <Col span="5">
                  <Select onChange={p.batchSelectPositionNo.bind(p)} placeholder="请选择货架号" size="large">
                    {ARR.map((el) => {
                      return <Option key={`ZT${el}`}>{`ZT${el}`}</Option>;
                    })
                    }
                  </Select>
                </Col>
              </Row>
              <Table columns={columnsStorageList} bordered scroll={{ x: 1450, y: 500 }} dataSource={storageList} rowKey={r => r.originSkuId} pagination={false} />
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(PurchaseModal);
