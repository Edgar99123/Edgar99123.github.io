/* global Phaser */

import { createAnimations } from "./animations.js"

let conversationHistory = []
let conversationHistoryNPC2 = []
let hasKey = false
let hasKey2 = false
let doorCrossed = false
let npc2Flying = false
let gameScore = 0
let gameLives = 5

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
}

const game = new Phaser.Game(config)

window.addEventListener('beforeunload', (event) => {
  event.preventDefault()
  event.returnValue = '¿Seguro que quieres salir? Se perderá tu progreso.'
})

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight)
})

function preload () {
  this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png')
  this.load.image('cloud2', 'assets/scenery/overworld/cloud2.png')
  this.load.image('montanas', 'assets/scenery/overworld/Montanas.png')
  this.load.image('bush1', 'assets/scenery/overworld/bush1.png')
  this.load.image('bush2', 'assets/scenery/overworld/bush2.png')
  this.load.image('floorbricks', 'assets/scenery/overworld/floorbricks.png')
  this.load.image('arbol', 'assets/arbol.png')
  this.load.image('puerta1', 'assets/scenery/puerta1.png')
  this.load.image('puerta2', 'assets/scenery/puerta2.png')
  this.load.image('puertaA1', 'assets/scenery/puertaA1.png')
  this.load.image('puertaA2', 'assets/scenery/puertaA2.png')
  this.load.image('coin', 'assets/coin.png')
  this.load.image('montanasBW', 'assets/scenery/overworld/MontanasBW.png')
  this.load.image('bush1BW', 'assets/scenery/overworld/bush1BW.png')
  this.load.image('bush2BW', 'assets/scenery/overworld/bush2BW.png')
  this.load.image('floorbricksBW', 'assets/scenery/overworld/floorbricksBW.png')
  this.load.image('arbolBW', 'assets/arbolBW.png')
  this.load.spritesheet('mario', 'assets/entities/jugador.png', {
    frameWidth: 61,
    frameHeight: 112
  })
  this.load.spritesheet('npc', 'assets/entities/npc.PNG', {
    frameWidth: 855,
    frameHeight: 712
  })
  this.load.spritesheet('npc2', 'assets/entities/npc2.png', {
    frameWidth: 2890 / 5,
    frameHeight: 911
  })
  this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
  this.load.audio('principal', 'assets/sound/music/principal.mp3')
  this.load.audio('infierno', 'assets/sound/music/infierno.mp3')
  this.load.audio('fase2', 'assets/sound/music/fase2.mp3')
  this.load.audio('coinSound', 'assets/sound/effects/coin.mp3')
}

