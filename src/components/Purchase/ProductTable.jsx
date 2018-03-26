import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, DatePicker, InputNumber, Modal, Select, Button, Form, Table, Row, Col, Popconfirm, Popover, Tabs, message } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';

import fetch from '../../utils/request';

moment.locale('zh-cn');

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

let latestSearch = {};

let isAdditional = false; // 是否追加
let isOperating = false; // 是否正在添加

class ProductTable extends Component {
  constructor() {
    super();
    this.state = {
      skuData: undefined,
      previewImage: '',
      previewVisible: false,
      selectedSku: [],
      timeQuery: {},
      skuSearchType: 'product', // 是按产品查询还是订单查询
    };
  }

  componentWillReceiveProps(...args) {
    if (args[0].data && args[0].data.length > 0 && this.state.skuData === undefined) {
      this.setState({
        skuData: args[0].data.map((el, index) => {
          el.key = index + 1;
          return el;
        }),
      });
    }
  }

  getValue(callback) {
    const { form } = this.props;
    const skuList = [];
    form.validateFieldsAndScroll((err, fieldsSku) => {
      if (err) { return; }
      let count = 1;
      const keys = Object.keys(fieldsSku);
      for (let i = 1; i < keys.length; i += 1) {
        if (`r_${count}_skuCode` in fieldsSku) {
          const skuSingle = {};
          keys.forEach((key) => {
            if (key.match(`r_${count}_`)) {
              skuSingle[key.split(`r_${count}_`)[1]] = fieldsSku[key];
            }
          });
          skuSingle.taskStartTime = moment(skuSingle.taskStartTime).format('YYYY-MM-DD');
          skuSingle.taskEndTime = moment(skuSingle.taskEndTime).format('YYYY-MM-DD');
          if (!skuSingle.id) delete skuSingle.id;
          if (skuSingle.skuPic) delete skuSingle.skuPic;
          skuList.push(skuSingle);
          count += 1;
        } else count += 1;
      }
      if (skuList.length < 1) {
        message.error('请至少填写一项SKU信息');
        return;
      }
      if (callback) callback(skuList);
    });
  }

  addProduct(num) {
    let { skuData } = this.state;
    if (!skuData) skuData = [];
    const skuLen = skuData ? skuData.length : 0;
    const lastId = skuLen < 1 ? 0 : skuData[skuData.length - 1].key;
    const looptime = typeof num === 'number' ? num : 1;

    let currentId = parseInt(lastId, 10);
    for (let i = 0; i < looptime; i += 1) {
      currentId += 1;
      const newId = currentId;
      const newItem = {
        id: '',
        key: newId,
        skuCode: '',
        skuId: '',
        itemName: '',
        color: '',
        scale: '',
        salePrice: '',
        freight: '',
        quantity: '',
      };
      skuData.push(newItem);
    }
    this.setState({ skuData }, () => {
      if (typeof num !== 'boolean') {
        setTimeout(() => {
          this[`r_${currentId}_skuCode`].focus();
          this[`r_${currentId}_skuCode`].refs.input.click();
        }, 0);
      }
    });
  }

