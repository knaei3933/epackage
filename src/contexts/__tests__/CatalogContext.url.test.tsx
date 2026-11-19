/* global describe, it, expect, jest, beforeEach, afterEach */
import React from 'react';
import { render, act } from '@testing-library/react';
import { CatalogProvider } from '../CatalogContext';

// カタログの絞り込みを URL に書く処理は、一覧（/catalog）のときだけ動く。
// 以前は startsWith('/catalog') で、商品ページ（/catalog/<商品>）も /catalog に書き換えていた。
describe('CatalogContext の URL への書き込み', () => {
  let replaceState: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    replaceState = jest.spyOn(window.history, 'replaceState');
  });

  afterEach(() => {
    replaceState.mockRestore();
    jest.useRealTimers();
    window.history.pushState({}, '', '/');
  });

  function mountAt(path: string) {
    window.history.pushState({}, '', path);
    render(
      <CatalogProvider>
        <div />
      </CatalogProvider>
    );
    act(() => {
      jest.advanceTimersByTime(500);
    });
  }

  it('商品ページ（/catalog/<商品>）では、URL を書き換えない', () => {
    mountAt('/catalog/three-seal-001');
    expect(replaceState).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/catalog/three-seal-001');
  });

  it('一覧（/catalog）では、今までどおり URL に書く', () => {
    mountAt('/catalog');
    expect(replaceState).toHaveBeenCalled();
    expect(window.location.pathname).toBe('/catalog');
  });

  it('一覧の末尾の / も、一覧として扱う', () => {
    mountAt('/catalog/');
    expect(replaceState).toHaveBeenCalled();
  });

  it('トップなど、カタログ以外のページでは書かない', () => {
    mountAt('/');
    expect(replaceState).not.toHaveBeenCalled();
  });
});
