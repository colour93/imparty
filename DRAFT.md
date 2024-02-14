
## routes

### user

| 方式 | 路径 | 备注 |
|:----|:----|:----|
| GET | /user | 获取用户信息 |
| GET | /user/avatar/:uid | 获取某用户头像 |
| GET | /user/detail/:uid | 获取某用户信息 |
| PUT | /user/update | 更新用户信息 |
| POST | /user/upload_avatar | 上传头像 |

### auth

| 方式 | 路径 | 备注 |
|:----|:----|:----|
| POST | /auth/login | 登入 |
| POST | /auth/logout | 登出 |
| POST | /auth/register | 注册 |

### platform

| 方式 | 路径 | 备注 |
|:----|:----|:----|
| GET | /platform/list | 获取用户平台列表 |
| GET | /platform/detail/:pid | 获取某平台信息 |
| GET | /platform/join/:code | 获取邀请信息 (可以查询 public 的平台或者 invite code) |
| POST | /platform/join/:code | 加入某平台 |
| POST | /platform/new | 新建平台 |
| PUT | /platform/update/:pid | 更新平台信息 |
| DELETE | /platform/delete/:pid | 删除某平台 |
| GET | /platform/invite/:pid/list | 获取某平台邀请码列表 |
| POST | /platform/invite/:pid/new | 创建某平台邀请 |
| PUT | /platform/invite/:pid/update/:iid | 更新邀请信息 |
| DELETE | /platform/invite/:pid/delete/:iid | 删除邀请 |

### room

| 方式 | 路径 | 备注 |
|:----|:----|:----|
| GET | /room/list/:pid | 房间列表 |
| POST | /room/new/:pid | 新建房间 |
| PUT | /room/update/:rid | 更新房间信息 |
| POST | /room/join/:rid | 加入房间 |
| PUT | /room/update_detail/:rid | 更新加入后用户信息 |
| PUT | /room/quit/:rid | 退出房间 |