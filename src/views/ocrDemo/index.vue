<!--
 * @Author: 田凯龙 tzzhmmcc@163.com
 * @LastEditors: tiankailong tzzhmmcc@163.com
-->
<template>
    <div class="w-3/4 text-center mx-auto pt-44">
        <a-upload
            :custom-request="handleUpload"
            :file-list="fileList"
            multiple
            @change="handleChange"
            accept=".pdf,.png,.jpg,.jpeg"
        >
            <template #upload-button>
                <a-button type="primary">点击上传文件</a-button>
            </template>
        </a-upload>
        <div class="self-table">
            <a-table :columns="tableCol" :data="tableData" />
        </div> 
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { UploadFileToBase64 } from '@/api/selfDemo/index.js';

const fileList = ref([]);
const tableCol = ref([
    {
        title: '名称',
        dataIndex: 'name',
    },
    {
        title: '年龄',
        dataIndex: 'salary',
    },
    {
        title: '地址',
        dataIndex: 'address',
    },
    {
        title: '邮件',
        dataIndex: 'email',
    },
]);
const tableData = ref([]);

const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const allowedExtensions = /\.(pdf|png|jpg|jpeg)$/i;

// 暂存本批次文件，等所有文件收集完后批量发送
const pendingFiles = ref([]);
let batchTimer = null;

const sendBatch = async () => {
    if (pendingFiles.value.length === 0) return;
    const files = [...pendingFiles.value];
    pendingFiles.value = [];

    // 校验本批次全部文件，有一个不合法则全部取消
    const invalidFiles = files.filter(
        ({ file }) => !allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)
    );
    if (invalidFiles.length > 0) {
        Message.error(
            `仅支持上传 .pdf、.png、.jpg、.jpeg 格式的文件，本次上传已全部取消：${invalidFiles.map(({ file }) => file.name).join('、')}`
        );
        // 触发 onError 让组件把这批文件标记为失败，再清空列表
        files.forEach(({ onError }) => onError());
        fileList.value = [];
        return;
    }

    const formData = new FormData();
    files.forEach(({ file }) => formData.append('files', file));

    console.log(`批量上传 ${files.length} 个文件`, files.map(({ file }) => file.name));

    try {
        const res = await UploadFileToBase64(formData);
        console.log('------res----------', res);
        Message.success(`成功上传 ${files.length} 个文件！`);
        files.forEach(({ onSuccess }) => onSuccess());
    } catch (err) {
        Message.error('上传失败，请重试！');
        files.forEach(({ onError }) => onError(err));
    }
};

// custom-request：每个文件触发一次，统一收集后 debounce 批量发送
const handleUpload = (option) => {
    const { fileItem, onSuccess, onError, onProgress } = option;
    pendingFiles.value.push({ file: fileItem.file, onSuccess, onError, onProgress });

    // 清除上一次定时器，等同批次最后一个文件入队后再发送
    clearTimeout(batchTimer);
    batchTimer = setTimeout(sendBatch, 100);
};

// 文件列表变化回调
const handleChange = (fileListNew) => {
    fileList.value = fileListNew;
};
</script>
<style scoped>
.self-table {
    margin-top: 20px;
}
</style>
