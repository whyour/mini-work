export default {
  pages: [
    'pages/index/index',
    'pages/manage/index',
    'pages/about/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#444444',
    selectedColor: '#6190E8',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'images/home.png',
        selectedIconPath: 'images/homed.png'
      },
      {
        pagePath: 'pages/manage/index',
        text: '管理',
        iconPath: 'images/manage.png',
        selectedIconPath: 'images/managed.png'
      },
      {
        pagePath: 'pages/about/index',
        text: '我的',
        iconPath: 'images/me.png',
        selectedIconPath: 'images/med.png'
      }]
  },
  cloud: true
}
