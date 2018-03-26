import React, { Component } from 'react';
import { Modal, Input, InputNumber, Row, Col, Form, Icon, Upload, Select, Cascader, message } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

let searchQueue = [];

function toString(str, type) {
  if (typeof str !== 'undefined' && str !== null) {
    return str.toString();
  }
  if (type === 'SELECT') return undefined;
  return '';
}

class SkuModal extends Component {

  constructor() {
    super();
    this.state = {
      previewVisible: false, // 上传图片的modal是否显示
      previewImage: '', // 上传图片的url
      proSearchList: {},
      picList: null,
    };
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues, brandList } = this.props;
    const { proSearchList } = this.state;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }
      // 处理图片
      if (fieldsValue.skuPic) {
        const uploadMainPic = [];
        fieldsValue.skuPic.forEach((item, index) => {
          uploadMainPic.push({
            uid: `i_${index}`,
            type: item.type,
            url: item.url || item.response.data,
          });
        });
        fieldsValue.skuPic = JSON.stringify({ picList: uploadMainPic });
      }
      // 结束处理图片
      if (fieldsValue.brand) {
        brandList.forEach((item) => {
          if (item.id.toString() === fieldsValue.brand) {
            fieldsValue.brand = item.name;
          }
        });
      }
      if (fieldsValue.packageLevelId) {
        fieldsValue.packageLevelId = JSON.stringify(fieldsValue.packageLevelId);
      }
      if (modalValues.data) {
        fieldsValue.id = modalValues.data.id;
        dispatch({
          type: 'sku/updateSku',
          payload: { ...fieldsValue, id: modalValues.data.id, itemId: proSearchList.data ? proSearchList.data[0].id : modalValues.data.itemId },
          cb() { p.closeModal(); },
        });
      } else {
        dispatch({
          type: 'sku/addSku',
          payload: { ...fieldsValue, itemId: proSearchList.data[0].id },
          cb() { p.closeModal(); },
        });
      }
    });
  }

  handleSearch(value) {
    const p = this;
    if (searchQueue.length > 0) {
      searchQueue.push(value);
      return;
    }
    this.props.dispatch({
      type: 'sku/searchProducts',
      payload: {
        keyword: value,
        callback(status) {
          if (status !== 'ERROR') {
            const { proSearchList } = p.state;
            proSearchList.data = status.rows || [];
            p.setState({ proSearchList });
          }
          // 搜索始终进行
          if (searchQueue.length > 0) {
            const keyword = searchQueue[searchQueue.length - 1];
            searchQueue = [];
            p.handleSearch(keyword);
          }
        },
      },
    });
  }

  handleCancel() {
    this.setState({
      previewVisible: false,
    });
  }

  checkImg(rules, value, callback) {
    callback();
  }

  closeModal() {
    const { close, form } = this.props;
    this.setState({ proSearchList: {}, picList: null });
    form.resetFields();
    close(false);
  }

  render() {
    const p = this;
    const { previewVisible, previewImage, proSearchList, picList } = p.state;
    const { form, visible, modalValues = {}, brandList = [], productsList = [], packageScales } = p.props;
    const { getFieldDecorator } = form;
    const skuModalData = modalValues.data || {};
    const list = proSearchList.data || productsList;
    // 获取初始化的图片列表
    let defaultPicList = [];
    if (skuModalData.skuPic) {
      const picObj = JSON.parse(skuModalData.skuPic.replace('&quot;'));
      defaultPicList = picObj.picList || [];
    }
    // 操作加号
    let firstLoad = true;
    let showAddIcon = false;
    if (picList) firstLoad = false;
    if (firstLoad && defaultPicList.length < 1) showAddIcon = true;
    if (!firstLoad && picList && picList.length < 1) showAddIcon = true;

    const modalProps = {
      visible,
      width: 900,
      title: skuModalData.skuCode ? '修改' : '添加',
      maskClosable: false,
      closable: true,
      onOk() { p.handleSubmit(); },
      onCancel() { p.closeModal(); },
    };
    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };
    const uploadProps = {
      action: '/haierp1/uploadFile/picUpload',
      listType: 'picture-card',
      multiple: true,
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
          previewVisible: true,
          previewImage: file.url || file.thumbUrl,
        });
      },
      onChange(info) {
        p.setState({ picList: info.fileList });
        if (info.file.status === 'done') {
          if (info.file.response && info.file.response.success) {
            message.success(`${info.file.name} 成功上传`);
            // 添加文件预览
            const newFile = info.file;
            newFile.url = info.file.response.data;
          } else { message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`); }
        } else if (info.file.status === 'error') { message.error(`${info.file.name} 上传失败`); }
      },
    };
    return (
      <Modal
        {...modalProps}
      >
        <Form>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="所属商品"
                {...formItemLayout}
              >
                {getFieldDecorator('itemId', {
                  initialValue: toString(skuModalData.itemName, 'SELECT'),
                  rules: [{ required: true, message: '请选择' }],
                })(
                  <Select
                    combobox
                    placeholder="请选择"
                    onChange={p.handleSearch.bind(p)}
                    defaultActiveFirstOption={false}
                    showArrow={false}
                  >
                    {list.map((item, index) => <Option key={index} value={item.name}>{item.name}</Option>)}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="销售价格"
                {...formItemLayout}
              >
                {getFieldDecorator('salePrice', {
                  initialValue: skuModalData.salePrice || 0,
                  rules: [{ required: true, message: '请填写销售价格' }],
                })(
                  <InputNumber step={0.01} min={0} placeholder="请输入销售价格" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="尺寸"
                {...formItemLayout}
              >
                {getFieldDecorator('scale', {
                  initialValue: toString(skuModalData.scale),
                })(
                  <Input disabled placeholder="请输入尺寸" />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="包装规格"
                {...formItemLayout}
              >
                {getFieldDecorator('packageLevelId', {
                  initialValue: skuModalData.packageLevelId && typeof skuModalData.packageLevelId === 'string' ? skuModalData.packageLevelId.match(/\[/g) ? JSON.parse(skuModalData.packageLevelId) : skuModalData.packageLevelId.split(',') : undefined,
                  rules: [{ required: true, message: '请选择包装规格' }],
                })(
                  <Cascader options={packageScales} placeholder="请选择包装规格" />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="UPC"
                {...formItemLayout}
              >
                {getFieldDecorator('upc', {
                  initialValue: toString(skuModalData.upc),
                })(
                  <Input placeholder="请输入UPC" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="虚拟库存"
                {...formItemLayout}
              >
                {getFieldDecorator('virtualInv', {
                  initialValue: toString(skuModalData.virtualInv),
                  rules: [{ required: true, message: '请填写虚拟库存' }],
                })(
                  <Input placeholder="请输入虚拟库存" />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="重量(磅)"
                {...formItemLayout}
              >
                {getFieldDecorator('weight', {
                  initialValue: toString(skuModalData.weight),
                  rules: [{ required: true, message: '请填写重量' }],
                })(
                  <InputNumber skep={0.01} placeholder="请输入重量" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="颜色"
                {...formItemLayout}
              >
                {getFieldDecorator('color', {
                  initialValue: toString(skuModalData.color),
                })(
                  <Input disabled placeholder="请输入颜色" />,
                )}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="品牌"
                {...formItemLayout}
              >
                {getFieldDecorator('brand', {
                  initialValue: toString(skuModalData.brand, 'SELECT'),
                })(
                  <Select disabled placeholder="请选择品牌" combobox>
                    {brandList.map(item => <Option key={item.id} value={item.name}>{item.name}</Option>)}
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="添加图片"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 9 }}
                style={{ marginRight: '-20px' }}
              >
                {getFieldDecorator('skuPic', {
                  initialValue: defaultPicList,
                  valuePropName: 'fileList',
                  getValueFromEvent(e) {
                    if (!e || !e.fileList) {
                      return e;
                    }
                    const { fileList } = e;
                    return fileList;
                  },
                  rules: [{ validator: this.checkImg.bind(this) }],
                })(
                  <Upload {...uploadProps}>
                    {showAddIcon && <div>
                      <Icon type="plus" className="uploadPlus" />
                      <div className="ant-upload-text">上传图片</div>
                    </div>}
                  </Upload>,
                )}

                <Modal visible={previewVisible} title="预览图片" footer={null} onCancel={this.handleCancel.bind(this)}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(SkuModal);
