// 云函数入口文件
const cloud = require('wx-server-sdk')
//const jsPDF = require('jspdf');


cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  global.window = {document: {createElementNS: () => {return {}} }};
  global.navigator = {};
  global.btoa = () => {};
  // above three lines must be present to avoid exceptions

  const encoding = require('encoding')
  // const jsPDF = require ('jspdf'); // not working
  const jsPDF = require ("jspdf/dist/jspdf.node.min.js");
  var doc = new jsPDF()
  doc.text('Hello world! My name is Shibin.', 10, 10)
  var data = doc.output()
  var buffer = encoding.convert(data, "Latin_1")

  return await cloud.uploadFile({
    cloudPath: 'demo2.pdf',
    fileContent: buffer,
  })
  // result: {"fileID":"cloud://helloworld-5dr58.6865-helloworld-5dr58-1302218110/demo.pdf","statusCode":-1,"errMsg":"uploadFile:ok"}
  // npm install --save wx-server-sdk@latest
  // npm install --save encoding@latest
  // npm install --save jspdf@latest
}