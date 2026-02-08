import request from '@/utils/request'

export function getBill(billId) {
    return request.get(`/bill/${billId}/get`)
}

export function payDepositRequest(billId) {
    return request.post(`/bill/pay/deposit/${billId}`)
}

export function payFinalRequest(billId) {
    return request.post(`/bill/pay/final/${billId}`)
}
1