function create () {
  this.sunsetGraphics = this.add.graphics()
  this.sunsetGraphics.fillGradientStyle(0x2a1a4e, 0x2a1a4e, 0xf57c00, 0xffeb3b, 1)
  this.sunsetGraphics.fillRect(0, 0, 4000, config.height)
  this.sunsetGraphics.setDepth(-3)

  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(0, 4000)
    const y = Phaser.Math.Between(50, 200)
    const cloudType = Phaser.Math.Between(0, 1) ? 'cloud1' : 'cloud2'
    const scale = Phaser.Math.FloatBetween(0.2, 0.4)
    this.add.image(x, y, cloudType)
      .setOrigin(0, 0)
      .setScale(scale)
      .setDepth(-2)
  }

  this.mountains = []
  for (let x = 0; x < 4000; x += 400) {
    const mountain = this.add.image(x, config.height - 64, 'montanas')
      .setOrigin(0, 1)
      .setScale(0.6)
      .setDepth(-1.5)
    this.mountains.push(mountain)
  }

  this.bushes = []
  for (let x = 0; x < 4000; x += Phaser.Math.Between(100, 200)) {
    const bushType = Phaser.Math.Between(0, 1) ? 'bush1' : 'bush2'
    const bush = this.add.image(x, config.height - 64, bushType)
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(-1)
    this.bushes.push(bush)
  }

  this.trees = []
  for (let x = 0; x < 4000; x += Phaser.Math.Between(200, 400)) {
    const tree = this.add.image(x, config.height - 25, 'arbol')
      .setOrigin(0, 1)
      .setScale(0.3)
      .setDepth(-1)
    this.trees.push(tree)
  }

  this.floor = this.physics.add.staticGroup()
  for (let x = 0; x < 4000; x += 64) {
    this.floor.create(x, config.height - 32, 'floorbricks').setOrigin(0, 0.5).setScale(2).refreshBody()
  }

  this.coins = this.physics.add.group()
  for (let x = 100; x < 3900; x += Phaser.Math.Between(200, 400)) {
    this.coins.create(x, config.height - 100, 'coin')
      .setOrigin(0, 1)
      .setScale(0.5)
      .setDepth(1)
  }

  this.mario = this.physics.add.sprite(50, config.height - 60, 'mario')
    .setOrigin(0, 1)
    .setScale(1)
    .setCollideWorldBounds(true)
    .setGravityY(600)
    .setDepth(1)

  this.npc = this.physics.add.sprite(300, config.height - 61, 'npc')
    .setOrigin(0, 1)
    .setScale(0.2)
    .setGravityY(0)
    .setCollideWorldBounds(true)
    .setDepth(1)

  this.npc.body.setSize(this.npc.width * 0.2, this.npc.height * 0.2).setOffset(0, this.npc.height * 0.8)

  this.npc2 = this.physics.add.sprite(3500, config.height - 61, 'npc2')
    .setOrigin(0, 1)
    .setScale(0.2)
    .setGravityY(0)
    .setCollideWorldBounds(true)
    .setDepth(1)

  this.npc2.body.setSize(this.npc2.width * 0.2, this.npc2.height * 0.2).setOffset(0, this.npc2.height * 0.8)

  this.door = this.physics.add.staticSprite(650, config.height - 60, 'puerta2')
    .setOrigin(0, 1)
    .setScale(0.2)
    .setDepth(1)
  this.door.isOpen = false
  this.door.body.setSize(524 * 0.2, 801 * 0.2)
  this.door.body.setOffset(0, -801 * 0.2)

  this.door2 = this.physics.add.staticSprite(3850, config.height - 60, 'puertaA2')
    .setOrigin(0, 1)
    .setScale(0.2)
    .setDepth(1)
  this.door2.isOpen = false
  this.door2.body.setSize(525 * 0.2, 766 * 0.2)
  this.door2.body.setOffset(0, -766 * 0.2)

  this.scoreText = this.add.text(20, 20, `Puntaje: ${gameScore}`, {
    fontFamily: 'PressStart2P',
    fontSize: '16px',
    color: '#00ffcc',
    stroke: '#000000',
    strokeThickness: 2
  }).setDepth(1000).setScrollFactor(0)

  this.livesText = this.add.text(20, 50, `Vidas: ${gameLives}`, {
    fontFamily: 'PressStart2P',
    fontSize: '16px',
    color: '#00ffcc',
    stroke: '#000000',
    strokeThickness: 2
  }).setDepth(1000).setScrollFactor(0)

  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.npc, this.floor)
  this.physics.add.collider(this.npc2, this.floor)
  this.physics.add.collider(this.door, this.floor)
  this.physics.add.collider(this.door2, this.floor)
  this.physics.add.collider(this.mario, this.door, null, () => {
    console.log('Colisión con puerta 1, isOpen:', this.door.isOpen)
    return !this.door.isOpen
  })
  this.physics.add.collider(this.mario, this.door2, null, () => {
    console.log('Colisión con puerta 2, isOpen:', this.door2.isOpen)
    return !this.door2.isOpen
  })
  this.physics.add.overlap(this.mario, this.coins, collectCoin, null, this)

  this.physics.world.setBounds(0, 0, 4000, config.height)
  this.cameras.main.setBounds(0, 0, 4000, config.height)
  this.cameras.main.startFollow(this.mario, true, 0.1, 0.1)
  this.cameras.main.setZoom(1)

  createAnimations(this)

  this.npc.anims.play('npc-idle', true)
  this.npc2.anims.play('npc2-idle', true)

  this.npcWalkTween = this.tweens.add({
    targets: this.npc,
    x: this.npc.x + 200,
    duration: 3000,
    ease: 'Linear',
    yoyo: true,
    repeat: -1,
    onUpdate: () => {
      if (this.npc.x > this.npc._prevX) {
        this.npc.flipX = false
      } else if (this.npc.x < this.npc._prevX) {
        this.npc.flipX = true
      }
      this.npc._prevX = this.npc.x
    },
    onStart: () => {
      this.npc._prevX = this.npc.x
    }
  })

  this.npc2WalkTween = this.tweens.add({
    targets: this.npc2,
    x: this.npc2.x + 200,
    duration: 3000,
    ease: 'Linear',
    yoyo: true,
    repeat: -1,
    onUpdate: () => {
      if (this.npc2.x > this.npc2._prevX) {
        this.npc2.flipX = false
      } else if (this.npc2.x < this.npc2._prevX) {
        this.npc2.flipX = true
      }
      this.npc2._prevX = this.npc2.x
    },
    onStart: () => {
      this.npc2._prevX = this.npc2.x
    }
  })

  this.keys = this.input.keyboard.createCursorKeys()
  this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB)
  this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)

  this.marioDialogBg = this.add.rectangle(0, 0, 300, 50, 0xa6e3ff, 0.9)
    .setOrigin(0.5, 1)
    .setDepth(999)
    .setVisible(false)
    .setStrokeStyle(2, 0x000000)

  this.marioDialog = this.add.text(0, 0, '', {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000',
    wordWrap: { width: 280 },
    align: 'center',
    shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 2, fill: true }
  }).setOrigin(0.5, 1).setDepth(1000).setVisible(false)

  this.npcDialogBg = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0.9)
    .setOrigin(0.5, 1)
    .setDepth(999)
    .setVisible(false)
    .setStrokeStyle(2, 0x000000)

  this.npcDialog = this.add.text(0, 0, '', {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000',
    wordWrap: { width: 280 },
    align: 'center',
    shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 2, fill: true }
  }).setOrigin(0.5, 1).setDepth(1000).setVisible(false)

  this.npc2DialogBg = this.add.rectangle(window.innerWidth - 800, 300, 300, 50, 0xffcccb, 0.9)
    .setOrigin(0.5, 0)
    .setDepth(999)
    .setVisible(false)
    .setStrokeStyle(2, 0x000000)
    .setScrollFactor(0)

  this.npc2Dialog = this.add.text(window.innerWidth - 800, 300, '', {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000',
    wordWrap: { width: 280 },
    align: 'center',
    shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 2, fill: true }
  }).setOrigin(0.5, 0).setDepth(1000).setVisible(false).setScrollFactor(0)

  this.inputTextBg = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0.9)
    .setOrigin(0.5, 1)
    .setDepth(999)
    .setVisible(false)
    .setStrokeStyle(2, 0x000000)

  this.inputText = this.add.text(0, 0, '', {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000',
    wordWrap: { width: 280 },
    align: 'left',
    shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 2, fill: true }
  }).setOrigin(0.5, 1).setDepth(1000).setVisible(false).setInteractive()

  this.cursor = this.add.text(0, 0, '|', {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000'
  }).setOrigin(0, 1).setDepth(1000).setVisible(false)

  this.interactPromptBg = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0.9)
    .setOrigin(0.5, 1)
    .setDepth(999)
    .setVisible(false)
    .setStrokeStyle(2, 0x000000)

  this.interactPrompt = this.add.text(0, 0, 'Presiona TAB para interactuar', {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#000',
    wordWrap: { width: 280 },
    align: 'center',
    shadow: { offsetX: 1, offsetY: 1, color: '#fff', blur: 2, fill: true }
  }).setOrigin(0.5, 1).setDepth(1000).setVisible(false)

  this.victoryScreen = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000, 0.9)
    .setDepth(1001)
    .setVisible(false)
    .setScrollFactor(0)

  this.victoryText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 - 50, 'Felicidades por pasar al siguiente mundo, próximamente habrá más aventuras', {
    fontFamily: 'Arial',
    fontSize: '24px',
    color: '#fff',
    wordWrap: { width: window.innerWidth - 40 },
    align: 'center',
    shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true }
  }).setOrigin(0.5, 0.5).setDepth(1002).setVisible(false).setScrollFactor(0)

  this.restartButton = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 50, 'Reiniciar', {
    fontFamily: 'Arial',
    fontSize: '20px',
    color: '#fff',
    backgroundColor: '#4CAF50',
    padding: { x: 20, y: 10 },
    align: 'center'
  }).setOrigin(0.5, 0.5).setDepth(1002).setVisible(false).setScrollFactor(0).setInteractive()

  this.restartButton.on('pointerdown', () => {
    conversationHistory = []
    conversationHistoryNPC2 = []
    this.door.isOpen = false
    this.door.setTexture('puerta2')
    this.door.body.enable = true
    this.door.body.setSize(524 * 0.2, 801 * 0.2)
    this.door.body.setOffset(0, -801 * 0.2)
    this.door.x = 650
    this.door2.isOpen = false
    this.door2.setTexture('puertaA2')
    this.door2.body.enable = true
    this.door2.body.setSize(525 * 0.2, 766 * 0.2)
    this.door2.body.setOffset(0, -766 * 0.2)
    this.door2.x = 3850
    hasKey = false
    hasKey2 = false
    doorCrossed = false
    npc2Flying = false
    gameScore = 0
    gameLives = 5
    this.scoreText.setText(`Puntaje: ${gameScore}`)
    this.livesText.setText(`Vidas: ${gameLives}`)
    document.getElementById('scoreValue').textContent = `Puntaje: ${gameScore}`
    document.getElementById('livesValue').textContent = `Vidas: ${gameLives}`
    this.npc2WebhookUrl = 'https://dev-academy.n8n.itelisoft.org/webhook/demonioTEdgarA'
    this.mountains.forEach(mountain => mountain.setTexture('montanas'))
    this.bushes.forEach(bush => {
      const newTexture = bush.texture.key === 'bush1' ? 'bush1' : 'bush2'
      bush.setTexture(newTexture)
    })
    this.trees.forEach(tree => tree.setTexture('arbol'))
    this.floor.getChildren().forEach(brick => brick.setTexture('floorbricks'))
    this.npc.setVisible(true)
    this.npc2.setVisible(true)
    this.npc2.setPosition(3700, config.height - 61)
    this.door.setVisible(true)
    this.door2.setVisible(true)
    this.coins.getChildren().forEach(coin => coin.enableBody(true, coin.x, coin.y, true, true))
    this.sunsetGraphics.clear()
    this.sunsetGraphics.fillGradientStyle(0x2a1a4e, 0x2a1a4e, 0xf57c00, 0xffeb3b, 1)
    this.sunsetGraphics.fillRect(0, 0, 4000, config.height)
    this.victoryScreen.setVisible(false)
    this.victoryText.setVisible(false)
    this.restartButton.setVisible(false)
    this.isPaused = false
    this.scene.restart()
    window.location.reload()
  })

  this.time.addEvent({
    delay: 500,
    callback: () => {
      if (this.isTyping) {
        this.cursor.setVisible(!this.cursor.visible)
      }
    },
    loop: true
  })

  this.currentInput = ''
  this.awaitingInput = false
  this.isTyping = false
  this.isPaused = false
  this.activeNPC = null
  this.npc2WebhookUrl = 'https://dev-academy.n8n.itelisoft.org/webhook/demonioTEdgarA'

  this.input.keyboard.on('keydown', (event) => {
    if (this.isPaused) return

    if (this.isTyping) {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
        if (this.currentInput.trim()) {
          this.marioDialog.setText(this.currentInput).setVisible(true)
          this.marioDialogBg.setVisible(true)

          this.tweens.add({
            targets: [this.marioDialog, this.marioDialogBg],
            alpha: { from: 0, to: 1 },
            duration: 640
          })

          const isNPC2 = this.activeNPC === this.npc2
          const targetDialog = isNPC2 ? this.npc2Dialog : this.npcDialog
          const targetDialogBg = isNPC2 ? this.npc2DialogBg : this.npcDialogBg
          targetDialog.setText('Pensando...').setVisible(true)
          targetDialogBg.setVisible(true)
          this.inputText.setVisible(false)
          this.inputTextBg.setVisible(false)
          this.cursor.setVisible(false)
          this.isTyping = false

          const history = isNPC2 ? conversationHistoryNPC2 : conversationHistory
          const webhookUrl = isNPC2 ? this.npc2WebhookUrl : 'https://dev-academy.n8n.itelisoft.org/webhook/edgarjuegoA'
          const role = isNPC2 ? 'Demonio' : 'Vikingo'

          const messageToSend = history
            .map(entry => `Jugador: ${entry.player}\n${role}: ${entry.npc}`)
            .join('\n') + `\nJugador: ${this.currentInput}`

          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: messageToSend }] })
          })
            .then(res => {
              if (!res.ok) throw new Error('Error en la respuesta del servidor: ' + res.status)
              return res.text()
            })
            .then(data => {
              if (isNPC2) {
                conversationHistoryNPC2.push({
                  player: this.currentInput,
                  npc: data
                })
                if (data === 'CORRE!') {
                  npc2Flying = true
                  this.npc2WalkTween.pause()
                  this.npc2.setGravityY(0)
                  this.sound.stopByKey('infierno') // Detener la música de infierno
                  this.sound.play('fase2', { volume: 0.3, loop: true })
                  this.npc2FlyTween = this.tweens.add({
                    targets: this.npc2,
                    y: this.npc2.y - 100,
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1,
                    onUpdate: () => {
                      if (!this.isTyping && !this.awaitingInput) {
                        const targetX = this.mario.x + 100
                        this.npc2.x = Phaser.Math.Linear(this.npc2.x, targetX, 0.05)
                        this.npc2.flipX = this.mario.x < this.npc2.x
                      }
                    }
                  })
                  this.npc2WebhookUrl = 'https://dev-academy.n8n.itelisoft.org/webhook/vuelaEdgarA'
                }
                if (data.includes('JAJAJAJAJ QUE DIVERTIDO, ME HICISTE EL DIA, TEN, UNA LLAVE')) {
                  hasKey2 = true
                  console.log('Llave para puerta 2 obtenida')
                }
                targetDialog.setText(data).setVisible(true)
                targetDialogBg.setVisible(true)
              } else {
                conversationHistory.push({
                  player: this.currentInput,
                  npc: data
                })
                if (data === 'LLAVE090302') {
                  hasKey = true
                  console.log('Llave obtenida: LLAVE090302')
                  targetDialog.setText('Felicidades viajero, es respuesta es correcta, te haz ganado la llave, no vemos').setVisible(true)
                  targetDialogBg.setVisible(true)
                  this.npcWalkTween.pause()
                  this.npc.anims.play('npc-idle', true)
                  this.npc.flipX = true
                  this.tweens.add({
                    targets: this.npc,
                    x: this.npc.x - 1000,
                    duration: 5000,
                    ease: 'Linear',
                    onComplete: () => {
                      this.npc.setVisible(false)
                    }
                  })
                } else {
                  targetDialog.setText(data).setVisible(true)
                  targetDialogBg.setVisible(true)
                }
              }

              this.tweens.add({
                targets: [targetDialog, targetDialogBg],
                alpha: { from: 0, to: 1 },
                duration: 640
              })
            })
            .catch(() => {
              targetDialog.setText('Error al conectar con la IA..').setVisible(true)
              targetDialogBg.setVisible(true)
            })
        } else {
          this.inputText.setText('')
          this.inputText.setVisible(false)
          this.inputTextBg.setVisible(false)
          this.cursor.setVisible(false)
          this.isTyping = false
        }
        this.currentInput = ''
      } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
        this.currentInput = this.currentInput.slice(0, -1)
        this.inputText.setText(this.currentInput)
      } else if (event.key.length === 1) {
        this.currentInput += event.key
        this.inputText.setText(this.currentInput)
      }
    }
  })

  this.input.keyboard.on('keydown-P', () => {
    if (!this.isTyping) {
      this.isPaused = !this.isPaused
      if (this.isPaused) {
        this.physics.pause()
        this.npcWalkTween.pause()
        this.npc2WalkTween.pause()
        if (this.npc2FlyTween) this.npc2FlyTween.pause()
        this.mario.anims.pause()
        this.npc.anims.pause()
        this.npc2.anims.pause()
        document.getElementById('pauseMenu').style.display = 'flex'
      } else {
        this.physics.resume()
        this.npcWalkTween.resume()
        this.npc2WalkTween.resume()
        if (this.npc2FlyTween) this.npc2FlyTween.resume()
        this.mario.anims.resume()
        this.npc.anims.resume()
        this.npc2.anims.resume()
        document.getElementById('pauseMenu').style.display = 'none'
      }
    }
  })

  window.addEventListener('resumeGame', () => {
    if (this.isPaused) {
      this.isPaused = false
      this.physics.resume()
      this.npcWalkTween.resume()
      this.npc2WalkTween.resume()
      if (this.npc2FlyTween) this.npc2FlyTween.resume()
      this.mario.anims.resume()
      this.npc.anims.resume()
      this.npc2.anims.resume()
      document.getElementById('pauseMenu').style.display = 'none'
    }
  })

  window.addEventListener('startGame', (event) => {
    gameScore = event.detail.score
    gameLives = event.detail.lives
    this.scoreText.setText(`Puntaje: ${gameScore}`)
    this.livesText.setText(`Vidas: ${gameLives}`)
  })
}

