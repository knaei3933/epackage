/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import JapaneseNameInput from '../JapaneseNameInput'
import { Footer } from '@/components/layout/Footer'

describe('JapaneseNameInput（漢字欄の制限をゆるめた）', () => {

  it('姓・名の入力欄がラベルと結ばれ、漢字欄に pattern がない', () => {
    const { container } = render(<JapaneseNameInput label="氏名" required />)
    const inputs = Array.from(container.querySelectorAll('input'))
    expect(inputs).toHaveLength(4)
    inputs.forEach((el) => {
      expect(el.id).toBeTruthy()
      expect(container.querySelector(`label[for="${el.id}"]`)).not.toBeNull()
    })
    expect(inputs[0].getAttribute('pattern')).toBeNull()
    fireEvent.change(inputs[0], { target: { value: 'Smith' } })
    expect(inputs[0].checkValidity()).toBe(true)
    fireEvent.change(inputs[1], { target: { value: '山田' } })
    expect(inputs[1].checkValidity()).toBe(true)
  })
})

describe('Footer の電話', () => {
  it('tel: リンクになっている', () => {
    render(<Footer />)
    const a = screen.getByRole('link', { name: '050-3613-9673' })
    expect(a.getAttribute('href')).toBe('tel:+815036139673')
  })
})
