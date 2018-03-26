import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, InputNumber, Select, Button, Row, Col, Form, Modal, Popconfirm } from 'antd';
import styles from './Products.less';

const FormItem = Form.Item;
const Option = Select.Option;

function toString(str, type) {
  if (typeof str !== 'undefined' && str !== null) {
    return str.toString();
  }
  if (type === 'SELECT') return undefined;
  return '';
}

@window.regStateCache
class PackageLevel extends Component {

  constructor() {
    super();
    this.state = {
      visible: false,
      title: '', // modal的title
    };
  }

  handleSubmit() {
    const { levelValues, dispatch } = this.props;
    this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }
      if (levelValues.data) {
        dispatch({
          type: 'pack/updatePackageLevel',
          payload: { ...fieldsValue, id: levelValues.data.id, pageIndex: 1 },
        });
      } else {
        dispatch({
          type: 'pack/addPackageLevel',
          payload: { ...fieldsValue, pageIndex: 1 },
        });
      }
      this.closeModal(false);
    });
  }

  showModal() {
    this.setState({ visible: true, title: '新增' });
  }

  closeModal(visible) {
    this.setState({
      visible,
    }, () => {
      this.props.dispatch({
        type: 'pack/saveLevel',
        payload: {},
      });
    });
  }

  handleQuery(record) {
    const p = this;
    p.setState({
      visible: true,
      title: '修改',
    }, () => {
      p.props.dispatch({
        type: 'pack/queryPackageLevel',
        payload: { id: record.id },
      });
    });
  }

  handleDelete(record) {
    this.props.dispatch({
      type: 'pack/deletePackageLevel',
      payload: { id: record.id },
    });
  }

  handleSelectScale(value) {
    const { scaleList, form } = this.props;
    scaleList.forEach((el) => {
      if (el.id.toString() === value) form.setFieldsValue({ packageEn: el.enName });
    });
  }

  render() {
    const p = this;
    const { form, levelList = [], levelValues = {}, scaleList = [], levelTotal } = p.props;
    const modalValues = levelValues.data || {};
    const { getFieldDecorator } = form;
    const { title, visible } = p.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };

    const columns = [
      { title: '包装规格名称', dataIndex: 'name', key: 'name' },
      { title: '包装规格类别英文名称', dataIndex: 'packageEn', key: 'packageEn' },
      { title: '包装级别', dataIndex: 'packageLevel', key: 'packageLevel' },
      { title: '包装规格ID', dataIndex: 'packageId', key: 'packageId' },
      { title: '重量(磅)', dataIndex: 'weight', key: 'weight' },
      { title: '操作',
        dataIndex: 'operator',
        key: 'operator',
        render(t, r) {
          return (
            <div className={styles.operation}>
              <a href="javascript:void(0)" onClick={p.handleQuery.bind(p, r)}>修改</a>
              <Popconfirm title="确定删除此规格？" onConfirm={p.handleDelete.bind(p, r)}>
                <a href="javascript:void(0)">删除</a>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    const modalProps = {
      title,
      visible,
      closable: true,
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal(false);
      },
    };
    const paginationProps = {
      total: levelTotal,
      pageSize: 20,
      onChange(page) {
        p.props.dispatch({
          type: 'pack/queryPackageLevelList',
          payload: { pageIndex: page },
        });
      },
    };

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Row>
          <Col className={styles.productModalBtn}>
            <Button type="primary" size="large" onClick={p.showModal.bind(p)}>新增规格</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              columns={columns}
              dataSource={levelList}
              bordered
              size="large"
              rowKey={record => record.id}
              pagination={paginationProps}
            />
          </Col>
        </Row>
        <Modal {...modalProps}>
          <Form>
            <FormItem
              label="包装规格类别名称"
              {...formItemLayout}
            >
              {getFieldDecorator('packageId', {
                initialValue: toString(modalValues.packageId, 'SELECT'),
                rules: [{ required: true, message: '请选择包装规格类别名称' }],
              })(
                <Select placeholder="请选择包装规格类别名称" onChange={this.handleSelectScale.bind(this)} optionLabelProp="title" allowClear>
                  {scaleList.map(el => <Option key={el.name} value={el.id.toString()} title={el.name}>{el.name}</Option>)}
                </Select>,
              )}
            </FormItem>
            <FormItem
              label="包装规格类别英文名称"
              {...formItemLayout}
            >
              {getFieldDecorator('packageEn', {
                initialValue: toString(modalValues.packageEn),
                rules: [{ required: true }],
              })(
                <Input placeholder="请选择包装规格类别名称" disabled />,
              )}
            </FormItem>
            <FormItem
              label="包装规格名称"
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                initialValue: toString(modalValues.name),
                rules: [{ required: true, message: '请输入包装规格名称' }],
              })(
                <Input placeholder="请输入包装规格名称" />,
              )}
            </FormItem>
            <FormItem
              label="包装级别"
              {...formItemLayout}
            >
              {getFieldDecorator('packageLevel', {
                initialValue: toString(modalValues.packageLevel, 'SELECT'),
                rules: [{ required: true, message: '请输入包装级别' }],
              })(
                <Select placeholder="请输入包装级别" allowClear>
                  <Option key="1">一级</Option>
                  <Option key="2">二级</Option>
                  <Option key="3">三级</Option>
                  <Option key="4">四级</Option>
                  <Option key="5">五级</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem
              label="重量(磅)"
              {...formItemLayout}
            >
              {getFieldDecorator('weight', {
                initialValue: toString(modalValues.weight),
                rules: [{ required: true, message: '请输入重量' }],
              })(
                <InputNumber step={0.01} placeholder="请输入重量" />,
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { levelList, levelValues, scaleList, levelTotal } = state.pack;
  return {
    levelValues,
    levelList,
    scaleList,
    levelTotal,
  };
}

export default connect(mapStateToProps)(Form.create()(PackageLevel));
