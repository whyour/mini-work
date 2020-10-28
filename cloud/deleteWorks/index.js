// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  return db.collection('works').where({
    _id: _.in(event.ids),
    openId: event.openId,
    done: false
  }).remove()
}