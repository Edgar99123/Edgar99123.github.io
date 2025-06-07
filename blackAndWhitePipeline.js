class BlackAndWhitePipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  constructor(game) {
    super({
      game,
      renderer: game.renderer,
      fragShader: `
      precision mediump float;
      uniform sampler2D uMainSampler;
      varying vec2 outTexCoord;

      void main(void) {
          vec4 color = texture2D(uMainSampler, outTexCoord);
          float gray = dot(color.rgb, vec3(0.3, 0.59, 0.11));
          gl_FragColor = vec4(vec3(gray), color.a);
      }
      `
    });
  }
}
