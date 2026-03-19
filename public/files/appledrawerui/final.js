window.addEventListener('pageswap', (e) => {
  sessionStorage.setItem('scrollTop', window.document.body.parentElement.scrollTop)
})

window.addEventListener('pagereveal', ({ viewTransition }) => {
  // restore scroll height when navigating between pages
  const oldScrollTop = parseInt(sessionStorage.getItem('scrollTop') || '200')
  window.document.body.parentElement.scrollTop = oldScrollTop

  if (!viewTransition) return // not supported
  const { navigationType, entry, from } = navigation.activation
  const isBackward = navigationType === 'traverse' && entry.index < from.index
  if (isBackward) viewTransition.types.add('backward')
})
