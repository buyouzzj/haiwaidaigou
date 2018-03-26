import React, { Component } from 'react';
import { Modal, message, Upload, Icon, Input, Row, Col, DatePicker, Form, Select } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import ProductTable from './ProductTable';

moment.locale('zh-cn');

const FormItem = Form.Item;
const Option = Select.Option;

function toString(str, type) {
  if (typeof str !== 'undefined' && str !== null) {
    return str.toString();
  }
  if (type === 'SELECT') return undefined;
  return '';
}

class PurchaseModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      certFileList: '',
      defaultBuyer: undefined,
      defaultStartTime: undefined,
      defaultEndTime: undefined,
    };

    // skuTable改写父级方法
    this.getSkuValue = null;
    this.clearSkuValue = null;
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues } = p.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) { return; }
      if (fieldsValue.defaultBuyer) fieldsValue.buyerId = fieldsValue.defaultBuyer;
      delete fieldsValue.defaultBuyer;
      p.getSkuValue((detailList) => {
        const values = {
          ...fieldsValue,
          taskStartTime: fieldsValue.taskStartTime && fieldsValue.taskStartTime.format('YYYY-MM-DD'),
          taskEndTime: fieldsValue.taskEndTime && fieldsValue.taskEndTime.format('YYYY-MM-DD'),
          detailList: JSON.stringify(detailList),
        };

        // 处理图片
        if (values.imageUrl) {
          const uploadMainPic = [];
          values.imageUrl.forEach((el, index) => {
            uploadMainPic.push({
              type: el.type,
              uid: `i_${index}`,
              url: el.url || el.response.data,
            });
          });
          values.imageUrl = JSON.stringify({ picList: uploadMainPic });
        }
        if (modalValues && modalValues.data) {
          dispatch({
            type: 'purchase/updatePurchase',
            payload: { ...values, id: modalValues.data.id, detailList: JSON.stringify(detailList) },
            cb() { p.closeModal(); },
          });
        } else {
          dispatch({
            type: 'purchase/addPurchase',
            payload: { ...values, detailList: JSON.stringify(detailList) },
            cb() { p.closeModal(); },
          });
        }
      });
    });
  }

  closeModal() {
    const { form, close } = this.props;
    form.resetFields();
    close();
    // 清理skuTable
    setTimeout(() => {
      this.clearSkuValue();
      this.setState({ defaultBuyer: undefined, defaultStartTime: undefined, defaultEndTime: undefined });
    }, 100);
  }

  handleCancel() {
    this.setState({ previewVisible: false });
  }

  checkImg(rules, values, callback) {
    callback();
  }

  // queryItemSkus(param) {
  //   const { modalValues = {} } = this.props;
  //   modalValues.data && modalValues.data.itemSkus.map(item => {
  //     return item[param];
  //   });
  // }

  handleDelete(id) {
    const { skuList } = this.state;
    const skuData = skuList.filter(item => id !== item.id);
    this.setState({ skuList: skuData });
  }

  handleInputChange(e) {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    if (!getFieldsValue().taskDesc || getFieldsValue().taskDesc !== e.target.value) {
      setFieldsValue({ taskDesc: e.target.value });
    }
  }

  disabledStartDate(startDate) {
    const { form } = this.props;
    const endDate = form.getFieldValue('taskEndTime');
    if (!endDate || !startDate) {
      return false;
    }
    return startDate.valueOf() <= endDate.valueOf();
  }

  disabledEndDate(endDate) {
    const { form } = this.props;
    const startDate = form.getFieldValue('taskStartTime');
    if (!endDate || !startDate) return false;
    return startDate.valueOf() > endDate.valueOf();
  }

  handleChangeBuyer(defaultBuyer) {
    this.setState({ defaultBuyer });
  }

  handleChangeStartTime(defaultStartTime) {
    this.setState({ defaultStartTime });
  }

  handleChangeEndTime(defaultEndTime) {
    this.setState({ defaultEndTime });
  }

  // checkStartTime = (rule, value, callback) => {
  //   const form = this.props.form;
  //   if (value && value < form.getFieldValue('taskStartTime')) {
  //     callback('结束时间需要晚于开始时间');
  //   } else {
  //     callback();
  //   }
  // }

  // checkEndTime = (rule, value, callback) => {
  //   const form = this.props.form;
  //   if (value) {
  //     form.validateFields(['taskEndTime'], { force: true });
  //   }
  //   callback();
  // }

  render() {
    const p = this;
    const { form, title, visible, modalValues = {}, buyer = [] } = p.props;
    const { previewVisible, previewImage, defaultBuyer, defaultStartTime, defaultEndTime } = p.state;
    const purchaseData = (modalValues && modalValues.data) || {};
    const { getFieldDecorator } = form;
    let picList = [];
    if (purchaseData.imageUrl) {
      const picObj = JSON.parse(decodeURIComponent(purchaseData.imageUrl).replace(/&quot;/g, '"'));
      picList = picObj.picList || [];
    }
    const modalProps = {
      visible,
      width: 1100,
      wrapClassName: 'modalStyle',
      okText: '保存',
      title,
      maskClosable: false,
      closable: true,
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal();
      },
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
        if (info.file.status === 'done') {
          if (info.file.response && info.file.response.success) {
            message.success(`${info.file.name} 成功上传`);
            // 添加文件预览
            const newFile = info.file;
            newFile.url = info.file.response.data;
          } else { message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`); }
        } else if (info.file.status === 'error') { message.error(`${info.file.name} 上传失败`); }
        // 限制一个图片
        const fileLength = info.fileList.length;
        p.setState({ certFileList: fileLength > 1 ? [info.fileList[fileLength - 1]] : info.fileList });
      },
    };
    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };

    const taskStartTime = purchaseData.taskStartTime ? moment(purchaseData.taskStartTime, 'YYYY-MM-DD') : moment(new Date(), 'YYYY-MM-DD');
    const taskEndTime = purchaseData.taskEndTime ? moment(purchaseData.taskEndTime, 'YYYY-MM-DD HH:mm:ss') : moment(new Date(), 'YYYY-MM-DD');

    return (
      <Modal {...modalProps}>
        <Form onSubmit={p.handleSubmit.bind(p)}>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="任务名称"
                {...formItemLayout}
              >
                {getFieldDecorator('taskTitle', {
                  initialValue: toString(purchaseData.taskTitle),
                  rules: [{ required: true, message: '请输入任务名称' }],
                })(
                  <Input placeholder="请输入任务名称" onChange={p.handleInputChange.bind(p)} />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="采购单号"
                {...formItemLayout}
              >
                {getFieldDecorator('purOrderNo', {
                  initialValue: toString(purchaseData.purOrderNo),
                })(
                  <Input placeholder="请输入采购单号" />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="默认买手"
                {...formItemLayout}
              >
                {getFieldDecorator('defaultBuyer', {
                  initialValue: toString(purchaseData.buyerId, 'SELECT'),
                })(
                  <Select placeholder="请选择买手" optionLabelProp="title" onChange={this.handleChangeBuyer.bind(this)}>
                    {buyer.map((el) => {
                      return <Option key={el.id} title={el.name}>{el.name}</Option>;
                    })}
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={7}>
              <FormItem
                label="任务开始时间"
                {...formItemLayout}
              >
                {getFieldDecorator('taskStartTime', {
                  initialValue: taskStartTime,
                  rules: [{ required: true, message: '该项必填' }],
                })(
                  <DatePicker onChange={this.handleChangeStartTime.bind(this)} style={{ width: '100%' }} />,
                )}
                {/* disabledDate={this.disabledStartDate.bind(this)} */}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem
                label="任务结束时间"
                {...formItemLayout}
              >
                {getFieldDecorator('taskEndTime', {
                  initialValue: taskEndTime,
                  rules: [{ required: true, message: '该项必填' }],
                })(
                  <DatePicker onChange={this.handleChangeEndTime.bind(this)} disabledDate={this.disabledEndDate.bind(this)} style={{ width: '100%' }} />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="任务描述"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 18 }}
              >
                {getFieldDecorator('taskDesc', {
                  initialValue: toString(purchaseData.taskDesc),
                })(
                  <Input placeholder="请输入任务描述" size="large" style={{ marginLeft: 5 }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="备注"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 18 }}
              >
                {getFieldDecorator('remark', {
                  initialValue: purchaseData.remark ? toString(purchaseData.remark) : toString(purchaseData.taskTitle),
                })(
                  <Input placeholder="请输入备注信息" size="large" style={{ marginLeft: 5 }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="添加图片"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 18 }}
                style={{ marginRight: '-20px' }}
              >
                {getFieldDecorator('imageUrl', {
                  initialValue: picList,
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
                    <Icon type="plus" className="uploadPlus" />
                    <div className="ant-upload-text">上传图片</div>
                  </Upload>,
                )}

                <Modal visible={previewVisible} title="预览图片" footer={null} onCancel={this.handleCancel.bind(this)}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <ProductTable defaultBuyer={defaultBuyer || toString(purchaseData.buyerId)} defaultStartTime={defaultStartTime || taskStartTime} defaultEndTime={defaultEndTime || taskEndTime} data={purchaseData.taskDetailList} parent={this} buyer={buyer} />
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(PurchaseModal);
