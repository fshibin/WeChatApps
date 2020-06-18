// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const _ = db.command;
    return await db.collection('siteuse').where({
      site: event.sites.length > 0 ? _.in(event.sites) : _.neq(''),
      date: _.gte(event.startDate).and(_.lte(event.stopDate)),
      startTime: _.gte(event.startTime),
      stopTime: _.lte(event.stopTime),
      driver: event.drivers.length > 0 ? _.in(event.drivers) : _.neq(''),
      pnum: event.pnums.length > 0 ? _.in(event.pnums) : _.neq(''),
      quarry: event.quarries.length > 0 ? _.in(event.quarries) : _.neq(''),
    }).get();
  } catch(e) {
    console.error(e)
  }
}