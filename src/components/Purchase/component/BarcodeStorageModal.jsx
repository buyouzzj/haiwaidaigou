import React, { Component } from 'react';
import { Modal, Button, Input, InputNumber, Select, Row, Col, Table, Form, Popover } from 'antd';
import fetch from '../../../utils/request';
import styles from '../Purchase.less';

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

class BarcodeModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      storageList: [],
      id: undefined,
      positionId: undefined,
    };
  }

  componentWillReceiveProps(...args) {
    const { barcodeStorageData, isShowDetail } = args[0];
    if (!isShowDetail && barcodeStorageData && barcodeStorageData.purchaseStorageDetailList && firstLoad) {
      this.setState({ storageList: barcodeStorageData.purchaseStorageDetailList, id: barcodeStorageData.id });
      firstLoad = false;
    }
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
  }

  delRightList(skuId) {
    const storageList = this.state.storageList;
    this.setState({ storageList: storageList.filter(el => el.skuId !== skuId) || [] });
  }

  inputChange(type, skuId, value) {
    const storageList = this.state.storageList;
    storageList.forEach((el) => {
      if (el.skuId === skuId) {
        el[type] = typeof value !== 'object' ? value : value.target.value;
      }
    });
    this.setState({ storageList });
  }

  handleSave(type) {
    const p = this;
    const { form, dispatch } = p.props;
    // TODO: 上传的是skuid
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      const storageList = p.state.storageList;
      if (storageList.length < 1) {
        Modal.error({ title: '请至少添加一项SKU' });
        return;
      }

      let hasError = false;
      let first = true;
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
          item.upc = el.upc;
          item.shelfNo = el.shelfNo;
          item.taskDailyDetailId = el.taskDailyDetailId;
          item.taskDailyCount = el.taskDailyCount;
          return item;
        }
      }));

      if (!hasError) {
        fieldsValue.id = p.state.id;
        fieldsValue.storageType = 1;
        delete fieldsValue.stoOrderNo;
        if (type === 'save') {
          dispatch({
            type: fieldsValue.id ? 'purchaseStorage/updateStorage' : 'purchaseStorage/addStorage',
            payload: {
              fieldsValue,
            },
            cb() { p.closeModal(); },
          });
        } else {
          dispatch({
            type: 'purchaseStorage/confirmStorage',
            payload: {
              fieldsValue,
            },
            cb() { p.closeModal(); },
          });
        }
      }
    });
  }

  closeModal() {
    const { form, dispatch, close } = this.props;
    form.resetFields();
    dispatch({ type: 'purchaseStorage/toggleBarcodeModal' });
    dispatch({ type: 'purchaseStorage/clearEditInfo' });
    this.setState({ storageList: [], id: undefined });
    firstLoad = true;
    close();
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.queryUpc();
    }
  }

  queryUpc() {
    const p = this;
    const dom = this.upcInput;
    const input = dom.refs.input;
    const value = input.value;
    if (value) {
      fetch.post('/haierp1/itemSku/queryBySkuCodeOrUpc', { data: { code: value } }).then((res) => {
        if (res.data && res.data.length > 0) {
          const obj = res.data[0];
          obj.skuId = generateRandomSkuId(obj.id);
          obj.originSkuId = obj.id;
          obj.id = null;
          if (!obj.purchasePrice) {
          	obj.price = 1;
          } else {
          	obj.price = obj.purchasePrice;
          }
          obj.quantity = 1;
          const { storageList } = p.state;
          if (storageList.length) {
            let first = true;
            storageList.forEach((el) => {
              if (el && el.originSkuId && el.originSkuId.toString() === obj.originSkuId.toString()) {
                el.quantity = el.quantity ? el.quantity + 1 : 2;
                first = false;
              }
            });
            if (first) storageList.push(obj);
          } else {
            storageList.push(obj);
          }
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

  render() {
    const p = this;
    const { form, title, visible, barcodeStorageData = {}, buyer = [], wareList = [] } = p.props;
    const { storageList } = p.state;
    const { getFieldDecorator } = form;
    const ARR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const modalProps = {
      visible,
      width: 980,
      wrapClassName: 'modalStyle',
      okText: '保存',
      title,
      maskClosable: false,
      closable: true,
      footer: (
        <div>
          <Button type="ghost" size="large" onClick={p.closeModal.bind(p)}>取消</Button>
          <Button type="primary" size="large" onClick={p.handleSave.bind(p, 'confirm')}>确认入库</Button>
          <Button type="primary" size="large" onClick={p.handleSave.bind(p, 'save')}>保存入库单</Button>
        </div>
      ),
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal();
      },
    };

    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };

    const columnsStorageList = [
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 70 },
      { title: 'UPC',
        dataIndex: 'upc',
        key: 'upc',
        width: 90,
        render(t, r) {
          return <Input placeholder="请输入UPC" value={t} onChange={p.inputChange.bind(p, 'upc', r.skuId)} />;
        },
      },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 80 },
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
      { title: '颜色', dataIndex: 'color', key: 'color', width: 60 },
      { title: '规格', dataIndex: 'scale', key: 'scale', width: 60 },
      { title: '已入库数', dataIndex: 'inCount', key: 'inCount', width: 80, render(t) { return t || 0; } },
      { title: '计划采购数', dataIndex: 'count', key: 'count', width: 80, render(t, r) { return t || r.taskDailyCount; } },
      { title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 60,
        render(t, r) {
          return <InputNumber min={0} step="1" placeholder="请输入" value={t > 0 ? t : 0} onChange={p.inputChange.bind(p, 'quantity', r.skuId)} />;
        },
      },
      { title: '在途数量',
        dataIndex: 'transQuantity',
        key: 'transQuantity',
        width: 60,
        render(t, r) {
          return <InputNumber min={0} step="1" placeholder="请输入" value={t} onChange={p.inputChange.bind(p, 'transQuantity', r.skuId)} />;
        },
      },
      { title: '单价',
        dataIndex: 'price',
        key: 'price',
        width: 60,
        render(t, r) {
          return <InputNumber min={0} step="0.01" placeholder="请输入" value={t} onChange={p.inputChange.bind(p, 'price', r.skuId)} />;
        },
      },
      { title: '货架号',
        dataIndex: 'shelfNo',
        key: 'shelfNo',
        width: 60,
        render(t, r) {
          return <Input placeholder="请输入" value={t} onChange={p.inputChange.bind(p, 'shelfNo', r.skuId)} />;
        },
      },
      { title: '操作',
        dataIndex: 'op',
        key: 'op',
        width: 80,
        render(t, r) {
          return (
            <span>
              <a href="javascript:void(0)" onClick={p.addRightList.bind(p, r.skuId)}>拆分</a>
              <a style={{ marginLeft: 5 }} href="javascript:void(0)" onClick={p.delRightList.bind(p, r.skuId)}>删除</a>
            </span>
          );
        },
      },
    ];

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
                  initialValue: toString(barcodeStorageData.buyerId, 'SELECT'),
                  rules: [{ required: true, message: '请选择买手' }],
                })(
                  <Select placeholder="请选择买手" optionLabelProp="title">
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
                  initialValue: toString(barcodeStorageData.warehouseId, 'SELECT'),
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
                  initialValue: toString(barcodeStorageData.remark),
                })(
                  <Input placeholder="请填写备注" />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={styles.blockTitle}>入库明细</div>
              <Row style={{ margin: '10px 0' }}>
                <Col span="6"><Input placeholder="请输入SKU代码或UPC码添加" onKeyUp={this.handleKeyUp.bind(this)} size="large" ref={(c) => { this.upcInput = c; }} /></Col>
                <Col span="12" style={{ marginLeft: 10 }}><Button type="primary" size="large" onClick={this.queryUpc.bind(this)}>添加</Button></Col>
                <Col span="2" style={{ marginTop: 6 }}>批量货架号：</Col>
                <Col span="3">
                  <Select onChange={p.batchSelectPositionNo.bind(p)} placeholder="请选择货架号" size="large">
                    {ARR.map((el) => {
                      return <Option key={`ZT${el}`}>{`ZT${el}`}</Option>;
                    })
                    }
                  </Select>
                </Col>
              </Row>
              <Table columns={columnsStorageList} bordered scroll={{ x: '130%', y: 500 }} dataSource={storageList} rowKey={r => r.originSkuId} pagination={false} />
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(BarcodeModal);
