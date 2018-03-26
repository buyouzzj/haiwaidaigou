import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, DatePicker, Button, Row, Col, Select, Form, Popconfirm, Popover, Modal } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@window.regStateCache
class UncompletePurchaseStorage extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      showDetail: false,
      title: '未完成详情', // modal的title
      taskDailyIds: [],
      detailData: [],
      selectedRowKeys: [],
    };
  }
 
    handleSubmit(e, page) {
    if (e) e.preventDefault();
    this.setState({ selectedRowKeys: [] }, () => {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        if (values.currentlyDate && values.currentlyDate[0] && values.currentlyDate[1]) {
          values.startTime = new Date(values.currentlyDate[0]).format('yyyy-MM-dd');
          values.endTime = new Date(values.currentlyDate[1]).format('yyyy-MM-dd');
        }
        delete values.currentlyDate;
        this.props.dispatch({
          type: 'purchase/purchaseNoCompleteTimeList',
          payload: {
            ...values,
            pageIndex: typeof page === 'number' ? page : 1,
          },
        });
      });
    });
  }
  
  exportNoCompleteDetail(currentlyDate) {  	
    this.props.dispatch({    	
      type: 'purchase/exportNoCompleteDetail',
      payload: { currentlyDate },
    });
  }

  purchaseNoCompleteDateil(r){
   	const p = this;
   	 this.props.dispatch({
          type:'purchase/purchaseNoCompleteDateil',
          payload:{currentlyDate:r.currentlyDate},
          cb(data) {
          	console.log(data);
          p.setState({
          detailData: data,
          showDetail: true,
        });
      },
      })
   }
  
  
  render() {
    const p = this;
    const { form, uncompleteTaskDailyOrder = [], noCompleteTimePage, total, noCompleteTimeTotal, editInfo = {}, buyer = [], dispatch } = p.props;
    const { getFieldDecorator,resetFields } = form;
    const { title, showDetail,detailData,selectedRowKeys} = p.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columnsList = [
      { title: '时间', dataIndex: 'currentlyDate', key: 'currentlyDate', width: 130, render(t) { return (t && t.split(' ')[0]) || '-'; } },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        width: 160,
        render(t, r) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.purchaseNoCompleteDateil.bind(p, r)} style={{ marginRight: 10 }}>查看详情</a>
              <a href="javascript:void(0)" onClick={p.exportNoCompleteDetail.bind(p, r.currentlyDate)} >导出</a>
            </div>);
        },
      },
    ];

			const columnsStorageList = [
			      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 80 },
			      { title: 'UPC', dataIndex: 'upc', key: 'upc', width: 80 },
			      { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 100 },
			      { title: '采购站点', dataIndex: 'buySite', key: 'buySite', width: 70 },
			      { title: '图片',
			        dataIndex: 'skuPic',
			        key: 'skuPic',
			        width: 80,
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
			      { title: '颜色', dataIndex: 'color', key: 'color', width: 60 },
			      { title: '规格', dataIndex: 'scale', key: 'scale', width: 60 },
			      { title: '未完成采购数量', dataIndex: 'purchaseNeed', key: 'purchaseNeed', width: 60  },
			    ];

    const paginationProps = {
      total:noCompleteTimeTotal,
      current: noCompleteTimePage,
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
            <Col span="10">
              <FormItem
                label="时间范围"
                {...formItemLayout}
                labelCol={{ span: 8 }}
              >
                {getFieldDecorator('currentlyDate')(<RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => { resetFields(); }}>清空</Button>
            </Col>
          </Row>
          <Row className="operBtn">
          </Row>
        </Form>
        <Row>
          <Col>
            <Table
              columns={columnsList}
              dataSource={uncompleteTaskDailyOrder}
              bordered
              size="large"
              rowKey={record => record.currentlyDate}
              pagination={paginationProps}
            />
          </Col>
        </Row>
        <Modal
          visible={showDetail}
          title="未完成详情"
          footer={null}
          width={1200}
          onCancel={() => this.setState({ showDetail: false })}
        >
          <Table columns={columnsStorageList}  dataSource={detailData} />
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const {noCompleteTimePageSize, noCompleteTimePage,editInfo,uncompleteTaskDailyOrder,noCompleteTimeTotal} = state.purchase;
  return {
    uncompleteTaskDailyOrder,
    noCompleteTimeTotal,
    noCompleteTimePage,
    noCompleteTimePageSize,
    editInfo,
  };
}

export default connect(mapStateToProps)(Form.create()(UncompletePurchaseStorage));
