import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Alert, Table, Cascader, Select, Popover ,message} from 'antd';

import divisions from '../../../utils/divisions.json';
import check from '../../../utils/checkLib';

const FormItem = Form.Item;
const Option = Select.Option;
let firstLoad = true;

class DeliveryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkId: [],
    };
  }
  componentWillReceiveProps(...args) {
    const { checkId, visible } = args[0];
    if (checkId && visible && firstLoad) {
      this.setState({ checkId });
      firstLoad = false;
    }
  }
  handleSubmit() {
    const p = this;
    const { form, dispatch } = this.props;
    const { checkId } = this.state;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.address) {
        values.receiverState = values.address[0];
        values.receiverCity = values.address[1];
        values.receiverDistrict = values.address[2];
        delete values.address;
      }
      values.erpOrderId = JSON.stringify(checkId);
      dispatch({
        type: 'order/mergeDelivery',
        payload: { ...values },
        cb() {
          p.handleCancel();
        },
      });
    });
  }
  handleCancel() {
    const { form, closeModal } = this.props;
    setTimeout(() => {
      this.setState({ checkId: [] });
      firstLoad = true;
      form.resetFields();
    }, 300);
    closeModal();
  }
  checkPhone(rules, value, cb) {
    if (value && !check.phone(value)) cb('请输入正确的手机号码');
    cb();
  }
  checkIdCard(rules, value, cb) {
    if (!value) cb();
    else if (check.idcard(value)) cb();
    else cb(new Error('请填写正确的身份证号'));
  }
  handleLogisticCompanyChange(name) {
  	const p = this;
  	const { form, dispatch} = this.props;
  	let idCard = form.getFieldValue("idCard");
  	let logisticCompany = name;
  	let isBatch = false;
  	if(!idCard && logisticCompany == '4PX') {
    message.warning('申请4PX预报身份证信息不能为空');
  	}
  	if(idCard && idCard.trim() && logisticCompany) {
  		dispatch({
			type: 'order/checkManyTimesDelivery',
	        payload: { idCard, logisticCompany, isBatch}
		});
  	}
  }
  render() {
    const p = this;
    const { visible, form, data, deliveryCompanyList, wareList = [] } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const columns = [
      { title: '子订单号', dataIndex: 'erpNo', key: 'erpNo', width: 120 },
      { title: 'SKU编号', dataIndex: 'skuCode', key: 'skuCode', width: 120 },
      { title: 'UPC', dataIndex: 'upc', key: 'upc', width: 120 },
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 120 },
      { title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render(text) {
          switch (text) {
            case 0: return <font color="saddlebrown">新建</font>;
            case 1: return <font color="chocolate">部分发货</font>;
            case 2: return <font color="blue">全部发货</font>;
            case -1: return <font color="red">已关闭</font>;
            default: return '-';
          }
        },
      },
      {
        title: '备货状态',
        dataIndex: 'stockStatus',
        key: 'stockStatus',
        width: 80,
        render(text) {
          switch (text) {
            case 0: return <font>未备货</font>;
            case 1: return <font color="sienna">部分备货</font>;
            case 2: return <font color="saddlebrown">部分在途备货</font>;
            case 3: return <font color="saddlebrown">全部在途备货</font>;
            case 4: return <font color="sienna">混合备货完成</font>;
            case 9: return <font color="red">已释放</font>;
            case 10: return <font color="blue">已备货</font>;
            case 11: return <font color="green">预出库</font>;
            default: return '-';
          }
        },
      },
      { title: '商品图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 100,
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
      { title: '物流方式',
        dataIndex: 'logisticType',
        key: 'logisticType',
        width: 60,
        render(t) {
          switch (t) {
            case 0: return '直邮';
            case 1: return '拼邮';
            default: return '-';
          }
        },
      },
      { title: '颜色', dataIndex: 'color', key: 'color', width: 100 },
      { title: '尺码', dataIndex: 'scale', key: 'scale', width: 100 },
      { title: '单品单价', dataIndex: 'salePrice', key: 'salePrice', width: 100 },
      { title: '重量(磅)', dataIndex: 'weight', key: 'weight', width: 100 },
      { title: '购买数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
      { title: '发货仓库',
        dataIndex: 'warehouseId',
        key: 'warehouseId',
        width: 100,
        render(t) {
          let name = '';
          wareList.forEach((el) => {
            if (el.id === t) name = el.name;
          });
          return name;
        },
      },
      { title: '货架号', dataIndex: 'positionNo', key: 'positionNo', width: 100, render(t) { return t ? t.replace(/:/gi, ': ').split(',').map(w => <div>{w}</div>) : '-'; } },
    ];
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        const listId = [];
        let totalSalePrice = 0;
        let skuWeight = 0;
        selectedRows.forEach((el) => {
          listId.push(el.id);
          totalSalePrice += el.salePrice*el.quantity;
          skuWeight += el.weight*el.quantity;
        });
        p.props.data.totalSalePrice = totalSalePrice;
        p.props.data.skuWeight = skuWeight;
        p.setState({ checkId: listId });
      },
      selectedRowKeys: p.state.checkId,
      getCheckboxProps: r => ({
        defaultChecked: p.state.checkId.forEach(el => el === r.id),
        disabled: !(r.status === 0 && (r.stockStatus === 10 || r.stockStatus === 11)),
      }),
    };

    const initialAddress = [];
    initialAddress.push(data.receiverState);
    initialAddress.push(data.receiverCity);
    initialAddress.push(data.receiverDistrict);

    return (
      <div>
        <Modal
          visible={visible}
          title={<font color="#00f" size="4">发货(将多个子订单合并成一个包裹)</font>}
          onOk={p.handleSubmit.bind(p)}
          onCancel={p.handleCancel.bind(p)}
          width={1000}
        >
          <Form>
            {data.info && <Row>
              <Alert
                message={data.info}
                type="error"
                closable
              />
              <div style={{ height: 10 }} />
            </Row>}
            <Row>
              <Col span={12}>
                <FormItem
                  label="收件人"
                  {...formItemLayout}
                >
                  {getFieldDecorator('receiver', {
                    initialValue: data.receiver,
                    rules: [{ required: true, message: '请输入收件人' }],
                  })(
                    <Input placeholder="请输入收件人" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="收件地址"
                  {...formItemLayout}
                >
                  {getFieldDecorator('address', {
                    initialValue: initialAddress,
                    rules: [{ required: true, message: '请输入收件地址' }],
                  })(
                    <Cascader options={divisions} placeholder="请选择" popupClassName="cascaderPop" />,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="联系电话"
                  {...formItemLayout}
                >
                  {getFieldDecorator('telephone', {
                    initialValue: data.telephone,
                    rules: [{ validator: this.checkPhone.bind(this) }],
                  })(
                    <Input placeholder="请输入联系电话" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="详细地址"
                  {...formItemLayout}
                >
                  {getFieldDecorator('addressDetail', {
                    initialValue: data.addressDetail,
                    rules: [{ required: true, message: '请输入详细地址' }],
                  })(
                    <Input placeholder="请输入详细地址" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="物流运单号"
                  {...formItemLayout}
                >
                  {getFieldDecorator('logisticNo', {
                    initialValue: data.logisticNo,
                  })(
                    <Input placeholder="请输入物流运单号" />,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="物流公司名称"
                  {...formItemLayout}
                >
                  {getFieldDecorator('logisticCompany', {
                    initialValue: data.logisticCompany || undefined,
                    rules: [{ required: true, message: '请选择物流公司名称' }],
                  })(
                    <Select placeholder="请选择物流公司名称" allowClear  onChange={this.handleLogisticCompanyChange.bind(this)}>
                      {deliveryCompanyList.map(v => (
                        <Option key={v.name}>{v.name}</Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="物流状态"
                  {...formItemLayout}
                >
                  {getFieldDecorator('status', {
                    initialValue: data.status ? data.status.toString() : '0',
                  })(
                    <Select placeholder="请选择物流状态" allowClear>
                      <Option value="0" key="0">已预报</Option>
                      <Option value="1" key="1">快递已发货</Option>
                      <Option value="2" key="2">客户已收货</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="渠道"
                  {...formItemLayout}
                >
                  {getFieldDecorator('type', {
                    initialValue: data.type ? data.type.toString() : undefined,
                    rules: [{ required: true, message: '请选择渠道' }],
                  })(
                    <Select placeholder="请选择渠道" allowClear>
                      <Option value="1" key="1">包税线</Option>
                      <Option value="4" key="4">USA-P</Option>
                      <Option value="5" key="5">USA-C</Option>
                      <Option value="2" key="2">身份证线</Option>
                      <Option value="3" key="3">BC线</Option>
                      <Option value="6" key="6">邮客食品线</Option>
                      <Option value="8" key="8">4PX经济A线</Option>
                      <Option value="9" key="9">4PX经济B线</Option>
                      <Option value="7" key="7">邮客奶粉线</Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="运费"
                  {...formItemLayout}
                >
                  {getFieldDecorator('freight', {
                    initialValue: data.freight,
                  })(
                    <Input placeholder="请输入运费" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="邮编"
                  {...formItemLayout}
                >
                  {getFieldDecorator('postcode', {
                    initialValue: data.postcode,
                  })(
                    <Input placeholder="请输入邮编" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label="身份证号"
                  {...formItemLayout}
                >
                  {getFieldDecorator('idCard', {
                    initialValue: data.idCard,
                    rules: [{ validator: this.checkIdCard.bind(this) }],
                  })(
                    <Input placeholder="请输入身份证号" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label="备注"
                  {...formItemLayout}
                >
                  {getFieldDecorator('remark', {
                    initialValue: data.remark,
                  })(
                    <Input placeholder="请输入备注" />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Table rowSelection={rowSelection} columns={columns} dataSource={data.erpOrderList || []} rowKey={r => r.id} pagination={false} bordered />
            </Row>
            <br/>
            <Row>
            		<Col span={3}>
                		商品总金额: {data.totalSalePrice}
              	</Col>
            		<Col span={3}>
                		商品总净重(磅): {data.skuWeight}
              	</Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(DeliveryModal);
