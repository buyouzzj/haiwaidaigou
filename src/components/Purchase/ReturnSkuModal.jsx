import React, {
	Component
} from 'react';
import { connect } from 'dva';
import { Modal, message, Input, Upload, Row, Col, Select, DatePicker, Form, Icon, TreeSelect, Tabs, InputNumber, Radio, Button } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';

import check from '../../utils/checkLib';
import styles from './Purchase.less';

moment.locale('zh-cn');

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

let editor = null;

function toString(str, type) {
	if(typeof str !== 'undefined' && str !== null) {
		return str.toString();
	}
	if(type === 'SELECT') return undefined;
	return '';
}

class ReturnSkuModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			previewVisible: false,
			previewImage: '',
			allFileList: null,
			activeTab: '1',
			fileList: null,
		};

	}
	//提交退单原因和子订单ids
	handleSubmit() {
		const p = this;
		const {
			form,
			dispatch,
			taskDailyIds
		} = this.props;
		form.validateFieldsAndScroll((err, fieldsValue) => {
			if(err) {
				return;
			}
			dispatch({
				type: 'purchase/addReturnErpOrderIds',
				payload: { ...fieldsValue,
					erpIds: JSON.stringify(taskDailyIds)
				},
				cb() {
					p.closeModal();
				},
			});

		});

	}

	closeModal() {
		const {
			form,
			close
		} = this.props;
		form.resetFields();
		close();
		// 清理skuTable
		setTimeout(() => {
			// 清理编辑器
			if(editor) {
				editor.$txt.html('');
				editor.destroy();
			}
			editor = null;
			this.setState({
				activeTab: '1'
			});
		}, 100);
	}

	render() {
		const p = this;
		const {
			form,
			visible,
			allBrands = [],
			modalValues = {},
			tree = [],
			packageScales,
			loginRoler,
			orgList = [],
			fileValues = {},
			taskDailyIds = []
		} = this.props;
		const {
			previewVisible,
			previewImage,
			activeTab
		} = this.state;
		const {
			getFieldDecorator
		} = form;
		const modalProps = {
			visible,
			width: 800,
			wrapClassName: 'modalStyle',
			title: '选择退单原因',
			maskClosable: false,
			closable: true,
			onOk() {
				p.handleSubmit();
			},
			onCancel() {
				p.closeModal();
			},
		};

		const formItemLayout = {
			labelCol: {
				span: 11
			},
			wrapperCol: {
				span: 13
			},
		};

		return(
			<Modal
        {...modalProps}
        className={styles.modalStyle}
      >
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <Row>
                 <Col span={7}>
                  <FormItem
                    label="退单原因"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('purchaseRemark', {
                      rules: [{ required: true, message: '请选择原因' }],
                    })(
                      <Select placeholder="请选择" allowClear>
                        <Option value="缺货采购不到">缺货采购不到</Option>
                        <Option value="库存超卖">库存超卖</Option>
                        <Option value="没有此SKU">没有此SKU</Option>
                        <Option value="折扣结束">折扣结束</Option>
                      </Select>,
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
	const {
		packageScales
	} = state.fileManageSale;
	// const { allBrands } = state.products;
	return {
		packageScales,
	};
}

export default connect(mapStateToProps)(Form.create()(ReturnSkuModal));