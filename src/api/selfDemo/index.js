import service from '@/utils/request';

// selfDemo 模块的接口从这里统一收口。
// 后续需要具体接口时，直接基于 service.get/post/put/delete 继续补充即可。
// 上传
export function UploadFileToBase64(data) {
  return service.upload(
    "/Base_Manage/Upload/UploadFileToBase64",
    data
  );
}

// 上传
// export function UploadFileToBas(params) {
//   return service({
//     url: "/Base_Manage/Upload/UploadFileToBas",
//     method: "get",
//     params,
//     responseType: "blob",
//   });
// }
