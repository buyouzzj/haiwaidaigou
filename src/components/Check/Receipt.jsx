import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Button } from 'antd';

@window.regStateCache
class Receipt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkId: [],
    };
  }
  handlePreStock() {
    const { checkId } = this.state;
    this.props.dispatch({
      type: 'check/confirmPreStock',
      payload: { receiptIds: JSON.stringify(checkId) },
    });
  }
  render() {
    const p = this;
    const { receiptList = [] } = this.props;
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        const listId = [];
        selectedRows.forEach((el) => {
          listId.push(el.id);
        });
        p.setState({ checkId: listId });
      },
      selectedRowKeys: p.state.checkId,
    };
    const columns = [
      { title: '小票单号', dataIndex: 'receiptNo', key: 'receiptNo' },
      { title: '总价', dataIndex: 'totalPrice', key: 'totalPrice' },
    ];
    const isNotSelected = p.state.checkId.length === 0;
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row className="operBtn">
          <Col span={2} push={22}>
            <Button type="primary" disabled={isNotSelected} size="large" onClick={p.handlePreStock.bind(p)}>确认入库</Button>
          </Col>
        </Row>
        <Table columns={columns} rowSelection={rowSelection} dataSource={receiptList} pagination={false} rowKey={record => record.id} bordered />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { receiptList } = state.check;
  return { receiptList };
}

export default connect(mapStateToProps)(Receipt);