  batchAddProduct(props) {
    let { skuData } = this.state;
    if (!skuData) skuData = [];
    const skuLen = skuData ? skuData.length : 0;
    const lastId = skuLen < 1 ? 0 : skuData[skuData.length - 1].key;
    const looptime = props.length;

    const batchUpdateFormValues = {};

    let currentId = parseInt(lastId, 10);

    // 本次是否有新增
    let isAddedItem = false;

    // 当前先选择一把
    // 检验重复
    let isDuplicatedFirst = false;
    for (let j = 0; j < skuData.length; j += 1) {
      if (skuData[j].skuCode.toString() === props[0].skuCode.toString()) {
        isDuplicatedFirst = true;
        break;
      }
    }
    if (!isDuplicatedFirst) {
      // 不重复则先新增第一个
      if (isAdditional) {
        this.addProduct(true);
        currentId += 1;
        props.forEach((prop) => {
          prop.key += 1;
        });
        props[0].key = skuData[skuData.length - 1].key;
      }

      isAddedItem = true;
      this.props.skuList.forEach((value) => {
        if (value.skuCode.toString() === props[0].skuCode.toString()) {
          skuData.forEach((el) => {
            if (el.key.toString() === props[0].key.toString()) {
              el.skuId = value.id;
              el.skuCode = value.skuCode;
              el.skuPic = value.skuPic;
              el.purchaseNeed = value.purchaseNeed || undefined;
            }
          });
          batchUpdateFormValues[`r_${props[0].key}_skuId`] = value.id;
          batchUpdateFormValues[`r_${props[0].key}_skuCode`] = value.skuCode;
          batchUpdateFormValues[`r_${props[0].key}_count`] = value.purchaseNeed;
        }
      });
    }

    // 再进行追加
    for (let i = 1; i < looptime; i += 1) {
      // 检验重复
      let isDuplicated = false;
      for (let j = 0; j < skuData.length; j += 1) {
        if (skuData[j].skuCode.toString() === props[i].skuCode.toString()) {
          isDuplicated = true;
          break;
        }
      }
      if (!isDuplicated) {
        isAddedItem = true;

        currentId += 1;
        const newId = skuData[skuData.length - 1].key + 1;
        const newItem = {
          id: '',
          key: newId,
          skuCode: '',
          skuId: '',
          itemName: '',
          color: '',
          scale: '',
          salePrice: '',
          freight: '',
          quantity: '',
        };

        this.props.skuList.forEach((value) => {
          if (value.skuCode.toString() === props[i].skuCode.toString()) {
            newItem.skuId = value.id;
            newItem.skuCode = value.skuCode;
            newItem.skuPic = value.skuPic;
            newItem.purchaseNeed = value.purchaseNeed || undefined;

            batchUpdateFormValues[`r_${newId}_skuId`] = value.id;
            batchUpdateFormValues[`r_${newId}_skuCode`] = value.skuCode;
            batchUpdateFormValues[`r_${newId}_count`] = value.purchaseNeed;
          }
        });

        skuData.push(newItem);
      }
    }

    this.setState({ skuData }, () => {
      this.props.form.setFieldsValue(batchUpdateFormValues);
      setTimeout(() => {
        // this[`r_${key}_skuCode`].refs.input.click();
        setTimeout(() => {
          // this.clearSelectedSku();
          this.setState({ selectedSku: [] }, () => { isOperating = false; });
          if (isAddedItem) isAdditional = true;
        }, 300);
      }, 0);
    });
  }

  handleDelete(key) {
    const newData = this.state.skuData.filter(el => el.key !== key);
    this.setState({ skuData: newData });
  }

  handleSelect(key, skuCode) {
    const { form, skuList } = this.props;
    let { skuData } = this.state;
    if (!skuData) skuData = [];

    const source = skuList;

    // 检验重复
    let isDuplicatedFirst = false;
    for (let j = 0; j < skuData.length; j += 1) {
      if (skuData[j].skuCode.toString() === skuCode.toString()) {
        isDuplicatedFirst = true;
        break;
      }
    }

    if (!isDuplicatedFirst) {
      // 不重复则先新增第一个
      if (isAdditional) {
        this.addProduct(1);
        key = skuData[skuData.length - 1].key;
      }

      isAdditional = true;

      source.forEach((value) => {
        if (value.skuCode.toString() === skuCode.toString()) {
          skuData.forEach((el) => {
            if (el.key.toString() === key.toString()) {
              el.skuId = value.id;
              el.skuCode = value.skuCode;
              el.skuPic = value.skuPic;
              el.purchaseNeed = value.purchaseNeed || undefined;
              el.color = value.color;
              el.scale = value.scaleInt;
            }
          });
          this.setState({ skuData }, () => {
            form.setFieldsValue({
              [`r_${key}_skuId`]: value.id,
              [`r_${key}_skuCode`]: value.skuCode,
              [`r_${key}_count`]: value.purchaseNeed,
              [`r_${key}_color`]: value.color,
              [`r_${key}_scaleInt`]: value.scale,
            });
          });
        }
      });
    }
  }

  handleSearch(key, value) {
    this.setState({ selectedSku: [], skuSearchType: 'product' }, () => {
      latestSearch = { ...value };
      this.props.dispatch({
        type: 'sku/querySkuList2',
        payload: { ...value, pageIndex: 1 },
      });
    });
  }

  clearValue() {
    const { form } = this.props;
    this.setState({ skuData: undefined }, () => {
      form.resetFields();
    });
  }

  handleCancel() {
    this.setState({ previewVisible: false });
  }

  handleBigPic(value) {
    if (value) {
      this.setState({
        previewVisible: true,
        previewImage: value,
      });
    }
  }

