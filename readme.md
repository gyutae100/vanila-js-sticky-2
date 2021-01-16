티몬 프론트엔드 과제 - 스티키 메모장
=================================  
작성자 : 김규태  
완료일 : 2021.1.16(토)

---

---

# 1. 모든 요구사항 구현 완료

    1. 바탕화면(쪽지가 아닌 회색부분)에 마우스 우클릭시 마우스 위치가 top, left값을 가지는 새로운 쪽지를 생성합니다. answer.html 참고(기본 크기 div.textarea : width:200px, height:100px;)
    2. 쪽지의 헤더 부분 드래그시 쪽지를 바탕화면 내에서 이동이 가능해야합니다.(Drag & Drop 플러그인 사용금지, 직접구현해야 함)
    3. 드래그 드랍 또는 내용 수정시에 해당하는 쪽지는 겹쳐진 쪽지 중 최상단으로 나와야합니다.
    4. X 버튼 클릭시 삭제 되어야합니다.
    5. 쪽지 우 하단 드래그시 크기가 변경되어야 합니다. 크기 변경은 div.textarea의 width, height가 변경되어야 합니다.
    6. 모든 쪽지 내용, 위치, 크기, 쌓이는 순서는 localStorage에 저장되어야 하며, 리로드시 모든 쪽지가 그대로 나와야합니다.

# 2. 환경 설정

    1. 바닐라 자바스크립트를 이용
    2. 플러그인 및 라이브러리는 사용 안함
    3. 코드 정리를 위한 eslint를 standard js로 설정

# 3. 문제 해결 전략 1 (OOP 활용)

    1. sticky 객체들을 관리하는 sticksManager 클래스를 이용
    2. stickysManager는 sticky만으로 처리 못하는 이벤트를 처리
    3. stickysManager 클래스는 다음과 같은 역할 수행
       - stickyList 멤버 변수를 통해 생성된 sticky들에 접근 가능
       - 새로운 sticky 생성
       - 기존 sticky 제거
       - 모든 stcky의 zIndex 재조정
       - 현재 sticky에 관한 context를 local storage에 저장
       - 페이지 로드 시 기존에 local storage에 저장된 stickys에 관한 context를 불러와서 sticky들을 생성
    4. sticky 클래스를 통해 sticky 개별적으로 처리할 수 있는 이벤트는 처리
    5. sticky 클래스는 다음과 같은 역활 수행
       - sticky를 ducoment object model(DOM)에 랜더링
       - 이벤트에 의해 변경된 css값을 업데이트(zIndex, left, top, width, height)
       - header 드래그 이벤트
       - btn size 드래그 이벤트
       - btn close 클릭 이벤트
       - text area 인풋 이벤트
    6. sticky 클래스의 인스턴스만으로 처리하지 못하는 이벤트들은 stickysManager Instance에게 요청함
       일종의 DI(Defendency Injection)방식으로 sticky 클래스 생성자에 stickysManager의 this를 넘김
    7. stikcysManager를 통해 처리하는 이벤트
       - 모든 이벤트가 종료 후 모든 sticky에 관한 context를 local storage에 저장
       - btn close 이벤트 발생시 해당 sticky를 삭제

# 4. 문제해결 전략 2 (바닐라 자바스크립트로 드래그 이벤트 처리)

    1. 헤더 드래그 이벤트를 기준으로 설명
    2. headerElement에 mouse down 이벤트 시 startDraggingHeader 이벤트를 등록

```
    this.headerElement.addEventListener('mousedown', (e) => this.startDraggingHeader(e))
```

    3. headerElemnt에 mouse down 이벤트가 발생 시 부모 DOM인 memoElement의 zIndex를 999로 설정 후 mousemove이벤트(드래그 중)와 mouseup이벤트(드래그 완료) 이벤트를 등록함

```
    memoElement.style.zIndex = 999
    document.onmousemove = (e) => this.moveDraggingHeader(e)
    document.onmouseup = (e) => this.stopDraggingHeader(e)
```

    4. mousemove 이벤트(드래그 중)가 발생 시 마우스 event의 clientX, clientY값을 이용해서 memoElement의 크기에 반영

```
    const memoElement = this.memoElement

    const nextLeft = parseInt(event.clientX + this.nextLeft)
    const nextTop = parseInt(event.clientY + this.nextTop)

    memoElement.style.left = nextLeft + 'px'
    memoElement.style.top = nextTop + 'px'
```

    5. mouseup 이벤트(드래그 완료)가 발생 시 모든 sticky에 대한 zIndex를 재 설정 한 후 해당 stikcy의 cssStyle을 업데이트 하고 모든 sticky이 context를 local storage에 저장한다.

```
    this.stickysManager.reArrangeBasedOnZIndex()

    this.updateCssStyles()
    this.stickysManager.saveToLocalStorage()
```

---

읽어주셔서 감사합니다.  
피드백 남겨주시면 감사하겠습니다.  
피드백 메일: gyutae100@gmail.com
