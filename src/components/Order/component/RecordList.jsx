import React, { Component } from 'react';
import { Modal, Table } from 'antd';

export default class extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      visible: false,
    };
  }
  toggleVisible() {
    const p = this;
    this.setState({ visible: !this.state.visible }, () => {
      if (this.state.visible) {
        this.props.dispatch({
          type: 'inventory/queryRecordList',
          payload: { id: this.props.record.id },
          success(data) {
            p.setState({ data: data.data });
          },
        });
      }
    });
  }
  render() {
    const { record } = this.props;
    const columns = [
      { title: '主订单号', dataIndex: 'orderId', key: 'orderNo', width: 100 },
      { title: '子订单号', dataIndex: 'erpOrderId', key: 'erpNo', width: 150 },
      // { title: '商品名称', dataIndex: 'itemName', key: 'itemName', width: 150 },
      // { title: '图片',
      //   dataIndex: 'skuPic',
      //   key: 'skuPic',
      //   width: 80,
      //   render(text) {
      //     const picList = JSON.parse(text).picList;
      //     const t = picList.length ? JSON.parse(text).picList[0].url : '';
      //     return (
      //       t ? <Popover title={null} content={<img role="presentation" src={t} style={{ width: 400 }} />}>
      //         <img role="presentation" src={t} width={60} height={60} />
      //       </Popover> : '-'
      //     );
      //   },
      // },
      { title: 'SKU代码', dataIndex: 'skuCode', key: 'skuCode', width: 100 },
      { title: '订单所需数量', dataIndex: 'quantity', key: 'quantity' },
      { title: '配货数量', dataIndex: 'booked', key: 'booked' },
      { title: '配货方式', dataIndex: 'inventoryType', key: 'inventoryType', render: t => (t === 'INVENTORY' ? '现货' : t === 'TRANS_INV' ? '在途' : '-') },
      { title: '库位ID', dataIndex: 'inventoryAreaId', key: 'inventoryAreaId' },
      { title: '发货仓库', dataIndex: 'warehouseName', key: 'warehouseName' },
      { title: '货架号', dataIndex: 'positionNo', key: 'positionNo' },
    ];

    return (
      <span>
        <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={this.toggleVisible.bind(this)}>备货查询</a>
        <Modal
          width={800}
          title={`${record.itemName} - 备货查询`}
          visible={this.state.visible}
          onCancel={this.toggleVisible.bind(this)}
          footer={null}
        >
          <Table columns={columns} dataSource={this.state.data} rowKey={r => r.id} pagination={false} bordered />
        </Modal>
      </span>
    );
  }
}
