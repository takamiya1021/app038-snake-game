/**
 * テスト環境セットアップ確認用のダミーテスト
 */
describe('Test Environment Setup', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should have requestAnimationFrame mock', () => {
    expect(global.requestAnimationFrame).toBeDefined()
    expect(global.cancelAnimationFrame).toBeDefined()
  })
})
