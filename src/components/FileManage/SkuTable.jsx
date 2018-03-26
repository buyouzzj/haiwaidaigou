import React, { Component } from 'react';
import { Row, Col, Form, Table, Input, InputNumber, Button, Popconfirm, Upload, Icon, Cascader, message, Popover, Checkbox, Select, Modal } from 'antd';

import styles from './Products.less';

const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

function getScaleOptions(batchSkuSort, scaleTypes) {
  const filteredBatchOptions = scaleTypes.filter((el) => {
    el.id = el.id.toString();
    return el.id === batchSkuSort.toString();
  });

  const targetBatchOptions = filteredBatchOptions.length > 0 ? filteredBatchOptions[0].scaleList : [];

  const scaleOptions = targetBatchOptions.map((el) => {
    el.label = el.name.toString();
    el.value = el.name.toString();
    return el;
  });

  return scaleOptions;
}

class SkuTable extends Component {
  constructor() {
    super();
    this.state = {
      skuData: [],
      batchSkuAddVisible: false,
      batchSkuSort: '',
      batchSelected: [],
      previewVisible: false,
      previewImage: '',
      batchFileList: [],
    };
  }
  componentWillReceiveProps(...args) {
    if (args[0].data instanceof Array && args[0].data.length > 0 && this.state.skuData.length === 0) {
      this.initData(args[0].data);
    }
  }
  getValue(callback) {
    const { form } = this.props;
    const skuList = [];
    form.validateFieldsAndScroll((err, fieldsSku) => {
      if (err) return;
      let count = 1;
      const keys = Object.keys(fieldsSku);
      while (Object.prototype.hasOwnProperty.call(fieldsSku, `r_${count}_virtualInv`)) {
        const skuSingle = {};
        keys.forEach((key) => {
          if (key.match(`r_${count}_`) && fieldsSku[key]) {
            skuSingle[key.split(`r_${count}_`)[1]] = fieldsSku[key];
          }
        });
        skuSingle.packageLevelId = JSON.stringify(skuSingle.packageLevelId); // 数组转字符串
        // 处理图片
        if (skuSingle.skuPic) {
          const uploadMainPic = [];
          skuSingle.skuPic.forEach((el, index) => {
            uploadMainPic.push({
              type: el.type,
              uid: `i_${index}`,
              url: el.url || el.response.data,
            });
          });
          skuSingle.skuPic = JSON.stringify({ picList: uploadMainPic });
        }
        skuList.push(skuSingle);
        count += 1;
      }
      if (skuList.length < 1) {
        message.error('请至少填写一项sku信息');
        return;
      }
      if (callback) callback(skuList);
    });
  }
  clearValue() {
    const { form } = this.props;
    this.setState({ skuData: [] }, () => {
      form.resetFields();
    });
  }
  initData(data) {
    data.forEach((el, index) => {
      el.key = index + 1;
    });
    this.setState({ skuData: data });
  }
  addItem(obj) {
    const { skuData } = this.state;
    const skuLen = skuData.length;
    const lastId = skuLen < 1 ? 0 : skuData[skuData.length - 1].key;
    const newId = parseInt(lastId, 10) + 1;
    // 处理图片
    const pic = this.dealSkuPic(obj.batchFileList);

    const newItem = {
      // id: newId,
      key: newId,
      scale: typeof obj.scale === 'string' ? obj.scale : '',
      color: typeof obj.color === 'string' ? obj.color : '',
      packageLevelId: obj.packageLevelId ? JSON.stringify(obj.packageLevelId) : [],
      skuCode: '',
      salePrice: typeof obj.salePrice === 'string' ? obj.salePrice : '',
      weight: typeof obj.weight === 'string' ? obj.weight : '',
      virtualInv: typeof obj.virtualInv === 'string' ? obj.virtualInv : '',
      skuPic: JSON.stringify(pic),
      costPrice: typeof obj.costPrice === 'string' ? obj.costPrice : '',
      discount: typeof obj.discount === 'string' ? obj.discount : '',
      purchasePrice: typeof obj.purchasePrice === 'string' ? obj.purchasePrice : '',
      
    };
    skuData.push(newItem);
    this.setState({ skuData });
  }
  // 处理图片
  dealSkuPic(batchFileList) {
    const pic = {};
    if (batchFileList) {
      batchFileList.forEach((el) => {
        const list = [];
        if (el.response && el.response.success) {
          list.push({
            uid: el.uid,
            url: el.response.data,
            type: el.type,
          });
        }
        pic.picList = list;
      });
    }
    return pic;
  }
  delItem(key) {
    const { skuData } = this.state;
    const newSkuData = skuData.filter(item => key !== item.key);
    this.setState({ skuData: newSkuData }, () => {
      setTimeout(() => {
        this.setState({ skuData: newSkuData.map((el, index) => { el.key = index + 1; return el; }) });
      }, 100);
    });
  }
  checkImg(rules, values, callback) {
    callback();
  }
  inputCostPriceChange(type, key, value) {
    const skuData = this.state.skuData;
    skuData.forEach((el) => {
      if(el.key == key) {
          el.costPrice = value;
      }
    });
    this.setState({
        skuData
    });
  }
  //折扣率监听
  inputCountChange(type, key, value) {
    const skuData = this.state.skuData;
    let purchasePrice = 0;
    skuData.forEach((el) => {
      	if(el.key == key) {
      	  	el.discount = parseFloat(value);
	        if(el.costPrice > 0) {
				purchasePrice = el.costPrice * el.discount;
				purchasePrice = purchasePrice.toFixed(2);
				el.purchasePrice = purchasePrice;
	        }
      	}
    });
    this.setState({
        skuData
    });
	if(purchasePrice > 0) {
		let obj={};
		obj["r_"+key+"_purchasePrice"] = purchasePrice;
		this.props.form.setFieldsValue(obj);
	}
  }
  //折后价监听
  inputPurchaseChange(type, key, value) {
    const skuData = this.state.skuData;
    let discount = 0;
    skuData.forEach((el) => {
        if(el.key == key) {
	      	el.purchasePrice = parseFloat(value);
            if(el.costPrice > 0) {
                discount = el.purchasePrice / el.costPrice;
                discount = discount.toFixed(2);
                el.discount = discount;
            }
        }
    });
    this.setState({
        skuData
    });
	if(discount > 0) {
		let obj={};
		obj["r_"+key+"_discount"] = discount;
		this.props.form.setFieldsValue(obj);
	}
}
  //采购用户
  handleBatchSkuAddVisible(batchSkuAddVisible) {
    if (!batchSkuAddVisible) {
      const { batchSelected } = this.state;
      const salePrice = this.salePrice.refs.input.value;
      const color = this.color.refs.input.value;
      const weight = this.weight.refs.input.value;
      const virtualInv = this.virtualInv.refs.input.value;
      const packageLevelId = this.packageLevelId.state.value;
      const batchFileList = this.batchPic.state.fileList;
      const costPrice = this.costPrice.refs.input.value;
      const discount = this.discount.refs.input.value;
      const purchasePrice = this.purchasePrice.refs.input.value;
      const { skuData } = this.state;
      let isUpdate = false;
      // 判断是否是修改
      if (skuData.length) {
        const temColor = typeof color === 'string' ? color : '';
        const tempSalePrice = typeof salePrice === 'string' ? salePrice : '';
        const tempVirtualInv = typeof virtualInv === 'string' ? virtualInv : '';
        const temWeight = typeof weight === 'string' ? weight : '';
        const temPackageLevelId = packageLevelId ? JSON.stringify(packageLevelId) : [];
        const pic = this.dealSkuPic(batchFileList);
        const tempSkuPic = JSON.stringify(pic);
        const tempCostPrice = typeof costPrice === 'string' ? costPrice : '';
        const tempDiscount = typeof discount === 'string' ? discount : '';
        const tempPurchasePrice = typeof purchasePrice === 'string' ? purchasePrice : '';
        skuData.forEach((el) => {
          // 颜色没填，或者填的颜色已在现有sku中存在了，就认定是修改
          if ((temColor !== '' && temColor === el.color) || temColor === '') {
            if (tempSalePrice) el.salePrice = tempSalePrice;
            if (tempCostPrice) el.costPrice = tempCostPrice;
            if (tempVirtualInv) el.virtualInv = tempVirtualInv;
            if (temWeight) el.weight = temWeight;
            if (packageLevelId.length) el.packageLevelId = temPackageLevelId;
            if (pic.picList) el.skuPic = tempSkuPic;
            if (el.costPrice > 0) {
                if(tempDiscount > 0) {
                    el.discount = tempDiscount;
                    let purchasePrice = el.costPrice * tempDiscount;
                    el.purchasePrice = purchasePrice.toFixed(2);
                } else if(tempPurchasePrice > 0) {
                    el.purchasePrice = tempPurchasePrice;
                    let discount = tempPurchasePrice / el.costPrice;
                    el.discount = discount.toFixed(2);
                }
            }
            isUpdate = true;
          }
        });
      }
      if (!isUpdate) {
        batchSelected.forEach((el) => {
          const obj = { scale: el, salePrice, costPrice,discount,purchasePrice,color, batchFileList, weight, virtualInv, packageLevelId };
          this.addItem(obj);
        });
      }
      this.setState({ batchSkuSort: '', batchSelected: [] });
      this.salePrice.refs.input.value = '';
      this.color.refs.input.value = '';
      this.weight.refs.input.value = '';
      this.virtualInv.refs.input.value = '';
      this.packageLevelId.state.value = [];
      this.setState({ batchFileList: [] });
      this.costPrice.refs.input.value = '';
      this.discount.refs.input.value = '';
      this.purchasePrice.refs.input.value = '';
    }
    this.setState({ batchSkuAddVisible });
  }
  //普通用户
  handleBatchSkuAddVisibleFalse(batchSkuAddVisible) {
    if (!batchSkuAddVisible) {
      const { batchSelected } = this.state;
      const salePrice = this.salePrice.refs.input.value;
      const color = this.color.refs.input.value;
      const weight = this.weight.refs.input.value;
      const virtualInv = this.virtualInv.refs.input.value;
      const packageLevelId = this.packageLevelId.state.value;
      const batchFileList = this.batchPic.state.fileList;

      const { skuData } = this.state;
      let isUpdate = false;
      // 判断是否是修改
      if (skuData.length) {
        const temColor = typeof color === 'string' ? color : '';
        const tempSalePrice = typeof salePrice === 'string' ? salePrice : '';
        const tempVirtualInv = typeof virtualInv === 'string' ? virtualInv : '';
        const temWeight = typeof weight === 'string' ? weight : '';
        const temPackageLevelId = packageLevelId ? JSON.stringify(packageLevelId) : [];
        const pic = this.dealSkuPic(batchFileList);
        const tempSkuPic = JSON.stringify(pic);
        skuData.forEach((el) => {
          // 颜色没填，或者填的颜色已在现有sku中存在了，就认定是修改
          if ((temColor !== '' && temColor === el.color) || temColor === '') {
            if (tempSalePrice) el.salePrice = tempSalePrice;
            if (tempVirtualInv) el.virtualInv = tempVirtualInv;
            if (temWeight) el.weight = temWeight;
            if (packageLevelId.length) el.packageLevelId = temPackageLevelId;
            if (pic.picList) el.skuPic = tempSkuPic;
            isUpdate = true;
          }
        });
      }
      if (!isUpdate) {
        batchSelected.forEach((el) => {
          const obj = { scale: el, salePrice, color, batchFileList, weight, virtualInv, packageLevelId };
          this.addItem(obj);
        });
      }
      this.setState({ batchSkuSort: '', batchSelected: [] });
      this.salePrice.refs.input.value = '';
      this.color.refs.input.value = '';
      this.weight.refs.input.value = '';
      this.virtualInv.refs.input.value = '';
      this.packageLevelId.state.value = [];
      this.setState({ batchFileList: [] });
    }
    this.setState({ batchSkuAddVisible });
  }
  handleCloseBatch() {
    this.setState({ batchSkuAddVisible: false });
    this.salePrice.refs.input.value = '';
    this.color.refs.input.value = '';
    this.weight.refs.input.value = '';
    this.virtualInv.refs.input.value = '';
    this.packageLevelId.state.value = [];
    this.setState({ batchFileList: [] });
  }
  changeBatchSkuType(type) {
    this.setState({ batchSkuSort: type });
    // if (type) {
    //   this.setState({ batchSelected: getScaleOptions(type, this.props.scaleTypes).map(el => el.name) });
    // }
  }
  handleBatchSelect(batchSelected) {
    this.setState({ batchSelected });
  }
  handleCancel() {
    this.setState({ previewVisible: false });
  }
  render() {
    const p = this;
    let rolerFlage = p.props.parent.props.loginRoler;
    const { form, parent, packageScales, scaleTypes } = this.props;
    const { getFieldDecorator } = form;
    const { skuData, batchSkuSort, batchSelected, previewImage, previewVisible, batchFileList } = this.state;
    // 注册props
    if (!parent.clearSkuValue) parent.clearSkuValue = this.clearValue.bind(this);
    if (!parent.getSkuValue) parent.getSkuValue = this.getValue.bind(this);
    const uploadProps = {
      action: '/haierp1/uploadFile/picUpload',
      listType: 'picture-card',
      data(file) {
        return {
          pic: file.name,
        };
      },
      beforeUpload(file) {
        const isImg = file.type === 'image/jpeg' || file.type === 'image/bmp' || file.type === 'image/gif' || file.type === 'image/png';
        if (!isImg) { message.error('请上传图片文件'); }
        return isImg;
      },
      name: 'pic',
      onPreview(file) {
        p.setState({
          previewImage: file.url || file.thumbUrl,
          previewVisible: true,
        });
      },
      onChange(info) {
        if (info.file.status === 'done') {
          if (info.file.response && info.file.response.success) {
            message.success(`${info.file.name} 成功上传`);
            // 添加文件预览
            const newFile = info.file;
            info.fileList = info.fileList.slice(-1);
            newFile.url = info.file.response.data;
          } else { message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`); }
        } else if (info.file.status === 'error') { message.error(`${info.file.name} 上传失败`); }
      },
    };
    const modalTableProps = {
      columns: [
        {
          title: 'SKU代码',
          dataIndex: 'skuCode',
          key: 'skuCode',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_skuCode`, { initialValue: t || '' })(
                  r.skuCode ? <Input placeholder="请填写SKU代码" disabled /> : <span style={{ color: '#ccc' }}>自动生成</span>,
                )}
              </FormItem>
            );
          },
        },
        {
          title: '货号',
          dataIndex: 'thirdSkuCode',
          key: 'thirdSkuCode',
          width: '7%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_thirdSkuCode`, { initialValue: t || '' })(
                  <Input placeholder="请填写货号" />)}
              </FormItem>
            );
          },
        },
        {
          title: '尺寸',
          dataIndex: 'scale',
          key: 'scale',
          width: '7%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_scale`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
                {getFieldDecorator(`r_${r.key}_id`, { initialValue: r.id || null })(
                  <Input style={{ display: 'none' }} />)}
              </FormItem>
            );
          },
        },
        {
          title: '颜色',
          dataIndex: 'color',
          key: 'color',
          width: '8%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_color`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '销售价格',
          dataIndex: 'salePrice',
          key: 'salePrice',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_salePrice`, { initialValue: t || '', rules: [{ required: true, message: '该项必填' }] })(
                  <InputNumber step={0.01} min={0} placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '虚拟库存',
          dataIndex: 'virtualInv',
          key: 'virtualInv',
          width: '8%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_virtualInv`, {
                  initialValue: t === 0 ? '0' : (t || ''),
                  rules: [{ required: true, message: '请填写' }],
                })(
                  <InputNumber step={1} min={0} placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '重量(磅)',
          dataIndex: 'weight',
          key: 'weight',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_weight`, { initialValue: t || '', rules: [{ required: true, message: '该项必填' }] })(
                  <InputNumber step={0.01} min={0} placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: 'UPC',
          dataIndex: 'upc',
          key: 'upc',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_upc`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '商品图片',
          dataIndex: 'skuPic',
          key: 'skuPic',
          width: '10%',
          render(t, r) {
            const picList = t ? JSON.parse(t).picList || [] : [];
            const formValue = form.getFieldValue(`r_${r.key}_skuPic`);
            let showAdd = false;
            if (formValue && formValue.length < 1) showAdd = true;
            if (picList.length < 1 && !formValue) showAdd = true;
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_skuPic`, {
                  initialValue: t ? picList : formValue,
                  valuePropName: 'fileList',
                  getValueFromEvent(e) {
                    if (!e || !e.fileList) {
                      return e;
                    }
                    const { fileList } = e;
                    return fileList;
                  },
                  rules: [{ validator: p.checkImg.bind(p) }],
                })(
                  <Upload {...uploadProps} className={styles.picStyle}>
                    {showAdd && <Icon type="plus" style={{ fontSize: 10 }} />}
                  </Upload>,
                )}
              </FormItem>
            );
          },
        },
        {
          title: '包装规格',
          dataIndex: 'packageLevelId',
          key: 'packageLevelId',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_packageLevelId`, {
                  initialValue: t && typeof t === 'string' ? t.match(/\[/g) ? JSON.parse(t) : t.split(',') : '',
                  rules: [{ required: true, message: '该项必选' }],
                })(
                  <Cascader options={packageScales} placeholder="请选择" />)}
              </FormItem>
            );
          },
        },
        {
          title: '操作',
          key: 'operator',
          render(text, record) {
            return (
              <Popconfirm title="确定删除?" onConfirm={p.delItem.bind(p, record.key)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            );
          },
        },
      ],
      dataSource: skuData,
      bordered: false,
    };
    const modalTablePropsTure = {
      columns: [
        {
          title: 'SKU代码',
          dataIndex: 'skuCode',
          key: 'skuCode',
          width: '8%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_skuCode`, { initialValue: t || '' })(
                  r.skuCode ? <Input placeholder="请填写SKU代码" disabled /> : <span style={{ color: '#ccc' }}>自动生成</span>,
                )}
              </FormItem>
            );
          },
        },
        {
          title: '货号',
          dataIndex: 'thirdSkuCode',
          key: 'thirdSkuCode',
          width: '8%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_thirdSkuCode`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '尺寸',
          dataIndex: 'scale',
          key: 'scale',
          width: '7%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_scale`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
                {getFieldDecorator(`r_${r.key}_id`, { initialValue: r.id || null })(
                  <Input style={{ display: 'none' }} />)}
              </FormItem>
            );
          },
        },
        {
          title: '颜色',
          dataIndex: 'color',
          key: 'color',
          width: '7%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_color`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '销售价格',
          dataIndex: 'salePrice',
          key: 'salePrice',
          width: '7%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_salePrice`, { initialValue: t || '', rules: [{ required: true, message: '该项必填' }] })(
                  <InputNumber step={0.01} min={0} placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '虚拟库存',
          dataIndex: 'virtualInv',
          key: 'virtualInv',
          width: '8%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_virtualInv`, {
                  initialValue: t === 0 ? '0' : (t || ''),
                  rules: [{ required: true, message: '请填写' }],
                })(
                  <InputNumber step={1} min={0} placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '重量(磅)',
          dataIndex: 'weight',
          key: 'weight',
          width: '7%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_weight`, { initialValue: t || '', rules: [{ required: true, message: '该项必填' }] })(
                  <InputNumber step={0.01} min={0} placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: 'UPC',
          dataIndex: 'upc',
          key: 'upc',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_upc`, { initialValue: t || '' })(
                  <Input placeholder="请填写" />)}
              </FormItem>
            );
          },
        },
        {
          title: '原价',
          dataIndex: 'costPrice',
          key: 'costPrice',
          width: '6%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_costPrice`, { initialValue: t || '' })(
                  <InputNumber step={0.1} min={0} placeholder="请填写" onChange={p.inputCostPriceChange.bind(p, 'costPrice', r.key)} />)}
              </FormItem>
            );
          },
        },
        {
          title: '折扣率',
          dataIndex: 'discount',
          key: 'discount',
          width: '5%',
          render(t ,r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_discount`, { initialValue: t || '' })(
                    <InputNumber step={0.01} min={0} placeholder="请填写" onChange={p.inputCountChange.bind(p, 'discount', r.key)}  />)}
              </FormItem>
            );
          },
        },
        {
          title: '折后价',
          dataIndex: 'purchasePrice',
          key: 'purchasePrice',
          width: '6%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_purchasePrice`, { initialValue: t || '' })(
                  <InputNumber step={0.1} min={0} placeholder="请填写" onChange={p.inputPurchaseChange.bind(p, 'purchasePrice', r.key)}/>)}
              </FormItem>
            );
          },
        },
        {
          title: '商品图片',
          dataIndex: 'skuPic',
          key: 'skuPic',
          width: '10%',
          render(t, r) {
            const picList = t ? JSON.parse(t).picList || [] : [];
            const formValue = form.getFieldValue(`r_${r.key}_skuPic`);
            let showAdd = false;
            if (formValue && formValue.length < 1) showAdd = true;
            if (picList.length < 1 && !formValue) showAdd = true;
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_skuPic`, {
                  initialValue: t ? picList : formValue,
                  valuePropName: 'fileList',
                  getValueFromEvent(e) {
                    if (!e || !e.fileList) {
                      return e;
                    }
                    const { fileList } = e;
                    return fileList;
                  },
                  rules: [{ validator: p.checkImg.bind(p) }],
                })(
                  <Upload {...uploadProps} className={styles.picStyle}>
                    {showAdd && <Icon type="plus" style={{ fontSize: 10 }} />}
                  </Upload>,
                )}
              </FormItem>
            );
          },
        },
        {
          title: '包装规格',
          dataIndex: 'packageLevelId',
          key: 'packageLevelId',
          width: '10%',
          render(t, r) {
            return (
              <FormItem>
                {getFieldDecorator(`r_${r.key}_packageLevelId`, {
                  initialValue: t && typeof t === 'string' ? t.match(/\[/g) ? JSON.parse(t) : t.split(',') : '',
                  rules: [{ required: true, message: '该项必选' }],
                })(
                  <Cascader options={packageScales} placeholder="请选择" />)}
              </FormItem>
            );
          },
        },
        {
          title: '操作',
          key: 'operator',
          render(text, record) {
            return (
              <Popconfirm title="确定删除?" onConfirm={p.delItem.bind(p, record.key)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            );
          },
        },
      ],
      dataSource: skuData,
      bordered: false,
     };
    const batchUploadProps = {
      action: '/haierp1/uploadFile/picUpload',
      fileList: batchFileList,
      listType: 'picture-card',
      data(file) { return { pic: file.name }; },
      beforeUpload(file) {
        const isImg = file.type === 'image/jpeg' || file.type === 'image/bmp' || file.type === 'image/gif' || file.type === 'image/png';
        if (!isImg) { message.error('请上传图片文件'); }
        return isImg;
      },
      name: 'pic',
      onPreview(file) {
        p.setState({
          previewImage: file.url || file.thumbUrl,
          previewVisible: true,
        });
      },
      onRemove() {
        p.setState({
          batchFileList: [],
        });
      },
      onChange(info) {
        p.setState({ batchFileList: info.fileList });
        if (info.file.status === 'done') {
          if (info.file.response && info.file.response.success) {
            message.success(`${info.file.name} 成功上传`);
            // 添加文件预览
            const newFile = info.file;
            newFile.url = info.file.response.data;
            batchFileList.push(newFile);
            p.setState({ batchFileList });
          } else { message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`); }
        } else if (info.file.status === 'error') { message.error(`${info.file.name} 上传失败`); }
      },
    };

    const scaleOptions = getScaleOptions(batchSkuSort, scaleTypes);
    const uploadButton = (<div>
      <Icon type="plus" style={{ fontSize: 28 }} /><div className="ant-upload-text">上传图片</div>
    </div>);
    const BatchSkuAdd = (
      <div style={{ width: 800 }}>
        <Select placeholder="请选择类型" value={batchSkuSort || undefined} style={{ width: 200, marginTop: 10 }} onChange={this.changeBatchSkuType.bind(this)}>
          {scaleTypes.map(el => <Option key={el.id} value={el.id}>{el.type}</Option>)}
        </Select>
        <div><Input placeholder="请输入颜色" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.color = c; }} /></div>
        <div><Input placeholder="请输入售价" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.salePrice = c; }} /></div>
        <div><Input placeholder="请输入虚拟库存" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.virtualInv = c; }} /></div>
        <div><Input placeholder="请输入重量(磅)" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.weight = c; }} /></div>
        <div><Cascader options={packageScales} placeholder="请选择包装规格" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.packageLevelId = c; }} /></div>
        <div style={{ marginTop: 10, minHeight: 100 }}>
          <Upload {...batchUploadProps} ref={(c) => { this.batchPic = c; }}>
            {batchFileList.length >= 1 ? null : uploadButton}
          </Upload>
        </div>
        {scaleOptions.length > 0 && <div style={{ height: 10 }} />}
        <CheckboxGroup options={scaleOptions} value={batchSelected} onChange={this.handleBatchSelect.bind(this)} />
        <div style={{ height: 20 }} />
        <Button type="primary" size="small" onClick={this.handleBatchSkuAddVisibleFalse.bind(this, false)}>添加</Button>
        <Button style={{ marginLeft: 10 }} size="small" onClick={this.handleCloseBatch.bind(this)}>关闭</Button>
      </div>
    );
     const BatchSkuAddTure = (
      <div style={{ width: 800 }}>
        <Select placeholder="请选择类型" value={batchSkuSort || undefined} style={{ width: 200, marginTop: 10 }} onChange={this.changeBatchSkuType.bind(this)}>
          {scaleTypes.map(el => <Option key={el.id} value={el.id}>{el.type}</Option>)}
        </Select>
        <div><Input placeholder="请输入颜色" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.color = c; }} /></div>
        <div><Input placeholder="请输入售价" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.salePrice = c; }} /></div>
        <div><Input placeholder="请输入原价" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.costPrice = c; }} /></div>
        <div><Input placeholder="请输入折扣率" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.discount = c; }} /></div>
        <div><Input placeholder="请输入折后价" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.purchasePrice = c; }} /></div>
        <div><Input placeholder="请输入虚拟库存" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.virtualInv = c; }} /></div>
        <div><Input placeholder="请输入重量(磅)" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.weight = c; }} /></div>
        <div><Cascader options={packageScales} placeholder="请选择包装规格" style={{ marginTop: 10, width: 200 }} ref={(c) => { this.packageLevelId = c; }} /></div>
        <div style={{ marginTop: 10, minHeight: 100 }}>
          <Upload {...batchUploadProps} ref={(c) => { this.batchPic = c; }}>
            {batchFileList.length >= 1 ? null : uploadButton}
          </Upload>
        </div>
        {scaleOptions.length > 0 && <div style={{ height: 10 }} />}
        <CheckboxGroup options={scaleOptions} value={batchSelected} onChange={this.handleBatchSelect.bind(this)} />
        <div style={{ height: 20 }} />
        <Button type="primary" size="small" onClick={this.handleBatchSkuAddVisible.bind(this, false)}>添加</Button>
        <Button style={{ marginLeft: 10 }} size="small" onClick={this.handleCloseBatch.bind(this)}>关闭</Button>
      </div>
    );
    if(rolerFlage){
    return (
      <Row>
        <Col className={styles.productModalBtn}>
          <Popover
            content={BatchSkuAddTure}
            title="选择类型"
            trigger="click"
            visible={this.state.batchSkuAddVisible}
            style={{ width: 200 }}
          >
            <Button type="ghost" onClick={this.handleBatchSkuAddVisible.bind(this, true)}>批量新增SKU</Button>
          </Popover>
          <Button type="primary" style={{ marginLeft: 10 }} onClick={this.addItem.bind(this)}>新增SKU</Button>
        </Col>
        <Table
          {...modalTablePropsTure}
          rowKey={record => record.key}
          pagination={false}
          scroll={{ x: '100%'}}
        />
        <Modal visible={previewVisible} title="预览图片" footer={null} onCancel={this.handleCancel.bind(this)} style={{ marginLeft: '40%' }} >
          <img role="presentation" src={previewImage} style={{ width: '100%' }} />
        </Modal>
      </Row>

    );
    }else{
      return (
      <Row>
        <Col className={styles.productModalBtn}>
          <Popover
            content={BatchSkuAdd}
            title="选择类型"
            trigger="click"
            visible={this.state.batchSkuAddVisible}
            style={{ width: 200 }}
          >
            <Button type="ghost" onClick={this.handleBatchSkuAddVisible.bind(this, true)}>批量新增SKU</Button>
          </Popover>
          <Button type="primary" style={{ marginLeft: 10 }} onClick={this.addItem.bind(this)}>新增SKU</Button>
        </Col>
        <Table
          {...modalTableProps}
          rowKey={record => record.key}
          pagination={false}
          scroll={{ x: '100%'}}
        />
        <Modal visible={previewVisible} title="预览图片" footer={null} onCancel={this.handleCancel.bind(this)} style={{ marginLeft: '40%' }} >
          <img role="presentation" src={previewImage} style={{ width: '100%' }} />
        </Modal>
      </Row>

    );
    }


  }
    
}

export default Form.create()(SkuTable);
