import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Button, Form, Table, Row, Col, Popover, Popconfirm, Modal, message } from 'antd';

const FormItem = Form.Item;

class ProductTable extends Component {
  constructor() {
    super();
    this.state = {
      skuData: [],
      popoverVisible: false,
      skuQuery: {},
    };
  }

  componentWillReceiveProps(...args) {
    if (args[0].data && args[0].data.length > 0 && this.state.skuData.length === 0) {
      this.setState({
        skuData: args[0].data.map((el, index) => {
          el.key = index + 1;
          return el;
        }),
      });
    }
  }

  getValue(callback) {
    const p = this;
    const { form } = this.props;
    const skuList = [];
    form.validateFields((err, fieldsSku) => {
      if (err) return;
      const keys = Object.keys(fieldsSku);
      const countKeys = {};
      keys.forEach((key) => {
        const num = key.split('r_')[1].split('_')[0];
        if (!countKeys[num]) countKeys[num] = true;
      });
      Object.keys(countKeys).forEach((count) => {
        const skuSingle = {};
        keys.forEach((key) => {
          if (key.match(`r_${count}_`)) {
            skuSingle[key.split(`r_${count}_`)[1]] = fieldsSku[key];
          }
        });
        // 补一下skuCode
        if (!skuSingle.skuCode) {
          skuSingle.skuCode = p[`r_${count}_skuCode_dom`].refs.input.value;
        }
        if (skuSingle.skuPic) delete skuSingle.skuPic;
        if (skuSingle.classicalId) {
          skuSingle.id = skuSingle.classicalId;
        }
        delete skuSingle.classicalId;
        skuList.push(skuSingle);
      });
      if (skuList.length < 1) {
        message.error('请至少填写一项商品信息');
        return;
      }
      if (callback) callback(skuList);
    });
  }

  addProduct() {
    const { skuData } = this.state;
    const skuLen = skuData.length;
    const lastId = skuLen < 1 ? 0 : skuData[skuData.length - 1].key;
    const newId = parseInt(lastId, 10) + 1;
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
    this.setState({ skuData }, () => {
      setTimeout(() => {
        this[`r_${newId}_skuCode_dom`].refs.input.click();
      }, 0);
    });
  }

  handleDelete(key) {
    const newData = this.state.skuData.filter(el => el.key !== key);
    this.setState({ skuData: newData });
  }

  handleSelect(key, skuCode) {
    const { form, skuList } = this.props;
    const { skuData } = this.state;

    const source = skuList;

    // 先判断当前列表是否有相同的skuCode，有的话数量+1
    let isDuplicate = false;
    let quantity = 0;
    skuData.forEach((el, index) => {
      if (el.skuCode === skuCode) {
        isDuplicate = index + 1;
        quantity = el.quantity += 1;
      }
    });
    if (isDuplicate) {
      this.setState({ skuData }, () => {
        form.setFieldsValue({
          [`r_${isDuplicate}_quantity`]: quantity,
        });
      });
      Modal.info({
        title: '选择了列表已有的SKU',
        content: '已为您增加销售数量',
      });
      return;
    }

    // 否则新建一条记录
    source.forEach((value) => {
      if (value.skuCode.toString() === skuCode.toString()) {
        skuData.forEach((el) => {
          if (el.key.toString() === key.toString()) {
            el.skuCode = value.skuCode;
            el.skuId = value.skuId;
            el.itemName = value.itemName;
            el.color = value.color;
            el.scale = value.scale;
            el.freight = value.freightStr;
            el.salePrice = value.salePrice || 0;
            el.quantity = value.quantity || 1;
            el.skuPic = value.skuPic;
            el.classicalId = ''; // 重置条目id
          }
        });
        this.setState({ skuData }, () => {
          form.setFieldsValue({
            [`r_${key}_skuCode`]: value.skuCode,
            [`r_${key}_skuId`]: value.id,
            [`r_${key}_itemName`]: value.itemName,
            [`r_${key}_color`]: value.color,
            [`r_${key}_scale`]: value.scale,
            [`r_${key}_freight`]: value.freightStr,
            [`r_${key}_salePrice`]: value.salePrice || 0,
            [`r_${key}_quantity`]: value.quantity || 1,
            [`r_${key}_classicalId`]: '', // 重置条目id
          });
        });
      }
    });
  }

