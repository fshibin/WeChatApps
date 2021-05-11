// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('clients').where({
      _id: event._id,
    }).update({
      data: {
        name: event.name,
        addr: event.addr,
        phone: event.phone,
        email: event.email,
      },
    })
  } catch(e) {
    console.error(e)
  }
}