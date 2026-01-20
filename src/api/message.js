import request from '@/utils/request'

// 发送文本消息
export const sendTextMessage = (data) => {
  return request({
    url: '/chat/text-create',
    method: 'post',
    data
  })
}

// 发送图片消息
export const sendImageMessage = (receiverId, file) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: `/chat/image-create/${receiverId}`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取与指定用户的对话记录
export const getConversation = (otherId) => {
  return request({
    url: `/chat/conversation/${otherId}`,
    method: 'get'
  })
}

// 删除指定消息
export const deleteMessage = (messageId) => {
  return request({
    url: `/chat/delete/${messageId}`,
    method: 'delete'
  })
}

// 获取最近聊天的用户列表
export const getChatPartners = () => {
  return request({
    url: '/chat/chat-partners',
    method: 'get'
  })
}

