import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Row, Col, Button, Input, Popover, Select, Icon, InputNumber} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class CheckStockIn extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
    };
  }
  toggleVisible() {
    this.setState({ visible: !this.state.visible }, () => {
      setTimeout(() => { this.props.form.resetFields(['quantity', 'positionNo']); }, 0);
    });
  }
  submit() {
    const { record, form, handleSubmit, page } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      this.toggleVisible();
      this.props.dispatch({
       type: 'inventory/checkStockIn',
        payload: { ...values, skuId: record.skuId, warehouseId: values.warehouseId ,id : record.id},
        cb() { handleSubmit(null, page); },
      });
    });
  }
  render() {
    const p = this;
    const { record, form, wareList=[] } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Popover
        content={<Form>
          <div style={{ margin: '12px 0 12px' }}>商品名称：{record.itemName}</div>
          <FormItem
               label="仓库"
               labelCol={{ span: 7 }}
               wrapperCol={{ span: 17 }}
              >
                {getFieldDecorator('warehouseId', {rules: [{ required: true, message: '请选择' }],})(
                  <Select placeholder="请选择仓库" allowClear getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {wareList.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>
                  )}
          </FormItem>
          <FormItem
            label="入仓数量"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
          >
            {getFieldDecorator('quantity', {
              initialValue: 1,
              rules: [{ required: true, message: '请输入' }],
            })(
              <InputNumber placeholder="请输入" step={1} />,
            )}
          </FormItem>
          <FormItem
            label="货架号"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
          >
            {getFieldDecorator('positionNo', {
              initialValue: record.positionNo,
              rules: [{ required: true, message: '请输入' }],
            })(
              <Input placeholder="请输入" />,
            )}
          </FormItem>
          <Button size="small" type="primary" onClick={this.submit.bind(this)}>保存</Button>
        </Form>}
        title="库存盘进"
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.toggleVisible.bind(this)}
      >
        <a href="javascript:void(0)" style={{ marginRight: 10 }}>盘进真实仓</a>
      </Popover>
    );
  }
}
function mapStateToProps(state) {
  const { list, total, wareList, currentPage,stockList,currentPageone,currentPageSizeone,stockTotal } = state.inventory;
  return { list, total, wareList, currentPage,stockList,currentPageone,currentPageSizeone,stockTotal };
}
export default Form.create()(CheckStockIn);
