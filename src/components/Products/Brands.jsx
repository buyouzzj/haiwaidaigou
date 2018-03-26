import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Form, Table, Row, Col, Button, Modal } from 'antd';

const FormItem = Form.Item;

@window.regStateCache
class Brands extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '',
    };
  }
  handleSubmit(e) {
    if (e) e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      const { name, nameChina } = fieldsValue;
      this.props.dispatch({
        type: 'products/queryBrands',
        payload: { name, nameChina },
      });
    });
  }
  handleCancel() {
    this.setState({ visible: false }, () => {
      this.props.dispatch({
        type: 'products/saveBrand',
        payload: {},
      });
    });
  }
  showModal(id) {
    this.setState({
      visible: true,
      title: id ? '修改' : '新增',
    }, () => {
      if (id) {
        this.props.dispatch({
          type: 'products/queryBrand',
          payload: { id },
        });
      }
    });
  }
  handleDelete(id) {
    const p = this;
    this.props.dispatch({
      type: 'products/deleteBrand',
      payload: { id },
      cb() {
        p._refreshData();
      },
    });
  }
  handleOkClick() {
    const p = this;
    const { dispatch, brandValue, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      const { enName, cnName, nameAlias } = values;
      if (brandValue.id) {
        dispatch({
          type: 'products/updateBrand',
          payload: { name: enName, nameChina: cnName, nameAlias, id: brandValue.id },
          cb() {
            p.handleCancel();
            p._refreshData();
          },
        });
      } else {
        dispatch({
          type: 'products/addBrand',
          payload: { name: enName, nameChina: cnName, nameAlias },
          cb() {
            p.handleCancel();
            p._refreshData();
          },
        });
      }
    });
  }
  render() {
    const p = this;
    const { form, brandList = [], brandTotal, brandValue = {} } = this.props;
    const { visible, title } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 15 },
    };
    const columns = [
      { title: '品牌英文名', dataIndex: 'name', key: 'name' },
      { title: '品牌中文名', dataIndex: 'nameChina', key: 'nameChina' },
      { title: '品牌别名', dataIndex: 'nameAlias', key: 'nameAlias' },
      { title: '操作',
        key: 'oper',
        render(t, r) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.showModal.bind(p, r.id)} >修改</a>
              <a href="javascript:void(0)" onClick={p.handleDelete.bind(p, r.id)} style={{ margin: '0 10px' }} >删除</a>
            </div>
          );
        },
      },
    ];
    const paginationProps = {
      total: brandTotal,
      pageSize: 20,
      onChange(page) {
        p.props.dispatch({
          type: 'products/queryBrands',
          payload: { pageIndex: page },
        });
      },
    };
    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 800 }}>
            <Col span="8">
              <FormItem
                label="中文名"
                {...formItemLayout}
              >
                {getFieldDecorator('nameChina', {})(
                  <Input placeholder="请输入中文名" />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="英文名"
                {...formItemLayout}
              >
                {getFieldDecorator('name', {})(
                  <Input placeholder="请输入英文名" />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={() => { form.resetFields(); }}>清空</Button>
            </Col>
          </Row>
        </Form>
        <Row className="operBtn">
          <Col>
            <Button type="primary" size="large" onClick={p.showModal.bind(p, null)}>新增品牌</Button>
          </Col>
        </Row>
        <Table columns={columns} dataSource={brandList} pagination={paginationProps} rowKey={r => r.id} bordered />
        <Modal visible={visible} title={title} onCancel={this.handleCancel.bind(this)} onOk={this.handleOkClick.bind(this)}>
          <Row>
            <Col>
              <FormItem
                label="品牌英文名"
                {...formItemLayout}
              >
                {getFieldDecorator('enName', {
                  initialValue: brandValue.name,
                  rules: [{ required: true, message: '请输入' }],
                })(
                  <Input placeholder="请输入品牌名称" />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="品牌中文名"
                {...formItemLayout}
              >
                {getFieldDecorator('cnName', {
                  initialValue: brandValue.nameChina,
                })(
                  <Input placeholder="请输入品牌中文名" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="品牌别名"
                {...formItemLayout}
              >
                {getFieldDecorator('nameAlias', {
                  initialValue: brandValue.nameAlias,
                })(
                  <Input placeholder="请输入品牌别名" />,
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
  const { brandList, brandTotal, brandValue } = state.products;
  return { brandList, brandTotal, brandValue };
}

export default connect(mapStateToProps)(Form.create()(Brands));
