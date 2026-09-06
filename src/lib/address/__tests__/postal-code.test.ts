import {
  isCompletePostalCode,
  lookupPostalAddress,
  normalizePostalCodeInput,
} from '../postal-code';

describe('postal code client utility', () => {
  it('normalizes complete postal codes for display and preserves partial input', () => {
    expect(normalizePostalCodeInput('6730846')).toBe('673-0846');
    expect(normalizePostalCodeInput('673-0846')).toBe('673-0846');
    expect(normalizePostalCodeInput('１００－０００１')).toBe('100-0001');
    expect(normalizePostalCodeInput('673-08')).toBe('67308');
    expect(normalizePostalCodeInput('')).toBe('');
  });

  it('accepts hyphenated and unhyphenated seven-digit values for lookup', () => {
    expect(isCompletePostalCode('6730846')).toBe(true);
    expect(isCompletePostalCode('673-0846')).toBe(true);
    expect(isCompletePostalCode('673084')).toBe(false);
  });

  it('queries the shared registry endpoint with normalized values', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        prefecture: '兵庫県',
        city: '明石市',
        street: '上ノ丸',
      }),
    });

    const address = await lookupPostalAddress('6730846', fetchMock);

    expect(fetchMock).toHaveBeenCalledWith('/api/registry/postal-code?postalCode=673-0846');
    expect(address).toEqual({
      postalCode: '673-0846',
      prefecture: '兵庫県',
      city: '明石市',
      street: '上ノ丸',
    });
  });

  it('reports lookup and validation failures with Japanese UI messages', async () => {
    const notFound = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(lookupPostalAddress('1234567', notFound)).rejects.toThrow(
      '住所が見つかりませんでした。郵便番号を確認してください。',
    );
    await expect(lookupPostalAddress('123456', jest.fn())).rejects.toThrow(
      '郵便番号を正しく入力してください（例: 123-4567）',
    );
  });
});
