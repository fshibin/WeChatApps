// 云函数入口文件
const cloud = require('wx-server-sdk')
//const jsPDF = require('jspdf');


cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

var totalMinutes = 0;

let getDuration = function(s1, s2) {
  let d1 = new Date('2000/01/01 ' + s1 + ':00');
  let d2 = new Date('2000/01/01 ' + s2 + ':00');
  let minutes = parseInt((d2.getTime() - d1.getTime()) / 1000 / 60);
  totalMinutes += minutes;
  let h = parseInt(minutes / 60); // hours
  let m = minutes % 60; // minutes
  let res = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
  return res;
};

// 云函数入口函数
exports.main = async (event, context) => {
  // below three lines must be present to avoid jspdf exceptions
  global.window = {document: {createElementNS: () => {return {}} }};
  global.navigator = {};
  global.btoa = () => {};

  const encoding = require('encoding')
  //const jsPDF = require ('jspdf'); // not working
  const jsPDF = require ("jspdf/dist/jspdf.node.min.js");

  var doc = new jsPDF()

  doc.setTextColor('#007aff')
  doc.setFont('CourierNew', 'italic')
  doc.setFontSize(20)

  var i;
  var line;
  var lines = [];
  var totalMinutes = 0;
  for (i = 0; i < event.data.length; i++) {
    let item = event.data[i];
    let duration = '00:00';
    if (item.startTime && item.stopTime) duration = getDuration(item.startTime, item.stopTime);
    line = item.date + '|' + item.startTime + '-' + item.stopTime + '=>' + duration;
    lines.push(line);
    line = '　' + item.pnum + '|' + item.driver;
    lines.push(line);
    line = '　' + item.goods + '|' + item.quarry + '|' + item.notes;
    lines.push(line);
  }
  let h = parseInt(totalMinutes / 60); // hours
  let m = totalMinutes % 60; // minutes
  let tt = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
  line = '总时间 (Total Time): ' + tt + '。';
  lines.push('');
  lines.push(line);

  let th = 10; // text height
  let gap = 5; // gap between lines
  const pw = 210; // page width
  const ph = 295; // page height
  const margin = 10; // margin on each side
  var x = margin;
  var y = margin;

  doc.text(event.site, x, y)
  y += (th + gap)

  for (i = 0; i < lines.length; i++) {
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    doc.text(lines[i], x, y)
    y += (th + gap)
  }

  /*
  doc.setDrawColor('#007aff')
  doc.text('Hello world! My name is Shibin.', 10, 100)
  doc.line(20,20,80,80)
  var i;
  for (i = 0; i < 500; i++) {
    doc.text('' + i, i, 50 + i * 15)
  }
  var width = doc.internal.pageSize.getWidth();
  var height = doc.internal.pageSize.getHeight();
  doc.text('width = ' + width + ', height = ' + height, 10, 50);
  */

  var data = doc.output()
  var buffer = encoding.convert(data, "utf-8")

  return await cloud.uploadFile({
    cloudPath: new Date().getTime() + '.pdf',
    fileContent: buffer,
  })
  // result: {"fileID":"cloud://helloworld-5dr58.6865-helloworld-5dr58-1302218110/demo.pdf","statusCode":-1,"errMsg":"uploadFile:ok"}
  // npm install --save wx-server-sdk@latest
  // npm install --save encoding@latest
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