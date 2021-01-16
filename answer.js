// 기본 stikcy width, height
const gStickyWidth = 200
const gStickyHeight = 100

// local storage key
const G_STICKY_LOCAL_STORAGE = 'G_STICKY_LOCAL_STORAGE'

class Sticky {
  constructor (id, top, left, zIndex, width, height, text, stickysManager) {
    this.id = id
    this.top = top
    this.left = left
    this.zIndex = zIndex
    this.width = width
    this.height = height
    this.stickysManager = stickysManager

    this.text = text

    this.headerElement = null
    this.memoElement = null
    this.textAreaElement = null
    this.btnSizeElement = null

    this.initRendersThis()
    this.initAddEvents()
  }

  /**
   * @brief dom에 rendering
   */
  initRendersThis () {
    const memoElement = document.createElement('div')
    memoElement.className = 'memo'
    memoElement.style.left = this.left + 'px'
    memoElement.style.top = this.top + 'px'

    const headerElement = document.createElement('div')
    headerElement.className = 'header'

    const blindElement = document.createElement('h1')
    blindElement.className = 'blind'

    const closeBtnElement = document.createElement('button')
    closeBtnElement.className = 'btn_close'

    const contentElement = document.createElement('div')
    contentElement.className = 'content'

    const textAreaElement = document.createElement('div')
    textAreaElement.className = 'textarea'
    textAreaElement.contentEditable = true
    textAreaElement.style.width = this.width + 'px'
    textAreaElement.style.height = this.height + 'px'
    textAreaElement.innerHTML = this.text

    const btnSizeElement = document.createElement('button')
    btnSizeElement.className = 'btn_size'

    const blind2Element = document.createElement('span')
    blind2Element.className = 'blind'

    btnSizeElement.appendChild(blind2Element)

    contentElement.appendChild(textAreaElement)
    contentElement.appendChild(btnSizeElement)

    headerElement.appendChild(blindElement)
    headerElement.appendChild(closeBtnElement)

    memoElement.appendChild(headerElement)
    memoElement.appendChild(contentElement)

    this.stickysManager.wrapElement.appendChild(memoElement)

    this.memoElement = memoElement
    this.headerElement = headerElement
    this.textAreaElement = textAreaElement
    this.closeBtnElement = closeBtnElement
    this.btnSizeElement = btnSizeElement
  }

  /**
   * @brief 이벤트 등록
   */
  initAddEvents () {
    this.headerElement.addEventListener('mousedown', (e) => this.startDraggingHeader(e))
    this.textAreaElement.addEventListener('input', (e) => this.changeInput(e))
    this.closeBtnElement.addEventListener('mousedown', (e) => this.clickRemove(e))
    this.btnSizeElement.addEventListener('mousedown', (e) => this.startDraggingBtnSize(e))
  }

  /**
   * @brief 삭제 버튼을 누른 경우
   */
  clickRemove (event) {
    const wrapElement = this.stickysManager.wrapElement
    wrapElement.removeChild(this.memoElement)

    this.stickysManager.removeSticky(this.id)

    this.stickysManager.saveToLocalStorage()
  }

  /**
   * @brief text area의 내용이 바뀐 경우
   */
  changeInput (event) {
    this.text = this.textAreaElement.innerHTML
    this.stickysManager.saveToLocalStorage()
  }

  /**
   * @brief header 드래그 시작 이벤트
   */
  startDraggingHeader (event) {
    const memoElement = this.memoElement

    this.zIndex = 999
    memoElement.style.zIndex = 999
    

    document.onmousemove = (e) => this.moveDraggingHeader(e)
    document.onmouseup = (e) => this.stopDraggingHeader(e)
  }

  /**
   * @brief header 드래그 중 이벤트
   */
  moveDraggingHeader (event) {
    const memoElement = this.memoElement

    const nextLeft = parseInt(event.clientX)
    const nextTop = parseInt(event.clientY)

    memoElement.style.left = nextLeft + 'px'
    memoElement.style.top = nextTop + 'px'

    return false
  }

  /**
   * @brief header 드래그 완료 이벤트
   */
  stopDraggingHeader (event) {
    document.onmousemove = null
    document.onmouseup = null

    this.stickysManager.reArrangeBasedOnZIndex()

    this.updateLocationAndRect()
    this.stickysManager.saveToLocalStorage()
  }

  /**
   * @brief btnSIZE 드래그 시작 이벤트
   */
  startDraggingBtnSize (event) {
    const memoElement = this.memoElement
    this.zIndex = 999

    memoElement.style.zIndex = 999

    document.onmousemove = (e) => this.moveDraggingBtnSize(e)
    document.onmouseup = (e) => this.stopDraggingBtnSize(e)
  }

