export const createAnimations = (game) => {
  // Mario animations
  game.anims.create({
    key: 'mario-idle',
    frames: game.anims.generateFrameNumbers('mario', { start: 0, end: 1 }),
    frameRate: 4,
    repeat: -1
  })

  game.anims.create({
    key: 'mario-walk',
    frames: game.anims.generateFrameNumbers('mario', { start: 2, end: 7 }),
    frameRate: 10,
    repeat: -1
  })

  game.anims.create({
    key: 'mario-jump',
    frames: game.anims.generateFrameNumbers('mario', { start: 8, end: 9 }),
    frameRate: 5,
    repeat: 0
  })

  game.anims.create({
    key: 'mario-dead',
    frames: game.anims.generateFrameNumbers('mario', { start: 10, end: 11 }),
    frameRate: 5,
    repeat: 0
  })

  // NPC idle animation
  game.anims.create({
    key: 'npc-idle',
    frames: game.anims.generateFrameNumbers('npc', { start: 0, end: 7 }),
    frameRate: 8,
    repeat: -1
  })

  // NPC2 idle animation (5 frames)
  game.anims.create({
    key: 'npc2-idle',
    frames: game.anims.generateFrameNumbers('npc2', { start: 0, end: 4 }),
    frameRate: 5,
    repeat: -1
  })
}