  checkPrice(type, r, rules, value, cb) {
    const { getFieldValue } = this.props.form;
    switch (type) {
      case 'taskPrice':
        if (getFieldValue(`r_${r.key}_taskMaxPrice`) && getFieldValue(`r_${r.key}_taskMaxPrice`) < value) cb('参考采购价必须小于参考最大采购价'); else cb(); break;
      case 'taskMaxPrice':
        if (getFieldValue(`r_${r.key}_taskPrice`) && getFieldValue(`r_${r.key}_taskPrice`) > value) cb('参考最大采购价必须大于参考采购价'); else cb(); break;
      default: cb();
    }
  }

  checkCount(type, r, rules, value, cb) {
    const { getFieldValue } = this.props.form;
    switch (type) {
      case 'count': {
        if (!getFieldValue(`r_${r.key}_count`)) {
          cb('此项必填');
        } else if (getFieldValue(`r_${r.key}_taskMaxCount`) && getFieldValue(`r_${r.key}_taskMaxCount`) < value) cb('参考采购数量必须小于参考最大采购数量'); else cb(); break;
      }
      case 'taskMaxCount':
        if (getFieldValue(`r_${r.key}_count`) && getFieldValue(`r_${r.key}_count`) > value) cb('参考最大采购数量必须大于参考采购数量'); else cb(); break;
      default: cb();
    }
  }

  disabledEndTime(key, value) {
    const { getFieldValue } = this.props.form;
    const startTime = getFieldValue(`r_${key}_taskStartTime`);
    if (!startTime || !value) return false;
    return value.valueOf() < startTime.valueOf();
  }

  clearSelectedSku(visible) {
    if (!visible) {
      this.setState({ selectedSku: [] });
      isAdditional = false;
      isOperating = false;
    }
  }

  changeTimeQuery(key, param, value) {
    const { timeQuery } = this.state;
    if (!timeQuery[key]) {
      timeQuery[key] = {};
    }
    timeQuery[key][param] = value;
    this.setState({ timeQuery });
  }

  render() {
    const p = this;
    const { form, skuList = [], parent, buyer = [], defaultBuyer, defaultStartTime, defaultEndTime, total, currentPage, pageSize } = p.props;
    const { skuData, previewImage, previewVisible, skuSearchType } = p.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    // 注册props
    if (!parent.clearSkuValue) parent.clearSkuValue = this.clearValue.bind(this);
    if (!parent.getSkuValue) parent.getSkuValue = this.getValue.bind(this);

    function renderSkuPopover(list, key, skuTotal) {
      let skuCode = null;
      let itemName = null;
      let productName = null;
      let buySite = null;
      let buySiteOrder = null;

      function handleEmpty() {
        skuCode.refs.input.value = '';
        itemName.refs.input.value = '';
        productName.refs.input.value = '';
        buySite.refs.input.value = '';
        buySiteOrder.refs.input.value = '';
      }

      function doSearch() {
        p.handleSearch(key,
          { skuCode: skuCode.refs.input.value,
            itemName: itemName.refs.input.value,
            buySite: buySite.refs.input.value,
            isOrderQuery: 0,
          });
        p.setState({ skuSearchType: 'product' });
      }

      function doSearchOrder() {
        const params = {};
        params.itemName = productName.refs.input.value;
        params.buySite = buySiteOrder.refs.input.value;
        p.handleSearch(key, { ...params, isOrderQuery: 1 });
        p.setState({ skuSearchType: 'order' });
      }

      function updateValue(sku) {
        if (skuSearchType === 'order' && sku.purchaseNeed <= 0) {
          message.info('不能选择当前采购数量等于或者小于0的sku');
          return;
        }
        p.handleSelect(key, sku.skuCode);
        setTimeout(() => {
          p[`r_${key}_skuCode`].refs.input.click();
        }, 0);
      }

      function batchSelectSku() {
        if (!isOperating) {
          isOperating = true;
          const { selectedSku } = p.state;
          const batchSelectParams = [];
          setTimeout(() => {
            let j = -1;
            for (let i = 0; i < selectedSku.length; i += 1) {
              if (skuSearchType === 'order' && selectedSku[i].purchaseNeed <= 0) {
                message.info('不能选择当前采购数量等于或者小于0的sku');
                continue;
              }
              j += 1;

              batchSelectParams.push({ key: key + j, skuCode: selectedSku[i].skuCode });
              // if (j === 0 && !(skuSearchType === 'order' && selectedSku[i].purchaseNeed <= 0)) {
              //   setTimeout(() => { updateValue(selectedSku[i]); }, 0);
              // } else {
              //   p.addProduct(1);
              //   p.handleSelect(key + j, selectedSku[i].skuCode);
              // }
            }
            if (batchSelectParams.length > 0) p.batchAddProduct(batchSelectParams, key);
            else isOperating = false;
          }, 0);
        }
      }

      function createTaskOrder() {
        fetch.get('/haierp1/purchase/createTaskDailyOrder').then((res) => {
          if (res.success) message.success('计算成功');
        });
      }

      const paginationProps = {
        defaultPageSize: 20,
        pageSize,
        showSizeChanger: true,
        total: skuTotal,
        current: currentPage,
        showQuickJumper: true,
        pageSizeOptions: ['20', '50', '100', '200', '500'],
        onShowSizeChange(current, size) {
          p.props.dispatch({
            type: 'sku/querySkuList2',
            payload: {
              pageIndex: current,
              pageSize: size,
              ...latestSearch,
              // skuCode: skuCode.refs.input.value,
              // itemName: itemName.refs.input.value,
            },
          });
        },
        onChange(page) {
          p.props.dispatch({
            type: 'sku/querySkuList2',
            payload: {
              pageIndex: page,
              pageSize,
              ...latestSearch,
              // skuCode: skuCode.refs.input.value,
              // itemName: itemName.refs.input.value,
            },
          });
        },
      };

      const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          p.setState({ selectedSku: selectedRows });
        },
        selectedRowKeys: p.state.selectedSku.map(sku => sku.id),
      };