  /**
   * @brief btnSIZE 드래그 중 이벤트
   */
  moveDraggingBtnSize (event) {
    const memoElement = this.memoElement
    const textAreaElement = this.textAreaElement

    const width = parseInt(textAreaElement.style.width.replace('px', ''))
    const height = parseInt(textAreaElement.style.height.replace('px', ''))

    const offsetRight = parseInt(memoElement.style.left.replace('px','')) + width + 10
    const offsetBottom = parseInt(memoElement.style.top.replace('px','')) + height + 10

    const changedX = event.clientX - offsetRight
    const changedY = event.clientY - offsetBottom

    const nextWidth = width + changedX + 'px'
    const nextHeight = height + changedY + 'px'

    textAreaElement.style.width = nextWidth
    textAreaElement.style.height = nextHeight

    return false
  }

  /**
   * @brief btnSIZE 드래그 완료 이벤트
   */
  stopDraggingBtnSize (event) {
    document.onmousemove = null
    document.onmouseup = null

    this.stickysManager.reArrangeBasedOnZIndex()

    this.updateLocationAndRect()
    this.stickysManager.saveToLocalStorage()
  }

  /**
   * @brief 변경된 sticky 좌표 및 크기 업데이트
   */
  updateLocationAndRect () {
    const memoElement = this.memoElement
    this.left = memoElement.style.left.replace('px', '')
    this.top = memoElement.style.top.replace('px', '')

    const textAreaElement = this.textAreaElement
    this.width = textAreaElement.style.width.replace('px', '')
    this.height = textAreaElement.style.height.replace('px', '')
  }

  /**
   * @brief z index를 재설정
   */
  setZIndex (zIndex) {
    const memoElement = this.memoElement
    memoElement.style.zIndex = zIndex
    this.zIndex = zIndex
  }
}

class StickysManager {
  constructor (stickyWidth, stickyHeight) {
    this.nextStickyId = 0
    this.wrapElement = document.getElementsByClassName('wrap')[0]
    this.stickyWidth = stickyWidth
    this.stickyHeight = stickyHeight
    this.stickyList = []

    this.initAddEvents()

    this.loadFromLocalStorage()
  }

  /**
   * @brief 이벤트 등록
   */
  initAddEvents () {
    // 새 메모장 추가 이벤트 등록
    this.wrapElement.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      this.addNewSticky(event)
      return false
    }, false)
  }

  /**
   * @brief 새 메모장 추가 이벤트
   */
  addNewSticky (event) {
    const nextStikcyId = this.nextStickyId
    this.nextStickyId++
    const top = event.clientY
    const left = event.clientX
    const width = this.stickyWidth
    const height = this.stickyHeight

    const newSticky = new Sticky(nextStikcyId, top, left, 999, width, height, '', this)
    this.stickyList.push(newSticky)

    this.saveToLocalStorage()
  }

  /**
   * @brief 기존 메모장 제거 이베트
   */
  removeSticky (id) {
    const filtedStickyList = this.stickyList.filter((sticky) => {
      return sticky.id !== id
    })

    this.stickyList = filtedStickyList
  }

  /**
   * @brief z index를 재지정한다
   */
  reArrangeBasedOnZIndex () {
    const stickyList = this.stickyList

    stickyList.sort((a, b) => {
      return a.zIndex - b.zIndex
    })

    // z index 차이를 1씩 차이 나게 만든다
    stickyList.forEach((currentSticky, zIndex) => {
      currentSticky.setZIndex(zIndex)
    })
  }

  /**
   * @brief 로컬 스토리지에서 메모장 리스트를 불러온 후 stikcy를 생성한다
   */
  loadFromLocalStorage () {
    const loadedStickyList = JSON.parse(localStorage.getItem(G_STICKY_LOCAL_STORAGE))
    loadedStickyList.forEach((sticky) => {
      const id = sticky.id
      const top = sticky.top
      const left = sticky.left
      const zIndex = sticky.zIndex
      const width = sticky.width
      const height = sticky.height
      const text = sticky.text
      const newSticky = new Sticky(id, top, left, zIndex, width, height, text, this)
      this.stickyList.push(newSticky)
    })
  }

  /**
   * @brief 로컬 스토리지에 sticky list를 저장한다.
   */
  saveToLocalStorage () {
    const saveTarget = this.stickyList.map((sticky) => {
      return {
        id: sticky.id,
        top: sticky.top,
        left: sticky.left,
        zIndex: sticky.zIndex,
        width: sticky.width,
        height: sticky.height,
        text: sticky.text
      }
    })
    localStorage.setItem(G_STICKY_LOCAL_STORAGE, JSON.stringify(saveTarget))
  }
}

const initApp = () => {
  const stickysManager = new StickysManager(gStickyWidth, gStickyHeight)
}

window.onload = function () {
  initApp()
}
