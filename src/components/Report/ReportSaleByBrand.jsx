import React, { Component } from 'react';

class SaleReportByBrand extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/sale/selectSaleReportByBand`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default SaleReportByBrand;
