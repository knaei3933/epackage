import { render, screen } from '@testing-library/react';

// next/font/google は jest では関数として存在しない。代わりのものを渡す。
jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ variable: 'font-heading-var', className: '', style: {} }),
  Noto_Sans_JP: () => ({ variable: 'font-body-var', className: '', style: {} }),
}));

import ContactForm from '../ContactForm';

describe('ContactForm', () => {
  // zod が実行時に投げるエラー（例: required_error と errorMap の同時指定）は、
  // 型チェックでは見つからず、ページを丸ごと壊す。開けることだけは、必ず確かめる。
  it('開ける（スキーマの定義で例外が出ない）', () => {
    render(<ContactForm />);
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(3);
  });

  it('入力欄は、ラベルと結ばれている', () => {
    render(<ContactForm />);
    // class="hidden" の補助の入力欄（react-hook-form 用）は、画面に出ない。jest には CSS がなく、見えてしまうので除く。
    const boxes = screen
      .getAllByRole('textbox')
      .filter((el) => !(el as HTMLElement).dataset.testid?.endsWith('-hidden'));
    const unlabeled = boxes.filter((el) => !(el as HTMLInputElement).labels?.length);
    expect(unlabeled.map((el) => (el as HTMLInputElement).name)).toEqual([]);
  });
});
