import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Input, Upload, Row, Col, Select, DatePicker, Form, Icon, TreeSelect, Tabs, InputNumber, Radio,Button } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';

import check from '../../utils/checkLib';
import SkuTable from './SkuTable';
import styles from './Products.less';

moment.locale('zh-cn');

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

let editor = null;

function toString(str, type) {
  if (typeof str !== 'undefined' && str !== null) {
    return str.toString();
  }
  if (type === 'SELECT') return undefined;
  return '';
}

class FileModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      allFileList: null,
      activeTab: '1',
      fileList:null,
    };

  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
	      if (err) { return; }
		    // 处理图片
		    if (fieldsValue.fileUrl) {
		      const uploadMainPic = [];
		      fieldsValue.fileUrl.forEach((el, index) => {
		        uploadMainPic.push({
		          //type: el.type,
		          //uid: `i_${index}`,
		          url: el.url || el.response.data,
		        });
		      });
		      fieldsValue.fileUrl = JSON.stringify({ allFileList: uploadMainPic });
		    }
		
		    // 处理图文详情
		    const detailInfo = editor && editor.$txt && editor.$txt.html();
		    const lastDetailInfo = modalValues && modalValues.data && modalValues.data.detail;
		    fieldsValue.detail = detailInfo ? encodeURIComponent(detailInfo) : lastDetailInfo ? encodeURIComponent(lastDetailInfo) : '';
		    if (modalValues && modalValues.data) {
		      dispatch({
		        type: 'fileManageSale/updateFileManageSale',
		        payload: { ...fieldsValue, id: modalValues.data.id },
		        cb() { p.closeModal(); },
		      });
		    } else {
		      dispatch({
		        type: 'fileManageSale/addFileManageSale',
		        payload: { ...fieldsValue },
		        cb() { p.closeModal(); },
		      });
		    }
		});
  }

  closeModal() {
    const { form, close } = this.props;
    form.resetFields();
    close();
    // 清理skuTable
    setTimeout(() => {
      // 清理编辑器
      if (editor) {
        editor.$txt.html('');
        editor.destroy();
      }
      editor = null;
      this.setState({ activeTab: '1' });
    }, 100);
  }

  render() {
    const p = this;
    const { form, visible, allBrands = [], modalValues = {}, tree = [], packageScales,loginRoler,orgList = [], fileValues = {} } = this.props;
    const { previewVisible, previewImage, activeTab } = this.state;
    const { getFieldDecorator } = form;

    // 图片字符串解析
    let mainPicNum;
    let allFileList = [];
    if (modalValues.data && modalValues.data.fileUrl) {
      const picObj = JSON.parse(modalValues.data.fileUrl);
      mainPicNum = toString(picObj.mainPicNum, 'SELECT') || '1';
      allFileList = picObj.allFileList || [];
    }

    const modalProps = {
      visible,
      width: 1000,
      wrapClassName: 'modalStyle',
      title: '添加',
      maskClosable: false,
      closable: true,
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal();
      },
    };
    
   const propsUpload = {
      action: '/haierp1/uploadFile/fileUpload',
      multiple: true,
      data(file) {
        return {
          pic: file.name,
        };
      },
      name: 'pic',
      onPreview(file) {
        p.setState({
          previewVisible: true,
          previewImage: file.url || file.thumbUrl,
        });
      },
      onRemove(file) {
      	$.ajax({
				    url: "/haierp1/deleteFile/fileDelete",
				    type: "POST",
				    data: { src: file.response.data },
				    dataType: "json",
				    success: function (result) {
              //console.log(result);
				    }
				  });
      	p.setState({ disabledVideo: false, disabledVideoPart:false});
      	return true;
      },
      onChange(info){
      	if(info.file.status === 'done'){
      		if(info.file.response && info.file.response.success){
      			message.success(`${info.file.name} 上传成功`);
      		} else { message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`); }
      	} else if(info.file.status === 'error') {message.error(`{info.file.name} 上传失败`);}
      	p.setState({ allFileList: info.fileList });
      }
    };
    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };

    return (
      <Modal
        {...modalProps}
        className={styles.modalStyle}
      >
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <Row>
                <Col span={7}>
                  <FormItem
                    label="所属部门"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('organizationId', {
                     rules: [{ required: true, message: '请选择部门' }], 
                    })(
                     <Select placeholder="请选择部门" optionLabelProp="title" mode>
                    {orgList.map(el => <Option key={el.id} title={el.name}>{el.name}</Option>)}
                  </Select>,
                    )}
                  </FormItem>
                </Col>
                <Col span={14}>
                  <FormItem
                    label="文件名称"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    style={{ marginLeft: 10 }}
                  >
                    {getFieldDecorator('fileName', {
                      initialValue: toString(fileValues.fileName),
                      rules: [{ required: true, message: '请输入文件名称' }],
                    })(
                      <Input placeholder="请输入文件名称" />,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormItem
                    label="添加文件"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 18 }}
                    style={{ marginRight: '-20px' }}
                  >
                    {getFieldDecorator('fileUrl', {
                    	rules: [{ required: true, message: '请上传文件' }], 
                      initialValue: allFileList,
                      valuePropName: 'fileList',
                      getValueFromEvent(e) {
                        if (!e || !e.fileList) {
                          return e;
                        }
                        const { fileList } = e;
                        return fileList;
                      },
                    })(
                      <Upload {...propsUpload}>
                        <Button>
                           <Icon type="upload" /> upload
                        </Button>
                      </Upload>,
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const { packageScales } = state.fileManageSale;
  // const { allBrands } = state.products;
  return {
    packageScales,
  };
}

export default connect(mapStateToProps)(Form.create()(FileModal));
