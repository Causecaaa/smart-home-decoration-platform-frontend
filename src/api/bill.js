import request from '@/utils/request'

export function getBill(billId) {
    return request.get(`/bill/${billId}/get`)
}

export function payDeposit(billId) {
    return request.post(`/bill/pay/deposit/${billId}`)
}

export function payFinal(billId) {
    return request.post(`/bill/pay/final/${billId}`)
}
