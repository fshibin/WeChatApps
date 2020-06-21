// 云函数入口文件
const cloud = require('wx-server-sdk')
//const jsPDF = require('jspdf');


cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

var totalMinutes = 0;
var timeInMinutes = 0;

let getDuration = function(s1, s2) {
  let d1 = new Date('2000/01/01 ' + s1 + ':00');
  let d2 = new Date('2000/01/01 ' + s2 + ':00');
  let minutes = parseInt((d2.getTime() - d1.getTime()) / 1000 / 60);
  totalMinutes += minutes;
  timeInMinutes = minutes;
  let h = parseInt(minutes / 60); // hours
  let m = minutes % 60; // minutes
  let res = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
  return res;
};

let intToDuration = function(min) {
  let h = parseInt(min / 60); // hours
  let m = min % 60; // minutes
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

  //doc.setTextColor('#007aff')
  //doc.setFont('CourierNew', 'italic')
  //doc.setFontSize(20)

  // print headers
  doc.setFontSize(40);
  doc.text('Koh Brothers Limited', 10, 30)
  doc.setFontSize(15)
  doc.text('Client name: ' + event.site, 10, 40)
  doc.setFontSize(20)
  doc.setFont('times', 'normal')
  doc.text('Truck & Digger', 151, 23)
  doc.text('-Usage Report-', 152, 30)
  doc.line(10, 45, 200, 45)

  // print detailed usage
  let dateX = 10
  let pnumX = 30
  let startTimeX = 52
  let stopTimeX = 67
  let durationX = 80
  let descX = 92
  let notesX = 122
  var y = 50

  doc.setFontSize(10)
  doc.setFont('times', 'bold')
  doc.text('DATE', dateX, y)
  doc.text('PLATE#', pnumX, y)
  doc.text('START', startTimeX, y)
  doc.text('STOP', stopTimeX, y)
  doc.text('DUR', durationX, y)
  doc.text('DESCRIPTION', descX, y)
  doc.text('JOB ADDRESS / NOTES', notesX, y)

  y += 10
  doc.setFontSize(10)
  doc.setFont('times', 'normal')
  /*
  doc.text('2020-06-16', dateX, y)
  doc.text('FZY405(20TON)', pnumX, y)
  doc.text('09:00', startTimeX, y)
  doc.text('12:00', stopTimeX, y)
  doc.text('03h00m', durationX, y)
  doc.text('Digger Excavation', descX, y)
  doc.text('This is a note!', noteX, y)
  */

  let th = 5; // text height
  let gap = 2; // gap between lines
  const pw = 210; // page width
  const ph = 295; // page height
  const margin = 20; // margin on each side

  var i;
  for (i = 0; i < event.data.length; i++) {
    let item = event.data[i];
    let duration = '00:00';
    if (item.startTime && item.stopTime) {
      timeInMinutes = 0; // set in getDuration()
      duration = getDuration(item.startTime, item.stopTime);
      event.data[i].minutes = timeInMinutes;
    }
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    doc.text(item.date, dateX, y)
    doc.text(item.pnum, pnumX, y)
    doc.text(item.startTime, startTimeX, y)
    doc.text(item.stopTime, stopTimeX, y)
    doc.text(duration, durationX, y)
    doc.text(item.goods, descX, y)

    if (item.jobAddr != '') doc.text(item.jobAddr, notesX, y);
    else if (item.notes != '') doc.text(item.notes, notesX, y);
    y += th
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    
    if (item.jobAddr != '' && item.notes != '') doc.text(item.notes, notesX, y);

    y += (th + gap)
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
  }

  // total
  var diggers = [];
  var truck = {time: 0, loads: 0, usage: []};

  // get total usage data
  for (i = 0; i < event.data.length; i++) {
    let item = event.data[i];
    let pos = item.pnum.indexOf('-');
    if (pos == -1) { // truck
      truck.time += item.minutes;
      if (item.goods != 'Travel Time') truck.loads++;
      // if (item.goods == 'Travel Time') continue;
      let j = 0;
      for (j = 0; j < truck.usage.length; j++) {
        if (truck.usage[j].goods.toUpperCase() == item.goods.toUpperCase()) break;
      }
      if (j == truck.usage.length) { // not found
        truck.usage.push({
          goods: item.goods,
          count: 1,
        })
      } else {
        truck.usage[j].count++;
      }
    } else { // digger
      let tons = item.pnum.substr(pos + 1)
      let j = 0;
      for (j = 0; j < diggers.length; j++) {
        if (diggers[j].tons == tons) break;
      }
      if (j == diggers.length) { // not found
        diggers.push({
          tons: tons,
          usage: [{
            goods: item.goods,
            count: item.goods == 'Digger Transfer' ? 1 : item.minutes,
          }],
        })
      } else {
        let du = diggers[j].usage
        let k = 0;
        for (k = 0; k < du.length; k++) {
          if (du[k].goods == item.goods) break;
        }
        if (k == du.length) { // not found
          du.push({
            goods: item.goods,
            count: item.goods == 'Digger Transfer' ? 1 : item.minutes,
          })
        } else {
          du[k].count += (item.goods == 'Digger Transfer' ? 1 : item.minutes)
        }
      }
    }
  }

  // print total usage data
  let tX = 10;
  let catX = 10;
  let col0X = 30;
  let colGap = 29;

  doc.setFontSize(15)
  doc.setFont('times', 'bold')
  doc.text('Total', tX, y)
  doc.line(10, y + th + gap - 5, 200, y + th + gap - 5)

  if (truck.time > 0 || truck.usage.length > 0) {
    y += (th + gap)
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    doc.setFontSize(10)
    doc.setFont('times', 'bold')
    let n = 0;
    let m = 0;

    doc.text('Category', catX, y)
    doc.text('Total Time', col0X, y)
    doc.text('Total Loads', col0X + colGap, y)
    for (n = 0; n < truck.usage.length && n < 4; n++) {
      let item = truck.usage[n];
      doc.text(item.goods, col0X + (n + 2) * colGap, y)
    }

    y += (th + gap) - 2
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    doc.setFontSize(10)
    doc.setFont('times', 'normal')
    doc.text('Truck', catX, y)
    doc.text(intToDuration(truck.time), col0X, y)
    doc.text('' + truck.loads, col0X + colGap, y)
    for (n = 0; n < truck.usage.length && n < 4; n++) {
      let item = truck.usage[n];
      if (item.goods == 'Travel Time')
        doc.text('(' + item.count + ')', col0X + (n + 2) * colGap, y)
      else
        doc.text('' + item.count, col0X + (n + 2) * colGap, y)
    }

    if (truck.usage.length > 4) {
      y += (th + gap)
      if (y + th > ph - margin) {
        doc.addPage('a4')
        y = margin
      }
      doc.setFontSize(10)
      doc.setFont('times', 'bold')
      let n = 0;
      for (n = 4; n < truck.usage.length && n < 10; n++) {
        let item = truck.usage[n];
        doc.text(item.goods, col0X + (n - 4) * colGap, y)
      }
      y += (th + gap) - 2
      if (y + th > ph - margin) {
        doc.addPage('a4')
        y = margin
      }
      doc.setFontSize(10)
      doc.setFont('times', 'normal')
      for (n = 4; n < truck.usage.length && n < 10; n++) {
        let item = truck.usage[n];
        if (item.goods == 'Travel Time')
          doc.text('(' + item.count + ')', col0X + (n - 4) * colGap, y)
        else
          doc.text('' + item.count, col0X + (n - 4) * colGap, y)
      }
    }

    if (truck.usage.length > 10) {
      y += (th + gap)
      if (y + th > ph - margin) {
        doc.addPage('a4')
        y = margin
      }
      doc.setFontSize(10)
      doc.setFont('times', 'bold')
      let n = 0;
      for (n = 10; n < truck.usage.length && n < 16; n++) {
        let item = truck.usage[n];
        doc.text(item.goods, col0X + (n - 10) * colGap, y)
      }
      y += (th + gap) - 2
      if (y + th > ph - margin) {
        doc.addPage('a4')
        y = margin
      }
      doc.setFontSize(10)
      doc.setFont('times', 'normal')
      for (n = 10; n < truck.usage.length && n < 16; n++) {
        let item = truck.usage[n];
        if (item.goods == 'Travel Time')
          doc.text('(' + item.count + ')', col0X + (n - 10) * colGap, y)
        else
          doc.text('' + item.count, col0X + (n - 10) * colGap, y)
      }
    }
  }

  let di = 0;
  for (di = 0; di < diggers.length; di++) {
    y += (th + gap)
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    doc.setFontSize(10)
    doc.setFont('times', 'bold')
    doc.text('Category', catX, y)
    let item = diggers[di];
    let ui = 0;
    for (ui = 0; ui < item.usage.length; ui++) {
      let item2 = item.usage[ui];
      doc.text(item2.goods, col0X + ui * colGap, y)
    }
    y += (th + gap) - 2
    if (y + th > ph - margin) {
      doc.addPage('a4')
      y = margin
    }
    doc.setFontSize(10)
    doc.setFont('times', 'normal')
    doc.text('Digger-' + item.tons, catX, y)
    for (ui = 0; ui < item.usage.length; ui++) {
      let item2 = item.usage[ui];
      if (item2.goods == 'Digger Transfer') {
        doc.text('' + item2.count, col0X + ui * colGap, y)
      } else {
        doc.text(intToDuration(item2.count), col0X + ui * colGap, y)
      }
    }
  }

/*
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
  //var buffer = encoding.convert(data, "UTF-8")
  var fileName = event.site + '_' + event.startDate + '_TO_' + event.stopDate;
  fileName = fileName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  fileName = fileName + '_' + new Date().getTime();
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