function collectCoin(mario, coin) {
  coin.disableBody(true, true)
  gameScore += 10
  this.scoreText.setText(`Puntaje: ${gameScore}`)
  document.getElementById('scoreValue').textContent = `Puntaje: ${gameScore}`
  this.sound.play('coinSound', { volume: 0.5 })
  this.sound.play('principal', { volume: 0.3 })
}

function update () {
  if (this.isPaused || this.mario.isDead || this.victoryScreen.visible) return

  const doorRightEdge = this.door.x + (524 * 0.2)
  const door2RightEdge = this.door2.x + (525 * 0.2)
  const marioRightEdge = this.mario.x + this.mario.width
  const isTouchingClosedDoor = marioRightEdge >= this.door.x && this.mario.x <= doorRightEdge && !this.door.isOpen
  const isTouchingClosedDoor2 = marioRightEdge >= this.door2.x && this.mario.x <= door2RightEdge && !this.door2.isOpen

  if (this.keys.left.isDown) {
    this.mario.anims.play('mario-walk', true)
    this.mario.x -= 6
    this.mario.flipX = true
  } else if (this.keys.right.isDown && !isTouchingClosedDoor && !isTouchingClosedDoor2) {
    this.mario.anims.play('mario-walk', true)
    this.mario.x += 6
    this.mario.flipX = false
  } else {
    this.mario.anims.play('mario-idle', true)
  }

  if (Phaser.Input.Keyboard.JustDown(this.keys.up) && this.mario.body.touching.down) {
    this.mario.setVelocityY(-500)
    this.mario.anims.play('mario-jump', true)
  }

  if (this.mario.y >= config.height) {
    this.mario.isDead = true
    this.mario.anims.play('mario-dead')
    this.mario.setCollideWorldBounds(false)
    this.sound.add('gameover', { volume: 0.2 }).play()
    gameLives = Math.max(0, gameLives - 1)
    this.livesText.setText(`Vidas: ${gameLives}`)
    document.getElementById('livesValue').textContent = `Vidas: ${gameLives}`
    document.getElementById('scoreValue').textContent = `Puntaje: ${gameScore}`
    setTimeout(() => {
      if (gameLives > 0) {
        this.mario.isDead = false
        this.mario.setPosition(50, config.height - 60)
        this.mario.setCollideWorldBounds(true)
        this.mario.anims.play('mario-idle', true)
      } else {
        conversationHistory = []
        conversationHistoryNPC2 = []
        this.door.isOpen = false
        this.door.setTexture('puerta2')
        this.door.body.enable = true
        this.door.body.setSize(524 * 0.2, 801 * 0.2)
        this.door.body.setOffset(0, -801 * 0.2)
        this.door.x = 650
        this.door2.isOpen = false
        this.door2.setTexture('puertaA2')
        this.door2.body.enable = true
        this.door2.body.setSize(525 * 0.2, 766 * 0.2)
        this.door2.body.setOffset(0, -766 * 0.2)
        this.door2.x = 3850
        hasKey = false
        hasKey2 = false
        doorCrossed = false
        npc2Flying = false
        gameScore = 0
        gameLives = 5
        this.scoreText.setText(`Puntaje: ${gameScore}`)
        this.livesText.setText(`Vidas: ${gameLives}`)
        document.getElementById('scoreValue').textContent = `Puntaje: ${gameScore}`
        document.getElementById('livesValue').textContent = `Vidas: ${gameLives}`
        this.npc2WebhookUrl = 'https://dev-academy.n8n.itelisoft.org/webhook/demonioTEdgarA'
        this.mountains.forEach(mountain => mountain.setTexture('montanas'))
        this.bushes.forEach(bush => {
          const newTexture = bush.texture.key === 'bush1' ? 'bush1' : 'bush2'
          bush.setTexture(newTexture)
        })
        this.trees.forEach(tree => tree.setTexture('arbol'))
        this.floor.getChildren().forEach(brick => brick.setTexture('floorbricks'))
        this.npc.setVisible(true)
        this.npc2.setVisible(true)
        this.npc2.setPosition(3700, config.height - 61)
        this.door.setVisible(true)
        this.door2.setVisible(true)
        this.coins.getChildren().forEach(coin => coin.enableBody(true, coin.x, coin.y, true, true))
        this.sunsetGraphics.clear()
        this.sunsetGraphics.fillGradientStyle(0x2a1a4e, 0x2a1a4e, 0xf57c00, 0xffeb3b, 1)
        this.sunsetGraphics.fillRect(0, 0, 4000, config.height)
        this.victoryScreen.setVisible(false)
        this.victoryText.setVisible(false)
        this.restartButton.setVisible(false)
        this.isPaused = false
        this.scene.restart()
      }
    }, 2000)
  }

  updateDialogPositions(this)

  const distanceToNPC = Phaser.Math.Distance.Between(this.mario.x, this.mario.y, this.npc.x, this.mario.y)
  const distanceToNPC2 = Phaser.Math.Distance.Between(this.mario.x, this.mario.y, this.npc2.x, this.npc2.y)
  const distanceToDoor = Phaser.Math.Distance.Between(this.mario.x, this.mario.y, this.door.x, this.door.y)
  const distanceToDoor2 = Phaser.Math.Distance.Between(this.mario.x, this.mario.y, this.door2.x, this.door2.y)

if (this.door.isOpen && !doorCrossed && this.mario.x > doorRightEdge) {
  doorCrossed = true
  this.door.setVisible(false)
  this.door.body.enable = false
  this.npc.setVisible(false)
  this.npcWalkTween.pause()
  this.sound.stopByKey('principal') // Detener la música principal
  this.sound.play('infierno', { volume: 0.3, loop: true })
  this.mountains.forEach(mountain => mountain.setTexture('montanasBW'))
  this.bushes.forEach(bush => {
    const newTexture = bush.texture.key === 'bush1' ? 'bush1BW' : 'bush2BW'
    bush.setTexture(newTexture)
  })
  this.trees.forEach(tree => tree.setTexture('arbolBW'))
  this.floor.getChildren().forEach(brick => brick.setTexture('floorbricksBW'))
  this.sunsetGraphics.clear()
  this.sunsetGraphics.fillGradientStyle(0x333333, 0x333333, 0xcccccc, 0xffffff, 1)
  this.sunsetGraphics.fillRect(0, 0, 4000, config.height)
}

  console.log('Distancia a la puerta 1:', distanceToDoor, 'Puerta 1 abierta:', this.door.isOpen, 'Tiene llave:', hasKey, 'Puerta 1 atravesada:', doorCrossed)
  console.log('Distancia a la puerta 2:', distanceToDoor2, 'Puerta 2 abierta:', this.door2.isOpen, 'Tiene llave 2:', hasKey2)

  if (!this.isTyping && !this.awaitingInput && !this.interactPrompt.visible) {
    if (distanceToNPC < 120 && !doorCrossed) {
      this.interactPromptBg.setVisible(true)
      this.interactPrompt.setVisible(true)
      this.tweens.add({
        targets: [this.interactPrompt, this.interactPromptBg],
        alpha: { from: 0, to: 1 },
        duration: 640
      })
    } else if (distanceToNPC2 < 120) {
      this.interactPromptBg.setVisible(true)
      this.interactPrompt.setVisible(true)
      this.tweens.add({
        targets: [this.interactPrompt, this.interactPromptBg],
        alpha: { from: 0, to: 1 },
        duration: 640
      })
    } else if (distanceToDoor < 120 || distanceToDoor2 < 120) {
      this.interactPromptBg.setVisible(true)
      this.interactPrompt.setVisible(true)
      this.tweens.add({
        targets: [this.interactPrompt, this.interactPromptBg],
        alpha: { from: 0, to: 1 },
        duration: 640
      })
    }
  } else if ((distanceToNPC >= 120 && distanceToNPC2 >= 120 && distanceToDoor >= 120 && distanceToDoor2 >= 120) || this.isTyping || this.awaitingInput) {
    if (this.interactPrompt.visible) {
      this.tweens.add({
        targets: [this.interactPrompt, this.interactPromptBg],
        alpha: { from: 1, to: 0 },
        duration: 640,
        onComplete: () => {
          this.interactPromptBg.setVisible(false)
          this.interactPrompt.setVisible(false)
        }
      })
    }
  }

  if (!this.isTyping && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
    if (distanceToDoor < 120 && !this.door.isOpen) {
      if (hasKey) {
        console.log('Abriendo puerta 1 con la llave')
        this.door.setTexture('puerta1')
        this.door.x += (524 * 0.2 - 479 * 0.2) / 2
        this.door.isOpen = true
        this.door.body.enable = false
      } else {
        console.log('No tienes la llave para abrir la puerta 1')
        this.npcDialog.setText('Necesitas la llave para abrir la puerta').setVisible(true)
        this.npcDialogBg.setVisible(true)
        this.tweens.add({
          targets: [this.npcDialog, this.npcDialogBg],
          alpha: { from: 0, to: 1 },
          duration: 640
        })
      }
    } else if (distanceToDoor2 < 120) {
      if (this.door2.isOpen) {
        console.log('Puerta 2 abierta, mostrando pantalla de victoria')
        this.door2.setVisible(false)
        this.door2.body.enable = false
        this.npc2.setVisible(false)
        if (this.npc2WalkTween) this.npc2WalkTween.pause()
        if (this.npc2FlyTween) this.npc2FlyTween.pause()
        this.victoryScreen.setVisible(true)
        this.victoryText.setVisible(true)
        this.restartButton.setVisible(true)
        this.tweens.add({
          targets: [this.victoryScreen, this.victoryText, this.restartButton],
          alpha: { from: 0, to: 1 },
          duration: 1000
        })
      } else if (hasKey2) {
        console.log('Abriendo puerta 2 con la llave')
        this.door2.setTexture('puertaA1')
        this.door2.x += (525 * 0.2 - 480 * 0.2) / 2
        this.door2.isOpen = true
        this.door2.body.enable = false
      } else {
        console.log('No tienes la llave para abrir la puerta 2')
        this.npc2Dialog.setText('Esta puerta parece necesitar algo especial para abrirse...').setVisible(true)
        this.npc2DialogBg.setVisible(true)
        this.tweens.add({
          targets: [this.npc2Dialog, this.npc2DialogBg],
          alpha: { from: 0, to: 1 },
          duration: 640
        })
      }
    } else if (distanceToNPC < 120 && !doorCrossed) {
      this.currentInput = ''
      this.inputText.setText('')
      this.marioDialog.setText('').setVisible(false)
      this.marioDialogBg.setVisible(false)
      this.awaitingInput = true
      this.npcDialog.setText("Presiona ENTER para hablar conmigo...").setVisible(true)
      this.npcDialogBg.setVisible(true)
      this.tweens.add({
        targets: [this.npcDialog, this.npcDialogBg],
        alpha: { from: 0, to: 1 },
        duration: 640
      })
      this.inputText.setVisible(true)
      this.inputTextBg.setVisible(true)
      this.cursor.setVisible(true)
      this.isTyping = true
      this.npcWalkTween.pause()
      this.npc.anims.play('npc-idle', false)
      this.activeNPC = this.npc
    } else if (distanceToNPC2 < 120) {
      this.currentInput = ''
      this.inputText.setText('')
      this.marioDialog.setText('').setVisible(false)
      this.marioDialogBg.setVisible(false)
      this.awaitingInput = true
      this.npc2Dialog.setText("Presiona ENTER para hablar conmigo...").setVisible(true)
      this.npc2DialogBg.setVisible(true)
      this.tweens.add({
        targets: [this.npc2Dialog, this.npc2DialogBg],
        alpha: { from: 0, to: 1 },
        duration: 640
      })
      this.inputText.setVisible(true)
      this.inputTextBg.setVisible(true)
      this.cursor.setVisible(true)
      this.isTyping = true
      this.npc2WalkTween.pause()
      if (npc2Flying && this.npc2FlyTween) {
        this.npc2FlyTween.pause()
      }
      this.npc2.anims.play('npc2-idle', false)
      this.activeNPC = this.npc2
    }
  } else if (distanceToNPC >= 120 && distanceToNPC2 >= 120 && distanceToDoor >= 120 && distanceToDoor2 >= 120) {
    this.awaitingInput = false
    this.isTyping = false
    this.marioDialog.setVisible(false)
    this.marioDialogBg.setVisible(false)
    this.npcDialog.setVisible(false)
    this.npcDialogBg.setVisible(false)
    this.npc2Dialog.setVisible(false)
    this.npc2DialogBg.setVisible(false)
    this.inputText.setVisible(false)
    this.inputTextBg.setVisible(false)
    this.cursor.setVisible(false)
    this.currentInput = ''
    if (this.npcWalkTween.isPaused() && !doorCrossed) {
      this.npcWalkTween.resume()
      this.npc.anims.play('npc-idle', true)
    }
    if (this.npc2WalkTween.isPaused() && !npc2Flying) {
      this.npc2WalkTween.resume()
      this.npc2.anims.play('npc2-idle', true)
    }
    if (npc2Flying && this.npc2FlyTween && this.npc2FlyTween.isPaused()) {
      this.npc2FlyTween.resume()
      this.npc2.anims.play('npc2-idle', true)
    }
    this.activeNPC = null
  }
}