      const columns = [
        { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 90 },
        { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 90 },
        { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
        { title: '采购站点', dataIndex: 'buySite', key: 'buySite', width: 80 },
        { title: '所属分类', dataIndex: 'categoryName', key: 'categoryName', width: 75, render(text) { return text || '-'; } },
        { title: '图片',
          dataIndex: 'skuPic',
          key: 'skuPic',
          width: 80,
          render(text) { // 需要解决返回的skuPic的格式的问题
            let imgUrl = '';
            try {
              const imgObj = JSON.parse(text);
              imgUrl = imgObj.picList[0].url;
              const picContent = <img src={imgUrl} role="presentation" style={{ height: 600 }} />;
              return (
                <Popover title="主图预览" content={picContent}>
                  <img src={imgUrl} role="presentation" width="60" />
                </Popover>
              );
            } catch (e) {
              return '-';
            }
          },
        },
        { title: '颜色', dataIndex: 'color', key: 'color', width: 60, render(text) { return text || '-'; } },
        { title: '尺寸', dataIndex: 'scale', key: 'scale', width: 60, render(text) { return text || '-'; } },
        // { title: '价格', dataIndex: 'salePrice', key: 'salePrice', width: '6%', render(text) { return text || '-'; } },
        { title: '订单所需库存', dataIndex: 'saleNeed', key: 'saleNeed', width: 60, render(text) { return text || '-'; } },
        { title: '当前采购数量', dataIndex: 'purchaseNeed', key: 'purchaseNeed', width: 60, render(text) { return text || '-'; } },
        { title: '现货库存', dataIndex: 'inventory', key: 'inventory', width: 45, render(text) { return text || '-'; } },
        { title: '在途库存', dataIndex: 'transInv', key: 'transInv', width: 45, render(text) { return text || '-'; } },
        { title: '现货占用', dataIndex: 'lockedInv', key: 'lockedInv', width: 45, render(text) { return text || '-'; } },
        { title: '在途占用', dataIndex: 'lockedTransInv', key: 'lockedTransInv', width: 45, render(text) { return text || '-'; } },
        // { title: '重量(磅)', dataIndex: 'weight', key: 'weight', width: '8%', render(text) { return text || '-'; } },
        { title: '操作', dataIndex: 'oper', fixed: 'right', key: 'oper', width: 60, render(t, r) { return <a onClick={() => { updateValue(r); }}>选择</a>; } },
      ];

      return (
        <div style={{ width:970}}>
          <Tabs size="small">
            <TabPane tab="按商品查询" key="1">
              <Row gutter={20} style={{ width: 970 }}>
                <Col span="6">
                  <FormItem
                    label="SKU代码"
                    {...formItemLayout}
                  >
                    <Input
                      size="default"
                      placeholder="请输入SKU代码"
                      ref={(c) => { skuCode = c; }}
                    />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem
                    label="商品名称"
                    {...formItemLayout}
                  >
                    <Input
                      size="default"
                      placeholder="请输入商品名称"
                      ref={(c) => { itemName = c; }}
                    />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem
                    label="采购站点"
                    {...formItemLayout}
                  >
                    <Input
                      size="default"
                      placeholder="请输入采购站点"
                      ref={(c) => { buySite = c; }}
                    />
                  </FormItem>
                </Col>
                <Col className="listBtnGroup" span="4" style={{ paddingTop: 2 }}>
                  <Button type="primary" onClick={doSearch}>查询</Button>
                  <Button type="ghost" onClick={handleEmpty}>清空</Button>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="按订单查询" key="2">
              <Row gutter={20} style={{ width: '100%' }}>
                <Col span="7">
                  <FormItem
                    label="商品名称"
                    {...formItemLayout}
                  >
                    <Input
                      size="default"
                      placeholder="请输入商品名称"
                      ref={(c) => { productName = c; }}
                    />
                  </FormItem>
                </Col>
                <Col span="6">
                  <FormItem
                    label="采购站点"
                    {...formItemLayout}
                  >
                    <Input
                      size="default"
                      placeholder="请输入采购站点"
                      ref={(c) => { buySiteOrder = c; }}
                    />
                  </FormItem>
                </Col>
                <Col className="listBtnGroup" span="10" style={{ paddingTop: 2, marginLeft: 10 }}>
                  <Button type="primary" onClick={doSearchOrder}>查询</Button>
                  <Button type="ghost" onClick={createTaskOrder}>根据当前订单重新计算采购值</Button>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
          <Row>
            <Button type="primary" onClick={batchSelectSku} style={{ position: 'absolute', bottom: 10, left: 0 }} disabled={p.state.selectedSku.length === 0}>批量添加</Button>
            <Table
              columns={columns}
              dataSource={list}
              size="small"
              bordered
              rowSelection={rowSelection}
              rowKey={record => record.id}
              pagination={paginationProps}
              scroll={{ x: 1100, y: 400 }}
            />
          </Row>
        </div>
      );
    }

