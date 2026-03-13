<!--
 * @Author: 田凯龙 tzzhmmcc@163.com
 * @LastEditors: tiankailong tzzhmmcc@163.com
-->
<template>
    <div class="w-1/2 text-center mx-auto pt-44">
        <a-upload
            :custom-request="handleUpload"
            :before-upload="beforeUpload"
            :file-list="fileList"
            @change="handleChange"
            accept=".pdf,.png,.jpg,.jpeg"
        >
            <template #upload-button>
                <a-button type="primary">点击上传文件</a-button>
            </template>
        </a-upload>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { UploadFileToBase64 } from '@/api/selfDemo/index.js';

const fileList = ref<any[]>([]);

// 上传前校验文件格式
const beforeUpload = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const allowedExtensions = /\.(pdf|png|jpg|jpeg)$/i;

    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.test(file.name);
    if (!isValidType) {
        Message.error('仅支持上传 .pdf、.png、.jpg、.jpeg 格式的文件！');
        return false;
    }
    return true;
};

// 自定义上传请求
const handleUpload = async (option: any) => {
    const { file, onSuccess, onError } = option;
    const formData = new FormData();
    formData.append('files', file);

    try {
        const res = await UploadFileToBase64(formData);
        Message.success('上传成功！');
        onSuccess(res);
    } catch (err) {
        Message.error('上传失败，请重试！');
        onError(err);
    }
};

// 文件列表变化回调
const handleChange = (fileListNew: any[], file: any) => {
    fileList.value = fileListNew;
};
</script>
<style scoped></style>
