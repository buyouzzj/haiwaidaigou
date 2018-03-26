import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Row, Col, Form, Input, InputNumber, Popconfirm, Popover, Select, TreeSelect, Modal, Icon, DatePicker } from 'antd';
import FileModal from './FileModal';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@window.regStateCache
class FileManageSale extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      modalDownload: false,
      title:'',
      fileManage: [],
    };
  }

  handleSubmit(e, page, pageSize) {
    if (e) e.preventDefault();
    const { saleFilePageSize } = this.props;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (fieldsValue.saleDate && fieldsValue.saleDate[0] && fieldsValue.saleDate[1]) {
          fieldsValue.startGmt = new Date(fieldsValue.saleDate[0]).format('yyyy-MM-dd');
          fieldsValue.endGmt = new Date(fieldsValue.saleDate[1]).format('yyyy-MM-dd');
        }
        delete fieldsValue.saleDate;
      this.props.dispatch({
        type: 'fileManageSale/fileManageSaleList',
        payload: { ...fieldsValue, pageIndex: typeof page === 'number' ? page : 1, pageSize: pageSize || saleFilePageSize },
      });
    });
  }

  handleEmpty() {
    const { resetFields } = this.props.form;
    resetFields();
  }

  handleDelete(fileManageId) {
    const p = this;
    this.props.dispatch({
      type: 'fileManageSale/deleteFileManageSale',
      payload: { fileManageId },
      cb() { p._refreshData(); },
    });
  }
  updateModal(fileManageId) {
  	const p = this;
    const fileManageListpart = [];
    this.props.dispatch({
        type: 'fileManageSale/queryFileManageDownload',
        payload: { fileManageId },
        cb(data) {
        	const fileUrlJson = JSON.parse(data.fileUrl);
          const fileUrl = fileUrlJson.allFileList;
          for(var i=0; i<fileUrl.length; i++){
          	const fileManagePart = {};
          	const url = fileUrl[i].url;
          	const fileIndex = url.lastIndexOf("/")+1;
          	const fileUrlName= url.substring(fileIndex,url.size);
          	const startIndex = fileUrlName.lastIndexOf("*");
          	const startIndexOne = fileUrlName.lastIndexOf(".")+1;
          	const fileUrlNameMiddle = fileUrlName.substring(0,startIndex);
          	const fleUrlNameEnd = fileUrlName.substring(startIndexOne,fileUrlName.size);
          	const reallyName = fileUrlNameMiddle+"."+fleUrlNameEnd
          	fileManagePart.id = i+1;
          	fileManagePart.url = url;
          	fileManagePart.fileUrlName = reallyName;
          	fileManageListpart.push(fileManagePart);
          }
          p.setState({
          fileManage: fileManageListpart,
          modalDownload: true,
        });
       },
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

  handleEmptyInput(type) { // 清空内容
    const { setFieldsValue } = this.props.form;
    switch (type) {
      case 'fileName': setFieldsValue({ fileName: undefined }); break;
      case 'organizationId': setFieldsValue({ organizationId: undefined }); break;
      default: return false;
    }
  }

  showClear(type) { // 是否显示清除按钮
    const { getFieldValue } = this.props.form;
    const data = getFieldValue(type);
    if (data) {
      return <Icon type="close-circle" onClick={this.handleEmptyInput.bind(this, type)} />;
    }
    return null;
  }

  render() {
    const p = this;
    const { saleFileList = {}, saleFileTotal, currentPageFileIndex, fileData, form, packageScales,fileValues = {},orgList = [], userCreaterList = []} = this.props;
    const { modalDownload, title, fileManage} = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columns = [
      { title: '上传者', dataIndex: 'createBy', key: 'createBy', width: 100 },
      { title: '文件名称', dataIndex: 'fileName', key: 'fileName', width: 100 },
      { title: '所属部门', dataIndex: 'organizationName', key: 'organizationName', width: 100 },
      { title: '上传时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 100 },
      { title: '操作',
        dataIndex: 'oper',
        key: 'oper',
        width: 200,
        render(text, record) {
          return (
            <div>
              <a href="javascript:void(0)" onClick={p.updateModal.bind(p, record.id)}>下载详情</a>
              <Popconfirm title="确定删除此文件？" onConfirm={p.handleDelete.bind(p, record.id)}>
                <a style={{ marginLeft: 10 }} href="javascript:void(0)" >删除</a>
              </Popconfirm>
            </div>);
        },
      },
    ];

    const columnsFileList = [
      { title: '文件名称', dataIndex: 'fileUrlName', key: 'fileUrlName', width: 100 },
      { title: '操作',
        dataIndex: 'oper',
        key: 'oper',
        width: 100,
        render(text, record) {
          return (
            <div>
              <div><a href={record.url} >下载</a></div>
            </div>);
        },
      },
    ];

    const paginationProps = {
      total: saleFileTotal,
      defaultPageSize: 20,
      showSizeChanger: true,
      pageSizeOptions: ['20', '50', '100', '200', '500'],
      onShowSizeChange(current, size) {
        p.handleSubmit(null, 1, size);
      },
      current: currentPageFileIndex,
      onChange(pageIndex) {
        p.handleSubmit(null, pageIndex);
      },
    };

    return (
      <div>
        <div className="refresh-btn"><Button type="ghost" size="small" onClick={this._refreshData.bind(this)}>刷新</Button></div>
        <Form onSubmit={this.handleSubmit.bind(this)}>
          <Row gutter={20} style={{ width: 900 }}>
            <Col span="8">
              <FormItem
                label="文件名称"
                {...formItemLayout}
              >
                {getFieldDecorator('fileName', {})(
                  <Input placeholder="请输入文件名称" suffix={p.showClear('fileName')} />)}
              </FormItem>
            </Col>
            <Col span="8">
              <FormItem
                label="所属部门"
                {...formItemLayout}
              >
                {getFieldDecorator('organizationId', {})(
                  <Select placeholder="请选择部门" optionLabelProp="title" mode suffix={p.showClear('organizationId')}>
                    {orgList.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col span="8">
             <FormItem
                label="上传者"
                {...formItemLayout}
              >
                {getFieldDecorator('userCreate', {})(
                  <Select placeholder="请选择上传者" allowClear>
                    {userCreaterList.map(el => <Option key={el.id} value={el.loginName}>{el.name}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
            <Col span="24">
              <FormItem
                label="创建时间"
                {...formItemLayout}
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('saleDate')(<RangePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginLeft: 13 }}>
            <Col className="listBtnGroup">
              <Button htmlType="submit" size="large" type="primary">查询</Button>
              <Button size="large" type="ghost" onClick={this.handleEmpty.bind(this)}>清空</Button>
            </Col>
          </Row>
        </Form>
       <Row className="operBtn">
          <Col>
            <Button type="primary" style={{ float: 'left' }} size="large" onClick={() => this.setState({ modalVisible: true })}>添加文件</Button>
          </Col>
        </Row>
        <div style={{ height: 20 }} />
        <Row>
          <Col>
            <Table
              columns={columns}
              dataSource={saleFileList}
              bordered
              rowKey={record => record.id}
              pagination={paginationProps}
              scroll={{ y: 540, x: 300 }}
            />
          </Col>
        </Row>
        <FileModal
          visible={this.state.modalVisible}
          close={this.closeModal.bind(this)}
          modalValues={fileValues}
          orgList={orgList}
        />
        <Modal
          visible={modalDownload}
          title="下载详情"
          footer={null}
          width={1200}
          onCancel={() => this.setState({ modalDownload: false })}
        >
        <Table columns={columnsFileList}  dataSource={fileManage} rowKey="id" />
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { saleFileList, saleFileTotal, saleFilePageSize, currentPageFileIndex, fileData, packageScales,fileValues, orgList,userCreaterList} = state.fileManageSale;
  return {
    saleFileList,
    saleFileTotal,
    saleFilePageSize,
    currentPageFileIndex,
    fileData,
    packageScales,
    fileValues,
    orgList,
    userCreaterList,
  };
}

export default connect(mapStateToProps)(Form.create()(FileManageSale));
