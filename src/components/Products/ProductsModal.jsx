import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Input, Upload, Row, Col, Select, DatePicker, Form, Icon, TreeSelect, Tabs, InputNumber, Radio, Video, Button } from 'antd';
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

class ProductsModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewVisibleVideo: false,
      disabledVideo: false,
      disabledVideoPart: true,
      previewImage: '',
      picList: null,
      videoList: null,
      previewVideo: '',
      activeTab: '1',
    };
    // skuTable改写父级方法
    this.getSkuValue = null;
    this.clearSkuValue = null;
  }

  changeActiveKey(id) {
    if (id === '2') {
      if (editor) editor.undestroy();
      else {
        /* eslint-disable */
        setTimeout(() => {
          editor = new wangEditor('editor-area');
          editor.config.uploadImgUrl = '/haierp1/uploadFile/picUpload';
          editor.config.uploadImgFileName = 'pic';

          // 自定义load事件
          editor.config.uploadImgFns.onload = function (resultText, xhr) {
            var originalName = editor.uploadImgOriginalName || '';
            editor.command(null, 'insertHtml', '<img src="' + JSON.parse(resultText).data + '" alt="' + originalName + '" style="max-width:100%;"/>');
          };
          editor.create();

          // 赋值
          const { modalValues } = this.props;
          //editor.$txt.html(modalValues && modalValues.data && decodeURIComponent(modalValues.data.detail || ''));
          editor.$txt.html(modalValues && modalValues.data && modalValues.data.detail);
        }, 0);
        /* eslint-enable */
      }
    }
    this.setState({ activeTab: id });
  }

  handleSubmit() {
    const p = this;
    const { form, dispatch, modalValues } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        return;
      }

      // 检验sku是否填写
      p.getSkuValue((skuList) => {
        const values = {
          ...fieldsValue,
          startDate: fieldsValue.startDate && fieldsValue.startDate.format('YYYY-MM-DD'),
          endDate: fieldsValue.endDate && fieldsValue.endDate.format('YYYY-MM-DD'),
          bookingDate:fieldsValue.bookingDate && fieldsValue.bookingDate.format('YYYY-MM-DD HH:mm:ss'),
          skuList: JSON.stringify(skuList),
        };

        // 处理图片
        if (values.mainPic) {
          const uploadMainPic = [];
          const mainPicNum = values.mainPicNum;
          values.mainPic.forEach((el, index) => {
            uploadMainPic.push({
              type: el.type,
              uid: `i_${index}`,
              url: el.url || el.response.data,
            });
          });
          values.mainPic = JSON.stringify({ picList: uploadMainPic, mainPicNum });
        }
        
        // 处理视频
        if (values.video.length != 0) {
          const uploadMainVideo = [];
          values.video.forEach((el) => {
          	if(el.response){
          		uploadMainVideo.push({
              url: el.url || el.response.data,
            });
           }
          });
          values.video = uploadMainVideo[0].url;
        }

        // 处理图文详情
        const detailInfo = editor && editor.$txt && editor.$txt.html();
        const lastDetailInfo = modalValues && modalValues.data && modalValues.data.detail;
        values.detail = detailInfo ? encodeURIComponent(detailInfo) : lastDetailInfo ? encodeURIComponent(lastDetailInfo) : '';
        if (modalValues && modalValues.data) {
          dispatch({
            type: 'products/updateProducts',
            payload: { ...values, id: modalValues.data.id },            
            cb() { p.closeModal(); },
          });
        } else {
          dispatch({
            type: 'products/addProducts',
            payload: { ...values },
            cb() { p.closeModal(); },
          });
        }
      });
    });
  }

  closeModal() {
    const { form, close } = this.props;
    form.resetFields();
    close();
    // 清理skuTable
    setTimeout(() => {
      this.clearSkuValue();
      // 清理编辑器
      if (editor) {
        editor.$txt.html('');
        editor.destroy();
      }
      editor = null;
      this.setState({ activeTab: '1', disabledVideo: false });
    }, 100);
  }

  handleCancel() {
    this.setState({ previewVisible: false });
  }
  handleCancelVideo() {
    this.setState({ previewVisibleVideo: false });
  }
  checkImg(rules, values, cb) {
    cb();
  }

  checkTel(rules, value, cb) {
    if (value && !check.phone(value)) cb('请输入正确的手机号码');
    cb();
  }

  checkEndDate(rules, value, cb) {
    const { getFieldValue } = this.props.form;
    if (!value) cb('请选择日期');
    if (!getFieldValue('startDate') && value) cb('请先填写开始时间');
    cb();
  }

  disabledEndDate(endDate) {
    const { getFieldValue } = this.props.form;
    const startDate = getFieldValue('startDate');
    if (!startDate) return false;
    return endDate < startDate;
  }

  checkMainPicNum(rules, value, cb) {
    if (this.props.form.getFieldValue('mainPic').length > 0 && !value) {
      cb(new Error('请选择主图'));
    } else cb();
  }

  interator(arr, value, data = []) {
    const p = this;
    arr.forEach((el) => {
      if (el.id.toString() === value) data.push(el);
      else if (el.children.length) p.interator(el.children, value, data);
    });
    return data;
  }

  chooseCate(rules, value, cb) {
    const { tree } = this.props;
    if (!value) cb('请选择类目');
    else {
      const data = this.interator(tree, value) || [];
      if (data[0] && data[0].level !== 3) cb('只能选择最后一级类目');
    }
    cb();
  }

  render() {
    const p = this;
    const { form, visible, allBrands = [], modalValues = {}, tree = [], packageScales, scaleTypes,loginRoler } = this.props;
    const { previewVisible, previewVisibleVideo, previewImage, previewVideo, activeTab, disabledVideo, disabledVideoPart } = this.state;
    const { getFieldDecorator } = form;

    // 图片字符串解析
    let mainPicNum;
    let picList = [];
    if (modalValues.data && modalValues.data.mainPic) {
      const picObj = JSON.parse(modalValues.data.mainPic);
      mainPicNum = toString(picObj.mainPicNum, 'SELECT') || '1';
      picList = picObj.picList || [];
      
      console.log(modalValues.data)
    }
    // 视频字符串解析
    let videoList = [];
    let videoListPart = [];
    if (modalValues.data && modalValues.data.video) {
	    	videoListPart.push({
	    		uid: -1,
	    		url: modalValues.data.video,
	    		name: '点击查看视频',
	    		status: 'done',
	    		response: true,
	    	});
      videoList = videoListPart || [];      
    }
    // 详情数据
    const productData = (modalValues && modalValues.data) || {};
    
    const modalProps = {
      visible,
      width: 1400,
      wrapClassName: 'modalStyle',
      title: productData.itemCode ? '修改' : '添加',
      maskClosable: false,
      closable: true,
      onOk() {
        p.handleSubmit();
      },
      onCancel() {
        p.closeModal();
      },
    };
    const uploadProps = {
      action: '/haierp1/uploadFile/picUpload',
      listType: 'picture-card',
      multiple: true,
      data(file) {
        return {
          pic: file.name,
        };
      },
      beforeUpload(file) {
        const isImg = file.type === 'image/jpeg' || file.type === 'image/bmp' || file.type === 'image/gif' || file.type === 'image/png';
        if (!isImg) { message.error('请上传图片文件'); }
        return isImg;
      },
      name: 'pic',
      onPreview(file) {
        p.setState({
          previewVisible: true,
          previewImage: file.url || file.thumbUrl,
        });
      },
      onChange(info) {
        if (info.file.status === 'done') {
          if (info.file.response && info.file.response.success) {
            message.success(`${info.file.name} 成功上传`);
            // 添加文件预览
            const newFile = info.file;
            newFile.url = info.file.response.data;
          } else { message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`); }
        } else if (info.file.status === 'error') { message.error(`${info.file.name} 上传失败`); }
        // 主图选项增删联动
        const fileList = p.state.picList || [];
        const newFileList = info.fileList;
        const selectedMainPicNum = p.props.form.getFieldValue('mainPicNum');
        if (newFileList.length === 1 || (newFileList.length < fileList.length && selectedMainPicNum > newFileList.length)) {
          p.props.form.setFieldsValue({ mainPicNum: '1' });
        }
        p.setState({ picList: info.fileList });
      },
    };
    
    const uploadVideoProps = {
        action: '/haierp1/uploadFile/videoUpload',
        //disabled: modalValues.data ? disabledVideoPart : disabledVideo,
        disabled: modalValues.data ? (modalValues.data.video ? disabledVideoPart : disabledVideo) : disabledVideo,
    
        data(file) {
            return {
                pic: file.name,
            };
        },
        beforeUpload(file) {
            const isVideo = file.type === 'video/mp4' || file.type === 'audio/mp4' || file.type === 'video/mpeg';
            if(!isVideo) {
                message.error('请上传视频');
            }
            return isVideo;
        },
        name: 'pic',
        onPreview(file) {
            p.setState({
                previewVisibleVideo: true,
                previewVideo: file.url || file.response.data,
            });
            document.getElementById('itemVideo').src = (file.url || file.response.data);
        },
        onRemove(file) {
            $.ajax({
                url: "/haierp1/deleteFile/fileDelete",
                type: "POST",
                data: {
                    src: (file.url || file.response.data)
                },
                dataType: "json",
                success: function(result) {
                    //console.log(result);
                }
            });
            p.setState({
                disabledVideo: false,
                disabledVideoPart: false
            });
            return true;
        },
        onChange(info) {
            if(info.file.status === 'done') {
                if(info.file.response && info.file.response.success) {
                    message.success(`${info.file.name} 成功上传`);
                    p.setState({
                        disabledVideo: true,
                        disabledVideoPart: true
                    });
                } else {
                    message.error(`${info.file.name} 解析失败：${info.file.response.msg || info.file.response.errorMsg}`);
                }
            } else if(info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败`);
            }
            p.setState({
                videoList: info.fileList
            });
        },
    };
    
    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 13 },
    };
    const fileListSource = this.state.picList || picList;

    return (
      <Modal
        {...modalProps}
        className={styles.modalStyle}
      >
        <Tabs activeKey={activeTab} type="card" onChange={this.changeActiveKey.bind(this)}>
          <TabPane tab="基本信息" key="1">
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <Row>
                <Col span={7}>
                  <FormItem
                    label="所属类目"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('categoryId', {
                      initialValue: toString(productData.categoryId, 'SELECT'),
                      rules: [{ required: true, validator: this.chooseCate.bind(this) }],
                    })(
                      <TreeSelect placeholder="请选择所属类目" treeData={tree} />,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="品牌"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('brand', {
                      initialValue: toString(productData.brand, 'SELECT'),
                      rules: [{ required: true, message: '请输入品牌' }],
                    })(
                      <Select
                        allowClear
                        placeholder="请输入品牌"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      >
                        {allBrands && allBrands.map(item => <Option key={item.name}>{item.name}</Option>)}
                      </Select>,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="男女款"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('sexStyle', {
                      initialValue: productData.sexStyle,
                    })(
                      <Select placeholder="请选择" allowClear>
                        <Option key="男款">男款</Option>
                        <Option key="女款">女款</Option>
                        <Option key="大童男款">大童男款</Option>
                        <Option key="大童女款">大童女款</Option>
                        <Option key="小童男款">小童男款</Option>
                        <Option key="小童女款">小童女款</Option>
                        <Option key="大童款">大童款</Option>
                        <Option key="小童款">小童款</Option>
                        <Option key="婴儿款">婴儿款</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={7}>
                  <FormItem
                    label="英文名称"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('enName', {
                      initialValue: toString(productData.enName),
                      rules: [{ message: '请输入英文名称' }],
                    })(
                      <Input placeholder="请输入英文名称" />,
                    )}
                  </FormItem>
                </Col>
                <Col span={14}>
                  <FormItem
                    label="商品名称"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    style={{ marginLeft: 10 }}
                  >
                    {getFieldDecorator('name', {
                      initialValue: toString(productData.name),
                      rules: [{ required: true, message: '请输入商品名称' }],
                    })(
                      <Input placeholder="请输入商品名称" />,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={7}>
                  <FormItem
                    label="国家"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('country', {
                      initialValue: toString(productData.country, 'SELECT'),
                      rules: [{ required: true, message: '请选择国家' }],
                    })(
                      <Select placeholder="请选择国家" allowClear>
                        <Option value="1">美国</Option>
                        <Option value="2">德国</Option>
                        <Option value="3">日本</Option>
                        <Option value="4">澳洲</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="币种"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('currency', {
                      initialValue: toString(productData.currency, 'SELECT'),
                      rules: [{ required: true, message: '请选择币种' }],
                    })(
                      <Select placeholder="请选择币种" allowClear>
                        <Option value="1">人民币</Option>
                        <Option value="2">美元</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="是否身份证"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('idCard', {
                      initialValue: toString(productData.idCard, 'SELECT'),
                      rules: [{ required: true, message: '请选择是否身份证' }],
                    })(
                      <Select placeholder="请选择是否身份证" allowClear>
                        <Option value="1">是</Option>
                        <Option value="0">否</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={7}>
                  <FormItem
                    label="销售开始时间"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('startDate', {
                      initialValue: (productData.startDateStr && moment(productData.startDateStr, 'YYYY-MM-DD')) || undefined,
                      rules: [{ required: true, message: '请选择' }],
                    })(
                      <DatePicker format="YYYY-MM-DD" />,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="销售结束时间"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('endDate', {
                      initialValue: (productData.endDateStr && moment(modalValues.data.endDateStr, 'YYYY-MM-DD')) || undefined,
                      rules: [{ required: true, validator: this.checkEndDate.bind(this) }],
                    })(
                      <DatePicker format="YYYY-MM-DD" disabledDate={this.disabledEndDate.bind(this)} style={{ width: '100%' }} />,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="采购站点"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('buySite', {
                      initialValue: toString(productData.buySite),
                    })(
                      <Input placeholder="请输入采购站点" />,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
               <Col span={7}>
                  <FormItem
                    label="预售时间"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('bookingDate', {
                      initialValue: (productData.bookingDateStr && moment(modalValues.data.bookingDateStr, 'YYYY-MM-DD HH:mm:ss')) || undefined,
                      rules: [{ required: false, message: '请选择' }],
                    })(
                      <DatePicker
      showTime
      format="YYYY-MM-DD HH:mm:ss"
      placeholder="请选择预售时间"
    />,
                    )}
                  </FormItem>
                </Col>
               <Col span={7}>
                  <FormItem
                    label="小程序可售"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('wxisSale', {
                      initialValue: toString(productData.wxisSale!=0 ? 1 : 0),//神解决
                    })(
                      <RadioGroup>
                        <Radio value="1">是</Radio>
                        <Radio value="0">否</Radio>
                      </RadioGroup>,
                    )}
                  </FormItem>
                </Col>
                 <Col span={7}>
                  <FormItem
                    label="第三方销售平台"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('thirdSale', {
                      initialValue: toString(productData.thirdSale, 'SELECT'),
                      rules: [{ required: false, message: '请选择第三方销售' }],
                    })(
                      <Select placeholder="请选择第三方销售" allowClear>
                        <Option value="1">海狐</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={7}>
                  <FormItem
                    label="运费"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('freight', {
                      initialValue: toString(productData.freight),
                    })(
                      <InputNumber min={0} step={0.01} placeholder="请输入运费" />,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="发货方式"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('logisticType', {
                      initialValue: toString(productData.logisticType || 0),
                    })(
                      <RadioGroup>
                        <Radio value="0">直邮</Radio>
                        <Radio value="1">拼邮</Radio>
                      </RadioGroup>,
                    )}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem
                    label="商品代码"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('itemCode', {
                      initialValue: toString(productData.itemCode),
                      rules: [{ message: '请输入商品代码' }],
                    })(
                      <Input disabled placeholder="请输入商品代码" />,
                    )}
                  </FormItem>
                </Col>
                <Col span={14}>
                  <FormItem
                    label="备注"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 11 }}
                    style={{ marginRight: '-20px' }}
                  >
                    {getFieldDecorator('remark', {
                      initialValue: toString(productData.remark),
                      rules: [{ message: '请输入备注' }],
                    })(
                      <Input type="textarea" placeholder="请输入备注" />,
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormItem
                    label="添加图片"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 18 }}
                    style={{ marginRight: '-20px' }}
                  >
                    {getFieldDecorator('mainPic', {
                      initialValue: picList,
                      valuePropName: 'fileList',
                      getValueFromEvent(e) {
                        if (!e || !e.fileList) {
                          return e;
                        }
                        const { fileList } = e;
                        return fileList;
                      },
                      rules: [{ validator: this.checkImg.bind(this) }],
                    })(
                      <Upload {...uploadProps}>
                        <Icon type="plus" className={styles.uploadPlus} />
                        <div className="ant-upload-text">上传图片</div>
                      </Upload>,
                    )}

                    <Modal visible={previewVisible} title="预览图片" footer={null} onCancel={this.handleCancel.bind(this)}>
                      <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                {fileListSource.length > 0 && <Col span={7}>
                  <FormItem
                    label="选择主图"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('mainPicNum', {
                      initialValue: mainPicNum,
                      rules: [{ validator: this.checkMainPicNum.bind(this) }],
                    })(
                      <Select placeholder="请选择主图" allowClear>
                        {fileListSource.map((el, index) => (
                          <Option key={index} value={(index + 1).toString()}>{`图片${index + 1}`}</Option>
                        ))}
                      </Select>,
                    )}
                  </FormItem>
                </Col>}
              </Row>
              <Row>
                <Col>
                  <FormItem
                    label="添加视频"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 3 }}
                    style={{ marginRight: '-20px' }}
                  >
                    {getFieldDecorator('video', {
                      initialValue: videoList,
                      valuePropName: 'fileList',
                      getValueFromEvent(e) {
                        if (!e || !e.fileList) {
                          return e;
                        }
                        const { fileList } = e;
                        return fileList;
                      },
                    })(
                      <Upload {...uploadVideoProps}>
                        <Button>
                           <Icon type="upload" /> 上传视频
                        </Button>
                      </Upload>,
                    )}
                    <Modal visible={previewVisibleVideo} title="预览视频" footer={null} onCancel={this.handleCancelVideo.bind(this)}>
                      <video id="itemVideo" width="100%" height="500px" controls="controls" alt="example">
                      	<source src={previewVideo} type="video/mp4"/>
												<source src={previewVideo} type="video/webm"/>
                      	<source src={previewVideo} type="video/ogg"/>
                      </video>
                    </Modal>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <SkuTable
                  data={productData.itemSkus}
                  packageScales={packageScales}
                  scaleTypes={scaleTypes}
                  parent={p}
                />
              </Row>
            </Form>
          </TabPane>
          <TabPane tab="图文信息" key="2">
            <div id="editor-area" />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const { packageScales, scaleTypes } = state.sku;
  // const { allBrands } = state.products;
  return {
    packageScales,
    scaleTypes,
  };
}

export default connect(mapStateToProps)(Form.create()(ProductsModal));
