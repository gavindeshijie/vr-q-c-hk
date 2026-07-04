# Scan API Contract

所有接口返回 JSON。错误统一：

~~~json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "中文错误信息"
  }
}
~~~

## POST /api/scans

创建扫描任务，返回 `scanId`、`uploadToken`、`appStartUrl` 和 `returnUrl`。

## GET /api/scans/:scanId

读取扫描任务。`ready` 时返回文件 URL、设备信息和尺寸数据。

## POST /api/scans/:scanId/upload

Header：

~~~text
Authorization: Bearer <uploadToken>
~~~

multipart/form-data 字段：

- `mode`
- `deviceInfo`
- `measurementsJson`
- `roomJson` 可选
- `modelUsdz` 必填
- `thumbnail` 可选
- `imagesZip` 可选

## POST /api/scans/:scanId/complete

Header：

~~~text
Authorization: Bearer <uploadToken>
~~~

用于 iOS 上传成功后标记任务为 `ready` 或 `failed`。

## POST /api/scans/:scanId/convert

如果配置 `USDZ_CONVERTER_ENDPOINT`，调用外部服务转换 GLB；未配置时跳过，结果页显示 USDZ Quick Look / 下载。