function updateDialogPositions(scene) {
  const marioScreenPos = scene.cameras.main.getWorldPoint(
    scene.mario.x + (scene.mario.width * 1) / 2,
    scene.mario.y - (scene.mario.height * 1) - 20
  )

  const marioDialogHeight = scene.marioDialog.height + 20
  const npcDialogHeight = scene.npcDialog.height + 20
  const npc2DialogHeight = scene.npc2Dialog.height + 20
  const inputTextHeight = scene.inputText.height + 20
  const interactPromptHeight = scene.interactPrompt.height + 20

  const verticalOffset = 40
  const baseY = marioScreenPos.y - verticalOffset
  let marioY = baseY
  let npcY = baseY
  let inputY = baseY
  let promptY = baseY

  if (scene.isTyping) {
    const activeDialogHeight = scene.activeNPC === scene.npc2 ? npc2DialogHeight : npcDialogHeight
    npcY = baseY - inputTextHeight - activeDialogHeight
    if (scene.activeNPC === scene.npc2) {
      marioY = 300 + npc2DialogHeight
      scene.marioDialogBg.setScrollFactor(0)
      scene.marioDialog.setScrollFactor(0)
      inputY = 300 + npc2DialogHeight + marioDialogHeight
      scene.inputTextBg.setScrollFactor(0)
      scene.inputText.setScrollFactor(0)
      scene.cursor.setScrollFactor(0)
    } else {
      marioY = baseY - activeDialogHeight
      scene.marioDialogBg.setScrollFactor(1)
      scene.marioDialog.setScrollFactor(1)
      inputY = baseY - activeDialogHeight
      scene.inputTextBg.setScrollFactor(1)
      scene.inputText.setScrollFactor(1)
      scene.cursor.setScrollFactor(1)
    }
  } else {
    npcY = baseY - marioDialogHeight - npcDialogHeight
    marioY = baseY - npcDialogHeight
    scene.marioDialogBg.setScrollFactor(1)
    scene.marioDialog.setScrollFactor(1)
  }

  if (scene.interactPrompt.visible) {
    const activeDialogHeight = scene.activeNPC === scene.npc2 ? npc2DialogHeight : npcDialogHeight
    promptY = baseY - activeDialogHeight
    scene.interactPromptBg.setPosition(marioScreenPos.x, promptY)
    scene.interactPromptBg.setSize(300, interactPromptHeight)
    scene.interactPrompt.setPosition(marioScreenPos.x, promptY)
  }

  scene.marioDialogBg.setPosition(window.innerWidth - 800, marioY)
  scene.marioDialogBg.setSize(300, marioDialogHeight)
  scene.marioDialog.setPosition(window.innerWidth - 800, marioY)

  scene.npcDialogBg.setPosition(marioScreenPos.x, npcY)
  scene.npcDialogBg.setSize(300, npcDialogHeight)
  scene.npcDialog.setPosition(marioScreenPos.x, npcY)

  scene.npc2DialogBg.setPosition(window.innerWidth - 800, 300)
  scene.npc2DialogBg.setSize(300, npc2DialogHeight)
  scene.npc2Dialog.setPosition(window.innerWidth - 800, 300)

  if (scene.isTyping) {
    scene.inputTextBg.setPosition(window.innerWidth - 800, inputY)
    scene.inputTextBg.setSize(300, inputTextHeight)
    scene.inputText.setPosition(window.innerWidth - 800, inputY)
    const textWidth = scene.inputText.width
    scene.cursor.setPosition(
      window.innerWidth - 800 - 140 + (textWidth / 2),
      inputY
    )
  }
}