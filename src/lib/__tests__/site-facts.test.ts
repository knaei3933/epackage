import { CLIENT_COUNT_LABEL, LEAD_TIME_LABEL, LEAD_TIME_MIN_DAYS, REPLY_TIME_LABEL, BUSINESS_HOURS_LABEL } from '../site-facts'

describe('site-facts', () => {
  it('決まった数字を持つ', () => {
    expect(CLIENT_COUNT_LABEL).toBe('100社以上')
    expect(LEAD_TIME_LABEL).toBe('最短30日')
    expect(LEAD_TIME_MIN_DAYS).toBe(30)
    expect(REPLY_TIME_LABEL).toBe('2営業日以内')
    expect(BUSINESS_HOURS_LABEL).toBe('平日 9:00-18:00')
  })
})
