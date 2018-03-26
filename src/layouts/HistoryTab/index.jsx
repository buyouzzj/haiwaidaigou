import React from 'react';
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;
// import styles from './style.less';

class HistoryTab extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
    };
  }
  componentWillMount() {
    window._renderHistoryTab = this.loadData.bind(this);
  }
  onEdit(key, action) {
    if (action === 'remove') window.removeHistoryTab(key, this.props.location.pathname);
  }
  loadData(data, route) {
    if (JSON.stringify(data) !== JSON.stringify(this.state.panes)) {
      setTimeout(() => {
        this.setState({ panes: data }, () => {
          if (typeof route !== 'undefined') this.routeLink(route);
        });
      }, 0);
    }
  }
  routeLink(key) {
    if (this.props.location.pathname !== key) {
      location.href = `#${key}`;
    }
  }
  render() {
    const { pathname } = this.props.location;
    return (
      <div className="history-tab">
        <Tabs
          activeKey={pathname}
          type="editable-card"
          onTabClick={this.routeLink.bind(this)}
          onEdit={this.onEdit.bind(this)}
          hideAdd
          animated={{ inkBar: false, tabPane: false }}
        >
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={this.state.panes.length > 1} />)}
        </Tabs>
      </div>
    );
  }
}

export default HistoryTab;
