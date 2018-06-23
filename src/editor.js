/* global Event */

{
  const loadAce = () => new Promise(resolve => {
    const script = document.createElement('script')

    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.3.3/ace.js'
    script.addEventListener('load', resolve)
    document.body.appendChild(script)
  })

  const createEditor = () => new class {
    constructor () {
      const { ace } = window
      const container = document.createElement('div')
      const code = document.createElement('div')
      const controls = document.createElement('div')
      const closeBtn = document.createElement('button')
      const insertBtn = document.createElement('button')
      const modeSelect = document.createElement('select')
      const modes = ['javascript', 'html', 'css', 'php']

      Object.assign(controls.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        height: '2em'
      })

      Object.assign(code.style, {
        width: '100%',
        height: '60vh'
      })

      Object.assign(container.style, {
        position: 'fixed',
        zIndex: 1000,
        top: '20%',
        right: '20%',
        left: '20%',
        backgroundColor: 'white',
        boxShadow: '3px 3px 7px 5px rgba(0,0,0,0.5)'
      })

      closeBtn.textContent = 'close'
      insertBtn.textContent = 'insert'

      modeSelect.innerHTML = modes
        .map(mode => `<option value="${mode}">${mode}</option>`)
        .join('')

      controls.appendChild(modeSelect)
      controls.appendChild(insertBtn)
      controls.appendChild(closeBtn)
      container.appendChild(controls)
      container.appendChild(code)
      container.addEventListener('click', this)
      container.addEventListener('change', this)
      document.addEventListener('editor:open', this)
      document.body.appendChild(container)

      const editor = ace.edit(code, {
        mode: 'ace/mode/javascript'
      })

      Object.assign(this, {
        container,
        closeBtn,
        insertBtn,
        modeSelect,
        editor
      })
    }

    open () {
      const { container, editor, insertBtn } = this
      const { activeElement } = document
      const { selectionStart } = activeElement

      Object.assign(this, {
        activeElement,
        selectionStart
      })

      insertBtn.disabled = activeElement.value === undefined
      container.style.display = 'block'
      editor.resize()
    }

    handleClick (target) {
      const {
        container,
        closeBtn,
        insertBtn,
        modeSelect,
        editor,
        activeElement,
        selectionStart
      } = this

      switch (target) {
        case closeBtn:
          container.style.display = 'none'
          break

        case insertBtn:
          if (activeElement.value !== undefined) {
            activeElement.value = activeElement.value.slice(0, selectionStart) +
              '\n```' + modeSelect.value + '\n' +
              editor.session + '\n```\n' +
              activeElement.value.slice(selectionStart + 1)
          }
      }
    }

    handleChange (target) {
      const { modeSelect, editor } = this

      switch (target) {
        case modeSelect:
          editor.session.setMode('ace/mode/' + target.value)
      }
    }

    handleEvent ({ type, target }) {
      switch (type) {
        case 'click':
          this.handleClick(target)
          break

        case 'change':
          this.handleChange(target)
          break

        case 'editor:open':
          this.open()
      }
    }
  }()

  const dispatchOpen = () => {
    const open = new Event('editor:open')
    document.dispatchEvent(open)
  }

  if (!window.ace) {
    loadAce().then(createEditor).then(dispatchOpen)
  } else {
    dispatchOpen()
  }
}
