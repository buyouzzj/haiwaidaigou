import React, { Component } from 'react';

class ReportNoStock extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/ship/selectBinNoStockReport`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportNoStock;
