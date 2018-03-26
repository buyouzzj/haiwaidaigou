import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, DatePicker, Button, Row, Col, Select, Form, Popconfirm, Popover, Modal } from 'antd';
import ReturnSkuModal from './ReturnSkuModal';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@window.regStateCache
class PuchaseNoSkuSeller extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      title: '', // modal的title
      taskDailyIds: [],
    };
  }

  handleSubmit(e, page, pageSize) {
    const p = this;
    const { skucurrentPageSize } = this.props;
    if (e) e.preventDefault();
    p.setState({ taskDailyIds: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
        if (err) return;
        if (fieldsValue.gmtCreate && fieldsValue.gmtCreate[0] && fieldsValue.gmtCreate[1]) {
          fieldsValue.startGmtCreate = new Date(fieldsValue.gmtCreate[0]).format('yyyy-MM-dd');
          fieldsValue.endGmtCreate = new Date(fieldsValue.gmtCreate[1]).format('yyyy-MM-dd');
        }
        delete fieldsValue.gmtCreate;
        this.props.dispatch({
          type: 'purchase/erpNoNeedtoPurchaseSku',
          payload: {
            ...fieldsValue,
            pageIndex: typeof page === 'number' ? page : 1,
            pageSize: pageSize || skucurrentPageSize,
          },
        });
      });
    });
  }
    showModal() {
    this.setState({
      modalVisible: true,
    });
  }

  closeModal(modalVisible) {
    this.setState({
      modalVisible,
    }, () => {
      this.props.dispatch({
        type: 'fileManageSale/saveFileManageSale',
        payload: {},
      });
      // 记忆状态的刷新
      this._refreshData();
    });
  }
  render() {
    const p = this;
    const { form, skutoSellerList = [], skucurrentPage, total, skuTotal, purchaseValues = {}, buyer = [], dispatch } = p.props;
    const { getFieldDecorator, resetFields } = form;
    const { title } = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '销售姓名', dataIndex: 'salesName', key: 'salesName', width: 80 },
      { title: 'skuCode', dataIndex: 'skuCode', key: 'skuCode', width: 90 },
      { title: 'sku图片',
        dataIndex: 'skuPic',
        key: 'skuPic',
        width: 100,
        render(text) {
          if (!text) return '-';
          const picList = JSON.parse(text).picList;
          const t = picList.length ? picList[0].url : '';
          return (
            t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
              <img role="presentation" src={t} width={60} height={60} />
            </Popover> : '-'
          );
        },
      },
    
    ];

    const paginationProps = {
      total:skuTotal,
      current: skucurrentPage,
      pageSize: 20,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
    };

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const listId = [];
        selectedRows.forEach((el) => {
          listId.push(el.id);
        });
        p.setState({ taskDailyIds: listId });
      },
      selectedRowKeys: p.state.taskDailyIds,
    };

    const isNotSelected = this.state.taskDailyIds.length === 0;

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="skuCode号码"
                {...formItemLayout}
              >
                {getFieldDecorator('skuCode', {})(
                  <Input placeholder="请输入SKU" />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => { resetFields(); }}>清空</Button>
            </Col>
          </Row>
        </Form>
        <Row className="operBtn">
          <Col>
            <Button type="primary" style={{ float: 'left', marginLeft: 10 }} disabled={isNotSelected} size="large" onClick={() => this.setState({ modalVisible: true })}>分发销售采购不到sku</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={skutoSellerList}
              bordered
              size="small"
              rowKey={record => record.id}
              pagination={paginationProps}
              rowSelection={rowSelection}
            />
          </Col>
        </Row>
        <ReturnSkuModal
          visible={this.state.modalVisible}
          close={this.closeModal.bind(this)}
          buyer={buyer}
          taskDailyIds={this.state.taskDailyIds}
          dispatch={dispatch}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const {receiptcurrentPageSize, receiptcurrentPage,purchaseValues,receiptList,receiptTotal,skutoSellerList,skuTotal} = state.purchase;
  return {
    receiptList,
    receiptTotal,
    receiptcurrentPage,
    receiptcurrentPageSize,
    purchaseValues,
    skutoSellerList,
    skuTotal,
  };
}

export default connect(mapStateToProps)(Form.create()(PuchaseNoSkuSeller));
