import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Tabs, Button, Modal, Row, Col, Input, InputNumber } from 'antd';

const Pane = Tabs.TabPane;
const FormItem = Form.Item;

@window.regStateCache
class Journal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: true,
      visible: false,
    };
  }
  showModal(r) {
    this.setState({ visible: true }, () => {
      this.props.dispatch({ type: 'check/queryJournal', payload: { id: r.id } });
    });
  }
  handleSubmit() {
    const p = this;
    p.props.form.validateFields((err, values) => {
      if (err) return;
      p.props.dispatch({
        type: 'check/comfirmJournal',
        payload: { ...values },
      });
      p.handleCancel();
    });
  }
  handleCreateReceipt(r) {
    this.props.dispatch({ type: 'check/createReceipt', payload: { ...r } });
  }
  handleCancel() {
    this.setState({ visible: false });
  }
  render() {
    const p = this;
    const { unCheckedList = [], checkedList = [], modalValues = {}, form } = this.props;
    const { getFieldDecorator } = form;
    const { isChecked, visible } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const unCheckedColumns = [
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName' },
      { title: '价格', dataIndex: 'price', key: 'price' },
      { title: '数量', dataIndex: 'quantity', key: 'quantity' },
      { title: 'UPC', dataIndex: 'upc', key: 'upc' },
      { title: '主图', dataIndex: 'mainPic', key: 'mainPic' },
      { title: '地址', dataIndex: 'address', key: 'address' },
      { title: '备注', dataIndex: 'remark', key: 'remark' },
      { title: '操作',
        key: 'oper',
        render(t, r) {
          return <a href="javascript:void(0)" onClick={p.showModal.bind(p, r)}>确认流水</a>;
        },
      },
    ];
    const checkedColumns = [
      { title: '商品名称', dataIndex: 'itemName', key: 'itemName' },
      { title: '价格', dataIndex: 'price', key: 'price' },
      { title: '数量', dataIndex: 'quantity', key: 'quantity' },
      { title: 'UPC', dataIndex: 'upc', key: 'upc' },
      { title: '主图', dataIndex: 'mainPic', key: 'mainPic' },
      { title: '地址', dataIndex: 'address', key: 'address' },
      { title: '备注', dataIndex: 'remark', key: 'remark' },
    ];
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Tabs>
          <Pane tab="未确定流水单" key="0">
            <Table columns={unCheckedColumns} dataSource={unCheckedList} pagination={false} rowKey={record => record.id} />
          </Pane>
          <Pane tab="已确定流水单" key="1">
            <Button type="primary" disabled={isChecked} onClick={p.handleCreateReceipt.bind(this)}>生成小票</Button>
            <Table
              columns={checkedColumns}
              dataSource={checkedList}
              pagination={false}
              rowKey={record => record.id}
            />
          </Pane>
        </Tabs>
        <Modal
          visible={visible}
          title="确认"
          onOk={this.handleSubmit.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <Row>
            <Col span={11}>
              <FormItem
                label="商品名称"
                {...formItemLayout}
              >
                {modalValues.itemName}
              </FormItem>
            </Col>
            <Col span={11}>
              <FormItem
                label="地址"
                {...formItemLayout}
              >
                {modalValues.address}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <FormItem
                label="upc"
                {...formItemLayout}
              >
                {modalValues.upc}
              </FormItem>
            </Col>
            <Col span={11}>
              <FormItem
                label="地址"
                {...formItemLayout}
              >
                {getFieldDecorator('id', {
                  initialValue: modalValues.id && modalValues.id.toString(),
                })(<Input style={{ display: 'none' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={11}>
              <FormItem
                label="价格"
                {...formItemLayout}
              >
                {getFieldDecorator('price', {
                  initialValue: modalValues.price && modalValues.price.toString(),
                  rules: [{ required: true, message: '请输入价格' }],
                })(
                  <InputNumber style={{ width: '100%' }} placeholder="请输入价格" />,
                )}
              </FormItem>
            </Col>
            <Col span={11}>
              <FormItem
                label="数量"
                {...formItemLayout}
              >
                {getFieldDecorator('quantity', {
                  initialValue: modalValues.quantity && modalValues.quantity.toString(),
                  rules: [{ required: true, message: '请输入数量' }],
                })(
                  <InputNumber style={{ width: '100%' }} placeholder="请输入数量" />,
                )}
              </FormItem>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { unCheckedList, checkedList, modalValues } = state.check;
  return { unCheckedList, checkedList, modalValues };
}

export default connect(mapStateToProps)(Form.create()(Journal));
