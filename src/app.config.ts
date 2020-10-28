export default {
  pages: [
    'pages/index/index',
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
    selectedColor: '#42853e',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './images/home.png',
        selectedIconPath: 'images/homed.png'
      },
      {
        pagePath: 'pages/about/index',
        text: '我的',
        iconPath: './images/me.png',
        selectedIconPath: 'images/med.png'
      }]
  },
  cloud: true,
  entryPagePath: 'pages/index/index'
}
