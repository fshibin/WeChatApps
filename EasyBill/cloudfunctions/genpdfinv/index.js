// 云函数入口文件
const cloud = require('wx-server-sdk')
//const jsPDF = require('jspdf');


cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  // below three lines must be present to avoid jspdf exceptions
  global.window = {document: {createElementNS: () => {return {}} }};
  global.navigator = {};
  global.btoa = () => {};

  const encoding = require('encoding')
  //const jsPDF = require ('jspdf'); // not working
  const jsPDF = require ("jspdf/dist/jspdf.node.min");

  var doc = new jsPDF()

  //doc.setTextColor('#007aff')
  //doc.setFont('CourierNew', 'italic')
  //doc.setFontSize(20)

  const pw = 210; // page width
  const ph = 295; // page height

  // print headers
  doc.setFontSize(30);
  doc.setFont('times', 'bold')
  doc.text('TAX  INVOICE', 80, 12)

  let s1 = 10
  doc.setFontSize(20);
  doc.setFont('times', 'bold')
  doc.text('The Fans Software', s1, 20)
  doc.setFontSize(12)
  doc.setFont('times', 'normal')
  doc.text('5 Dominion Street, Takapuna', s1, 25)
  doc.text('Auckland 0622, New Zealand', s1, 30)
  doc.text('Mobile: +64 (0)21 08150899', s1, 35)
  doc.text('Email: shibin.fan@gmail.com', s1, 40)
  doc.text('GST number: 119-156-009', s1, 45)

  doc.setFontSize(12)
  doc.setFont('times', 'normal')
  let s2 = 80
  let h = 20
  doc.text('Client: ' + event.client.name, s2, h)
  h += 5
  doc.text('Address: ' + event.client.addr, s2, h)
  h += 5
  doc.text('Phone: ' + event.client.phone, s2, h)
  h += 5
  doc.text('Email: ' + event.client.email, s2, h)
  h += 5
  doc.text('Invoice Number: ' + event.iid, s2, h)
  h += 5
  doc.text('Issue Date: ' + event.date, s2, h)
  h += 5

  // print table for items.
  let d = 6
  let c1 = 11, c2 = 101, c3 = 136, c4 = 171
  doc.line(10, h, 200, h)
  doc.line(c2 - 1, h, c2 - 1, h + d)
  doc.line(c3 - 1, h, c3 - 1, h + d)
  doc.line(c4 - 1, h, c4 - 1, h + d)

  doc.setFontSize(12)
  doc.setFont('times', 'bold')

  doc.text('Description', c1, h + 4)
  doc.text('Unit Price', c2, h + 4)
  doc.text('Quantity', c3, h + 4)
  doc.text('Subtotal', c4, h + 4)
  h += d
  doc.line(10, h, 200, h)

  let i;
  doc.setFontSize(12)
  doc.setFont('times', 'normal')
  for (i = 0; i < event.items.length; i++) {
    let item = event.items[i];
    doc.text(item.desc, c1, h + 4)
    doc.text("$" + item.prc, c2, h + 4)
    doc.text("" + item.qty, c3, h + 4)
    doc.text("$" + item.sub, c4, h + 4)
    doc.line(c2 - 1, h, c2 - 1, h + d)
    doc.line(c3 - 1, h, c3 - 1, h + d)
    doc.line(c4 - 1, h, c4 - 1, h + d)
    h += d
    doc.line(10, h, 200, h)
  }

  doc.setFontSize(12)

  doc.setFont('times', 'bold')
  doc.text("Total", c3, h + 4)
  doc.setFont('times', 'normal')
  doc.text("$" + event.totalWoGst, c4, h + 4)
  h += d
  doc.line(c3 - 1, h, 200, h)

  doc.setFont('times', 'bold')
  doc.text("GST", c3, h + 4)
  doc.setFont('times', 'normal')
  doc.text("$" + event.gst, c4, h + 4)
  h += d
  doc.line(c3 - 1, h, 200, h)

  doc.setFont('times', 'bold')
  doc.text("Total with GST", c3, h + 4)
  doc.setFont('times', 'normal')
  doc.text("$" + event.totalWiGst, c4, h + 4)
  h += d
  doc.line(c3 - 1, h, 200, h)

  doc.setFont('times', 'bold')
  doc.text("Paid Amount", c3, h + 4)
  doc.setFont('times', 'normal')
  doc.text("$" + event.paid, c4, h + 4)
  h += d
  doc.line(c3 - 1, h, 200, h)

  doc.setFont('times', 'bold')
  doc.text("Balance Due", c3, h + 4)
  doc.setFont('times', 'normal')
  doc.text("$" + event.due, c4, h + 4)
  h += d
  doc.line(c3 - 1, h, 200, h)

  h += d
  h += d
  doc.setFontSize(16)
  doc.text('Please remit your payment to ANZ bank account: 06-0122-0313873-01. Thank you!', 10, h)

  var data = doc.output()
  //var buffer = encoding.convert(data, "UTF-8")
  var fileName = event.iid;
  return await cloud.uploadFile({
    cloudPath: fileName + '.pdf',
    fileContent: data,
  })

  // result: {"fileID":"cloud://helloworld-5dr58.6865-helloworld-5dr58-1302218110/demo.pdf","statusCode":-1,"errMsg":"uploadFile:ok"}
  // npm install --save wx-server-sdk@latest
  // npm install --save encoding@latest  // 不需要
  // npm install --save jspdf@latest

  /*
    Error: errCode: -404011 cloud function execution error | errMsg: cloud.callFunction:fail requestID d3741fba-abcf-11ea-83c2-525400e7bfe4, cloud function service error code -504002, error message ReferenceError: html2pdf is not defined
    at :29470/var/user/node_modules/jspdf/dist/jspdf.min.js:202
    at module.exports (:29470/var/user/node_modules/jspdf/dist/jspdf.min.js:1)
    at Object.<anonymous> (:29470/var/user/node_modules/jspdf/dist/jspdf.min.js:1)
    at Module._compile (:29470/appservice/internal/modules/cjs/loader.js:701)
    at Object.Module._extensions..js (:29470/appservice/internal/modules/cjs/loader.js:712)
    at Module.load (:29470/appservice/internal/modules/cjs/loader.js:600)
    at tryModuleLoad (:29470/appservice/internal/modules/cjs/loader.js:539)
    at Function.Module._load (:29470/appservice/internal/modules/cjs/loader.js:531)
    at Module.require (:29470/appservice/internal/modules/cjs/loader.js:637)
    at require (:29470/appservice/internal/modules/cjs/helpers.js:22); at cloud.callFunction api; 
    at new u (WAService.js:1)
    at d (WAService.js:1)
    at f (WAService.js:1)
    at Function.success (WAService.js:1)
    at WAService.js:1
    at C (WAService.js:1)
    at i.<anonymous> (WAService.js:1)
    at i.emit (WAService.js:1)
    at Rs (WAService.js:1)
    at WAService.js:1
  */
}