    const modalTableProps = {
      columns: [
        { title: <font color="#00f">商品SKU</font>,
          dataIndex: 'skuCode',
          key: 'skuCode',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_skuCode`, {
                  initialValue: t || undefined,
                  rules: [{ required: true, message: '该项必填' }],
                })(
                  <Popover
                    overlayStyle={{ width: 1000 }}
                    content={renderSkuPopover(skuList, r.key, total)}
                    title="搜索SKU"
                    trigger="click"
                    onVisibleChange={p.clearSelectedSku.bind(p)}
                  >
                    <Input onFocus={p.handleSearch.bind(p, r.key, {})} placeholder="请搜索" ref={(c) => { p[`r_${r.key}_skuCode`] = c; }} value={t || undefined} />
                  </Popover>,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">买手</font>,
          dataIndex: 'buyerId',
          key: 'buyerId',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_buyerId`, {
                  initialValue: t ? t.toString() : defaultBuyer,
                  rules: [{ required: true, message: '该项必选' }],
                })(
                  <Select placeholder="请选择" optionLabelProp="title">
                    {buyer.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">参考采购价</font>,
          dataIndex: 'taskPrice',
          key: 'taskPrice',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_taskPrice`, {
                  initialValue: t || undefined,
                  rules: [{ validator: p.checkPrice.bind(p, 'taskPrice', r) }],
                })(
                  <InputNumber step={0.01} placeholder="请输入" />,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">参考最大采购价</font>,
          dataIndex: 'taskMaxPrice',
          key: 'taskMaxPrice',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_taskMaxPrice`, {
                  initialValue: t || undefined,
                  rules: [{ validator: p.checkPrice.bind(p, 'taskMaxPrice', r) }],
                })(
                  <InputNumber step={0.01} placeholder="请输入" />,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">采购方式</font>,
          dataIndex: 'mode',
          key: 'mode',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_mode`, {
                  initialValue: typeof t !== 'undefined' ? t.toString() : '1',
                  rules: [{ required: true, message: '该项必填' }],
                })(
                  <Select placeholder="请选择" >
                    <Option value="0">线上</Option>
                    <Option value="1">线下</Option>
                  </Select>,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">采购数量</font>,
          dataIndex: 'count',
          key: 'count',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_count`, {
                  initialValue: t,
                  rules: [{ validator: p.checkCount.bind(p, 'count', r) }],
                })(
                  <InputNumber step={1} placeholder="请输入" />,
                )}
              </FormItem>);
          },
        },
        { title: <font color="#00f">参考最大采购数量</font>,
          dataIndex: 'taskMaxCount',
          key: 'taskMaxCount',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_taskMaxCount`, {
                  initialValue: t || undefined,
                  rules: [{ validator: p.checkCount.bind(p, 'taskMaxCount', r) }],
                })(
                  <InputNumber placeholder="请输入" />,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">颜色</font>,
          dataIndex: 'color',
          key: 'color',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_color`, {
                  initialValue: t,
                  //rules: [{ validator: p.checkCount.bind(p, 'color', r) }],
                })(
                  <Input disabled step={1} placeholder="请输入" />,
                )}
              </FormItem>);
          },
        },
        { title: <font color="#00f">尺寸</font>,
          dataIndex: 'scaleInt',
          key: 'scaleInt',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_scaleInt`, {
                  initialValue: t,
                  //rules: [{ validator: p.checkCount.bind(p, 'color', r) }],
                })(
                  <Input disabled step={1} placeholder="请输入" />,
                )}
              </FormItem>);
          },
        },
/*       { title: <font color="#00f">任务开始时间</font>,
          dataIndex: 'taskStartTime',
          key: 'taskStartTime',
          width: '12%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_taskStartTime`, {
                  initialValue: t ? moment(t, 'YYYY-MM-DD') : (defaultStartTime || moment(new Date(), 'YYYY-MM-DD')),
                  rules: [{ required: true, message: '该项必填' }],
                })(
                  <DatePicker />,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">任务结束时间</font>,
          dataIndex: 'taskEndTime',
          key: 'taskEndTime',
          width: '12%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_taskEndTime`, {
                  initialValue: t ? moment(t, 'YYYY-MM-DD') : defaultEndTime,
                  rules: [{ required: true, message: '该项必填' }],
                })(
                  <DatePicker disabledDate={p.disabledEndTime.bind(p, r.key)} />,
                )}
              </FormItem>
            );
          },
        },*/
        { title: <font color="#00f">说明</font>,
          dataIndex: 'remark',
          key: 'remark',
          width: '8.5%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_remark`, {
                  initialValue: t || '0',
                  rules: [{ required: true, message: '该项必选' }],
                })(
                  <Select>
                    <Option value="0">买手采购</Option>
                    <Option value="1">仓库调货</Option>
                  </Select>,
                )}
                {getFieldDecorator(`r_${r.key}_skuId`, {
                  initialValue: r.skuId || undefined,
                })(
                  <Input placeholder="请搜索" ref={(c) => { p[`r_${r.key}_skuId`] = c; }} style={{ display: 'none' }} />,
                )}
                {getFieldDecorator(`r_${r.key}_id`, {
                  initialValue: r.id,
                })(
                  <Input placeholder="请搜索" ref={(c) => { p[`r_${r.key}_id`] = c; }} style={{ display: 'none' }} />,
                )}
              </FormItem>
            );
          },
        },
        { title: <font color="#00f">图片</font>,
          dataIndex: 'skuPic',
          key: 'skuPic',
          width: '8.5%',
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
        { title: '操作',
          key: 'operator',
          render(t, record) {
            return (<Popconfirm title="确定删除?" onConfirm={p.handleDelete.bind(p, record.key)}>
              <a href="javascript:void(0)">删除</a>
            </Popconfirm>);
          },
        },
      ],
      dataSource: skuData,
      bordered: false,
      pagination: false,
      scroll: {
        y: 500,
      },
    };
    return (
      <div>
        <Row style={{ paddingBottom: 10 }}>
          <Col span={21}>
            <span>采购明细信息（<font color="#00f">蓝色列可编辑</font>）</span>
          </Col>
          <Col span={3}>
            <Button type="primary" onClick={p.addProduct.bind(p)}>添加商品</Button>
          </Col>
        </Row>
        <Table {...modalTableProps} rowKey={record => record.key} />
        <Modal visible={previewVisible} title="预览图片" footer={null} onCancel={this.handleCancel.bind(this)}>
          <img role="presentation" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>);
  }
}

function mapStateToProps(state) {
  const { skuList, skuTotal, currentPage, pageSize } = state.sku;
  return {
    skuList,
    total: skuTotal,
    currentPage,
    pageSize,
  };
}

export default connect(mapStateToProps)(Form.create()(ProductTable));
