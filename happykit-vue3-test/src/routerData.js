const routerData = [
  {
    name: '看板',
    path: '/dashboard',
    view: '/dashboard',
    isRouter: true,
    isKeepalive: true,
    type: 'menu',
    children: [
      {
        name: '重置',
        permissionKey: 'reset',
        path: '',
        view: '',
        isRouter: false,
        isKeepalive: false,
        type: 'button',
        children: []
      },
      {
        name: '新增',
        permissionKey: 'add',
        path: '',
        view: '',
        isRouter: false,
        isKeepalive: false,
        type: 'button',
        children: []
      },
      {
        name: '编辑',
        permissionKey: 'edit',
        path: '',
        view: '',
        isRouter: false,
        isKeepalive: false,
        type: 'button',
        children: []
      }
      // {
      //   name: '编辑弹出框取消',
      //   permissionKey: 'cancel',
      //   path: '',
      //   view: '',
      //   isRouter: false,
      //   isKeepalive: false,
      //   type: 'button',
      //   children: []
      // }
    ]
  },
  {
    name: 'element ui',
    path: '/element',
    view: '/iframe',
    isRouter: true,
    isKeepalive: false,
    externalLink: true, //外链
    linkTarget: '_tab', //刷新自己
    externalLinkAddress: 'https://element.eleme.cn/#/zh-CN/component/changelog',
    type: 'menu',
    children: []
  },
  {
    name: 'Demo',
    path: '/demo',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: 'menu',
    children: [
      {
        name: '外部链接',
        path: '/links',
        view: '',
        isRouter: false,
        isKeepalive: false,
        type: 'menu',
        children: [
          {
            name: '松鼠乐园外部1',
            path: '',
            view: '',
            isRouter: true,
            isKeepalive: true,
            externalLink: true, //外链
            linkTarget: '_self', //刷新自己
            externalLinkAddress: 'http://www.squirrelzoo.com',
            type: 'menu',
            children: []
          },
          {
            name: '松鼠乐园外部2',
            path: '',
            view: '',
            isRouter: true,
            isKeepalive: true,
            externalLink: true, //外链
            externalLinkAddress: 'http://www.squirrelzoo.com',
            linkTarget: '_blank', //浏览器标签
            type: 'menu',
            children: []
          },
          {
            name: '松鼠乐园内部',
            path: '/squirrelzoo',
            view: '/iframe',
            isRouter: true,
            isKeepalive: true,
            externalLink: true, //外链
            externalLinkAddress: 'http://www.squirrelzoo.com',
            linkTarget: '_tab', //页内标签
            type: 'menu',
            children: []
          },
          {
            name: '百度内部',
            path: '/baidu',
            view: '/iframe',
            isRouter: true,
            isKeepalive: true,
            externalLink: true, //外链
            externalLinkAddress: 'http://www.baidu.com',
            linkTarget: '_tab', //页内标签
            type: 'menu',
            children: []
          }
        ]
      },
      {
        name: '用户',
        path: '/user-mgt',
        view: '',
        isRouter: false,
        isKeepalive: false,
        type: 'menu',
        children: [
          {
            name: '高级管理',
            path: '/adv',
            view: '',
            isRouter: false,
            isKeepalive: false,
            type: 'menu',
            children: [
              {
                name: '高级111',
                path: '/xxxxxx111',
                view: '/role',
                isRouter: true,
                isKeepalive: false,
                type: 'menu',
                children: []
              }
            ]
          }
        ]
      },
      {
        name: '测试管理',
        path: '', //TODO  这个路径要拼接进实际的路由 //如果父节点为空，那么就产生一个临时的
        view: '',
        isRouter: false,
        isKeepalive: false,
        type: 'menu',
        children: [
          {
            name: '测试项目组',
            path: '/test/aaa',
            view: '/role',
            isRouter: true,
            isKeepalive: false,
            type: 'menu',
            children: []
          }
        ]
      }
    ]
  },
  {
    name: '系统管理',
    path: '/system',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: 'menu',
    children: [
      {
        name: '用户管理',
        path: '/user',
        view: '/user',
        isRouter: true,
        isKeepalive: false,
        type: 'menu',
        children: []
      },
      {
        name: '角色管理',
        path: '/role',
        view: '/role',
        isRouter: true,
        isKeepalive: true,
        type: 'menu',
        children: [
          {
            name: '新增',
            permissionKey: 'add',
            path: '',
            view: '',
            isRouter: false,
            isKeepalive: false,
            type: 'button',
            children: []
          },
          {
            name: '编辑弹出框取消',
            permissionKey: 'cancel',
            path: '',
            view: '',
            isRouter: false,
            isKeepalive: false,
            type: 'button',
            children: []
          }
        ]
      },
      {
        name: '部门管理',
        path: '/department',
        view: '/department',
        isRouter: true,
        isKeepalive: false,
        type: 'menu',
        children: [
          {
            name: '新增',
            permissionKey: 'add',
            path: '',
            view: '',
            isRouter: false,
            isKeepalive: false,
            type: 'button',
            children: []
          }
        ]
      },
      {
        name: '区域管理',
        path: '/region',
        view: '/region',
        isRouter: true,
        isKeepalive: false,
        type: 'menu',
        children: [
          {
            name: '新增',
            permissionKey: 'add',
            path: '',
            view: '',
            isRouter: false,
            isKeepalive: false,
            type: 'button',
            children: []
          }
        ]
      },
      {
        name: '菜单管理',
        path: '/menu',
        view: '/menu',
        isRouter: true,
        isKeepalive: false,
        type: 'menu',
        children: [
          {
            name: '新增',
            permissionKey: 'add',
            path: '',
            view: '',
            isRouter: false,
            isKeepalive: false,
            type: 'button',
            children: []
          }
        ]
      },
      {
        name: '日志审计',
        path: '/log-report',
        view: '/log-report',
        isRouter: true,
        isKeepalive: false,
        type: 'menu',
        children: []
      }
    ]
  },
  {
    name: '字典管理',
    path: '/dictionary',
    view: '/dictionary',
    isRouter: true,
    isKeepalive: false,
    type: 'menu',
    children: []
  },
  {
    name: '隐藏路由1级',
    path: '/hide',
    view: '',
    isRouter: false,
    isKeepalive: false,
    type: 'menu',
    hide: true, //隐藏路由
    children: [
      {
        name: '隐藏路由2级',
        path: '/test',
        view: '/hide',
        isRouter: true,
        isKeepalive: false,
        type: 'menu',
        children: []
      }
    ]
  }
]

export default routerData