  handleSearch(num, size) {
    const { skuQuery } = this.state;
    const payload = { ...skuQuery, pageIndex: typeof num === 'number' ? num : 1 };
    if (typeof size === 'number') payload.pageSize = size;
    this.props.dispatch({
      type: 'sku/querySkuList',
      payload,
    });
  }

  clearValue() {
    const { form } = this.props;
    this.setState({ skuData: [] }, () => {
      form.resetFields();
    });
  }

  render() {
    const p = this;
    const { form, skuList = [], parent, total, pageSize } = p.props;
    const { skuData, skuQuery } = p.state;
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
      let color = null;

      function doSearch() {
        skuQuery.skuCode = skuCode.refs.input.value;
        skuQuery.itemName = itemName.refs.input.value;
        skuQuery.color = color.refs.input.value;
        p.setState({ skuQuery }, () => {
          p.handleSearch();
        });
      }

      function updateValue(selectedSkuCode) {
        p.handleSelect(key, selectedSkuCode);
        setTimeout(() => {
          p[`r_${key}_skuCode_dom`].refs.input.click();
        }, 0);
      }

      const paginationProps = {
        defaultPageSize: 20,
        showSizeChanger: true,
        total: skuTotal,
        showQuickJumper: true,
        pageSizeOptions: ['20', '30', '50', '100'],
        onShowSizeChange(current, size) {
          p.props.dispatch({
            type: 'sku/querySkuList',
            payload: {
              pageIndex: current,
              pageSize: size,
            },
          });
        },
        onChange(page) {
          p.handleSearch(page, pageSize);
        },
      };

      const columns = [
        { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: '10%' },
        { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: '14%' },
        { title: '品牌', dataIndex: 'brand', key: 'brand', width: '8%' },
        { title: '所属分类', dataIndex: 'categoryName', key: 'categoryName', width: '8%', render(text) { return text || '-'; } },
        { title: '尺寸', dataIndex: 'scale', key: 'scale', width: '6%', render(text) { return text || '-'; } },
        { title: '价格', dataIndex: 'salePrice', key: 'salePrice', width: '6%', render(text) { return text || '-'; } },
        { title: '图片',
          dataIndex: 'skuPic',
          key: 'skuPic',
          width: '14%',
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
        { title: '颜色', dataIndex: 'color', key: 'color', width: '8%', render(text) { return text || '-'; } },
        { title: '虚拟库存', dataIndex: 'virtualInv', key: 'virtualInv', width: '8%', render(text) { return text || '-'; } },
        { title: '重量(磅)', dataIndex: 'weight', key: 'weight', width: '8%', render(text) { return text || '-'; } },
        { title: '操作', dataIndex: 'oper', key: 'oper', width: '8%', render(t, r) { return <a onClick={() => { updateValue(r.skuCode); }}>选择</a>; } },
      ];

      return (
        <div style={{ width: 800 }}>
          <Row gutter={20} style={{ width: 720 }}>
            <Col span="7">
              <FormItem
                label="SKU代码"
                {...formItemLayout}
              >
                <Input
                  size="default"
                  placeholder="请输入SKU代码"
                  ref={(c) => { skuCode = c; }}
                  defaultValue={skuQuery.skuCode}
                />
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                <Input
                  size="default"
                  placeholder="请输入商品名称"
                  ref={(c) => { itemName = c; }}
                  defaultValue={skuQuery.itemName}
                />
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem
                label="颜色"
                {...formItemLayout}
              >
                <Input
                  size="default"
                  placeholder="请输入颜色"
                  ref={(c) => { color = c; }}
                  defaultValue={skuQuery.color}
                />
              </FormItem>
            </Col>
            <Col className="listBtnGroup" span="3" style={{ marginTop: 2 }}>
              <Button type="primary" onClick={doSearch}>查询</Button>
            </Col>
          </Row>
          <Row>
            <Table
              columns={columns}
              dataSource={list}
              size="small"
              bordered
              rowKey={record => record.id}
              pagination={paginationProps}
              scroll={{ x: '100%', y: 400 }}
            />
          </Row>
        </div>
      );
    }

    const modalTableProps = {
      columns: [
        { title: <font color="#00f">SKU代码</font>,
          dataIndex: 'skuCode',
          key: 'skuCode',
          width: '20%',
          render(text, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_skuCode`, {
                  initialValue: text || undefined,
                  rules: [{ required: true, message: '请选择SKU' }],
                })(
                  <Popover
                    content={renderSkuPopover(skuList, r.key, total)}
                    title="搜索SKU"
                    trigger="click"
                  >
                    <Input onFocus={p.handleSearch.bind(p)} placeholder="请选择SKU" value={text || undefined} ref={(c) => { p[`r_${r.key}_skuCode_dom`] = c; }} />
                  </Popover>,
                )}
              </FormItem>
            );
          },
        },
        {
          title: '商品名称',
          dataIndex: 'itemName',
          key: 'itemName',
          width: '20%',
          render(text) { return text || '-'; },
        },
        {
          title: '商品图片',
          dataIndex: 'skuPic',
          key: 'skuPic',
          width: '12%',
          render(text) {
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
        {
          title: '颜色',
          dataIndex: 'color',
          key: 'color',
          width: '10%',
          render(text) { return text || '-'; },
        },
        {
          title: '尺寸',
          dataIndex: 'scale',
          key: 'scale',
          width: '10%',
          render(text) { return text || '-'; },
        },
        {
          title: <font color="#00f">销售价</font>,
          dataIndex: 'salePrice',
          key: 'salePrice',
          width: '10%',
          render(text, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_salePrice`, {
                  initialValue: text,
                })(
                  <InputNumber step={0.01} min={0} placeholder="请输入" />,
                )}
                {getFieldDecorator(`r_${r.key}_skuId`, {
                  initialValue: r.skuId || r.id,
                })(
                  <Input style={{ display: 'none' }} />,
                )}
              </FormItem>);
          },
        },
        {
          title: <font color="#00f">数量</font>,
          dataIndex: 'quantity',
          key: 'quantity',
          width: '10%',
          render(text, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_quantity`, {
                  initialValue: text,
                })(
                  <InputNumber step={1} min={1} placeholder="请输入" />,
                )}
              </FormItem>);
          },
        },
        {
          title: '操作',
          key: 'operator',
          width: 60,
          render(text, r) {
            return (<Popconfirm title="确定删除?" onConfirm={p.handleDelete.bind(p, r.key)}>
              <a href="javascript:void(0)">删除</a>
              {getFieldDecorator(`r_${r.key}_classicalId`, { initialValue: r && r.id })(<Input style={{ display: 'none' }} />)}
            </Popconfirm>);
          },
        },
      ],
      dataSource: skuData,
      bordered: false,
      pagination: false,
    };
    return (
      <div>
        <Row style={{ paddingBottom: 10 }}>
          <Col style={{ float: 'left' }}>
            <span>订单明细信息（<font color="#00f">蓝色列可编辑</font>）</span>
          </Col>
          <Col style={{ float: 'right' }}>
            <Button type="primary" onClick={p.addProduct.bind(p)}>添加商品</Button>
          </Col>
        </Row>
        <Table {...modalTableProps} rowKey={record => record.key} />
      </div>);
  }
}

function mapStateToProps(state) {
  const { skuList, skuTotal, pageSize } = state.sku;
  return {
    skuList,
    total: skuTotal,
    pageSize,
  };
}

export default connect(mapStateToProps)(Form.create()(ProductTable));
