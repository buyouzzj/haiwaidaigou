import React, { Component } from 'react';
import { connect } from 'dva';
// import { Link } from 'dva/router';
import { Table, Button, Row, Col, Popconfirm } from 'antd';
import CategoryModal from './CategoryModal';

@window.regStateCache
class Category extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      title: '',
    };
  }

  showModal() {
    const p = this;
    p.setState({
      modalVisible: true,
      title: '新增',
    }, () => {
      p.props.dispatch({
        type: 'products/queryCatesTree',
        payload: {},
      });
    });
  }

  closeModal(modalVisible) {
    this.setState({
      modalVisible,
    }, () => {
      this.props.dispatch({
        type: 'cate/saveCate',
        payload: {},
      });
    });
  }

  updateModal(id) {
    const p = this;
    p.setState({
      modalVisible: true,
      title: '修改',
    }, () => {
      p.props.dispatch({ type: 'products/queryCatesTree', payload: {} });
      p.props.dispatch({
        type: 'cate/queryCate',
        payload: { id },
      });
    });
  }

  handleDelete(id) {
    this.props.dispatch({
      type: 'cate/deleteCate',
      payload: { id },
    });
  }

  render() {
    const p = this;
    const { cateList = [], cate = {}, tree = [], dispatch } = p.props;
    const { title } = this.state;
    cateList.forEach((item) => {
      if (item.children && item.children.length < 1) delete item.children;
    });
    const columns = [
      {
        title: '类目名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类目级别',
        dataIndex: 'level',
        key: 'level',
      },
      {
        title: '全路径', dataIndex: 'allPath', key: 'allPath', render(text) { return text || '-'; },
      },
      {
        title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        render(text, record) {
          return (
            <div>
              <a href="javascript:void(0)" style={{ marginRight: 10 }} onClick={p.updateModal.bind(p, record.id)}>修改</a>
              <Popconfirm title="确定删除此类目？" onConfirm={p.handleDelete.bind(p, record.id)}>
                <a href="javascript:void(0)" >删除</a>
              </Popconfirm>
            </div>);
        },
      },
    ];

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col className="operBtn">
            <Button type="primary" size="large" onClick={this.showModal.bind(this)}>添加</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columns}
              dataSource={cateList}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={false}
            />
          </Col>
        </Row>
        <CategoryModal
          visible={this.state.modalVisible}
          close={this.closeModal.bind(this)}
          tree={tree}
          cateData={cate}
          dispatch={dispatch}
          title={title}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { cateList, cate } = state.cate;
  const { tree } = state.products;
  return {
    cateList,
    cate,
    tree,
  };
}

export default connect(mapStateToProps)(Category);
