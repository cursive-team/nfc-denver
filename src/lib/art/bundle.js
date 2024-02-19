(() => {
  "use strict";
  let e,
    t,
    a,
    r,
    n,
    o,
    l,
    i = (t, a) => (
      void 0 === t ? ((t = 0), (a = 1)) : (a = a || 0), t + e() * (a - t)
    ),
    f = (e, t) => ~~i(e, t),
    s =
      "000000ffffff-7500009e0000bd0000c70000d10000db0000e60000fa0000ff0000-252422260c1a4b3934d3cdc3ee7749f03000f03c00f78355-1b3b4bb68762d40000e0b299e2725be6e0daeda67deef2f6-120d0e45414a4e342b545873766065e37f44f2bf58ffdd8c-3f3f37d6d6b1e6a100f24500f2e0b6-990d35d52941de2c2cfcd581fff8e8-140f2d3f88c5d72638f22b29f49d37-053c5e1f7a8ca31621bfdbf7db222a-001242032b43136f6337323e3f88c596c8a2d00000fefefa-00a89600bbd802809002c39a05668df0f3bdf7e7cefffaf0-095c84241e052832242e84a68769308eaccbc48e1be1bf9be7eef5-116973183945d82b03f2f2f2f67c1f-17171a401906cceefff0a000f0c630f0d0c0f0d9a5ff0015-1e90ff282e392b9091486abd69b668f7e3d5ff514eff7700-1d2f533cb8a45898c172c1c6ec5c23f5f1ebf8b8a0fdc449-00a5cc31b39335ccc860b3ef6ad0be6cde7e8a99e9a0e6beff73d0ffbff4-336cbc60d7a27fa0c2c8f354e03a2ee5d694e83b83ee8534eee349ffffff-1d1517302332a0b8acb4aab2dd2e26f55b4df7d86ef87d68fcc2cbfcc79efefdfb-00563f247ba033b2ccfb3640fdd692ff8c00ff91afffcc33-3191775b5f97b8b8d1ff6b6cffb5b4ffc145ffe0a0fffffb-887499a24430aba6c4bb697fd66e7ffbc9b2fca13bfcf115fe683c-0505041d34611f487d237ba133b2cce6e6e6fb3640fdd692-003249007ea72932413d5a8080ced79ad1d4ccdbdcee6c4d-031927042a2b1d3557424b54457b9da8dadcf1faeeffbb33-0000001884bf26437fd2292ed9381efefddfffcc00ffffff"
        .split`-`.map((e) => e.match(/.{6}/g).map((e) => "#" + e));
  const c = (e) => {
    const t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
    return [
      parseInt(t[1], 16) / 255,
      parseInt(t[2], 16) / 255,
      parseInt(t[3], 16) / 255,
      1,
    ];
  };
  let d = (e = 1) => {
      let t = [];
      l = [];
      for (let a = 0; a < e; a++) {
        let e = f(s.length);
        l.push(...s[e]), t.push(e);
      }
      return (
        (l = ((e) => {
          let t = [...e],
            a = t.length,
            r = 0;
          for (; 0 != a; )
            (r = ~~(i() * a)), a--, ([t[a], t[r]] = [t[r], t[a]]);
          return t;
        })(l)),
        t
      );
    },
    m = (e, t) =>
      `rgba(${255 * e[0]}, ${255 * e[1]}, ${255 * e[2]}, ${t || e[3] || 1})`,
    u = {},
    b = (e) => (
      (u = {
        palette: d(f(5) + 1),
        background: [0, 0, 0],
        padding: 0.1,
        exposure: f(30, 100),
        noiseSize: i(4, 12) / 50,
        frequency: f(4, 9) / 5,
        seed: i(),
      }),
      u
    );
  const h = {
      width: 5 * window.artworkWidth,
      height: 5 * window.artworkHeight,
      colorSpace: "display-p3",
    },
    p = (e, t, a = {}) => {
      let r = {};
      (r.canvas = D.getElementById(t) || D.createElement("canvas")),
        (r.context = r.canvas.getContext(e, {
          colorSpace: h.colorSpace,
          alpha: !0,
          ...a,
        }));
      let { canvas: n, context: o } = r;
      return (
        (r.setSize = (e = 1) => {
          let t = h.width / h.height,
            a = W.artworkWidth,
            o = W.artworkHeight;
          (r.density = M.min(W.devicePixelRatio, 2)),
            a < o * t
              ? ((r.width = a), (r.height = a / t), (r.scale = a / h.width))
              : ((r.width = o * t), (r.height = o), (r.scale = o / h.height)),
            (n.width = ~~(r.width * r.density * e)),
            (n.height = ~~(r.height * r.density * e));
          let l = n.style;
          (l.width = `${r.width}px`),
            (l.height = `${r.height}px`),
            (l.imageRendering = "pixelated");
        }),
        (r.save = (e) => {
          n.toBlob(
            (t) => {
              let a = URL.createObjectURL(t),
                r = D.createElement("a");
              (r.href = a), (r.download = `${fxhash}.png`), r.click(), e && e();
            },
            "image/png",
            1
          );
        }),
        (r.destroy = (e) => {
          D.getElementById(t) ||
            ((r.width = r.height = n.width = n.height = 1),
            r.clear(),
            n.remove(),
            delete r.canvas,
            delete r.context,
            (n = o = r = null));
        }),
        r
      );
    };
  let g;
  Math.sqrt(4), Math.sqrt(4);
  let E = "#version 300 es",
    T = `${E}\nprecision highp float;in vec2 position;out vec4 color;uniform sampler2D image;uniform vec2 resolution;`,
    R = (e) => {
      let t = 2 * M.PI,
        a = (e) => (e % 1 ? e : e + "."),
        r = (e = t) => `vec3(${[0, 0, 0].map((t) => a(i(e)))})`,
        n = (e = 1) =>
          `vec3(${[0, 0, 0].map((t) => a(e * 2 ** (i(0.6) - 0.3)))})`;
      return `float wobbly(vec3 p){return dot(sin(p.xyz*${n()}+2.*sin(p.yzx*${n()}+${r()})+${r()}),sin(p.zyx*${n()}+3.*sin(p.zxy*${n()}+${r()})+${r()}));}`;
    };
  const y = `${E}\nin vec2 a_position,a_texCoord;uniform mat3 u_textureMatrix;out vec2 position;void main(){position=(u_textureMatrix*vec3(a_texCoord,1)).xy;gl_Position=vec4(a_position*2.-vec2(1),0,1);}`;
  let x = (e) =>
    `${T}${e}float map(float v,float a,float b,float c,float d){return c+(v-a)*(d-c)/(b-a);}float getNoise(int o,float p,float f,vec3 c){float a=1.;float m=0.;float s=0.;for(int i=0;i<o;++i){s+=a*wobbly(c*f);f*=2.;m+=a;a*=p;}return (s/m)*.5+.5;}uniform float seed,noiseSize,frequency;uniform bool on;void main(){vec2 i=position;if(on){float x=getNoise(2,.6,2.,vec3(position.xy,seed+3e4)),y=getNoise(4,.4,frequency,vec3(position.xy,seed))*2.-1.,f=getNoise(4,.4,frequency,vec3(position.xy,seed+1e4))*2.-1.;i+=vec2(y,f)/noiseSize*x/10.;if(i.x<0.)i.x=abs(i.x);if(i.y<0.)i.y=abs(i.y);if(i.x>1.)i.x=1.-i.x+1.;if(i.y>1.)i.y=1.-i.y+1.;}color=texture(image,i);}`;
  const v = (e) => ({
    name: "noise",
    vertex: y,
    fragment: x(R()),
    uniforms: [
      { name: "seed", type: "uniform1f" },
      { name: "noiseSize", type: "uniform1f" },
      { name: "frequency", type: "uniform1f" },
      { name: "on", type: "uniform1i" },
    ],
  });
  let A = (e, t, a) => {
      let r = e.createShader(a);
      return (
        e.shaderSource(r, t),
        e.compileShader(r),
        e.getShaderParameter(r, e.COMPILE_STATUS) ||
          (console.log(e.getShaderInfoLog(r)), e.deleteShader(r)),
        r
      );
    },
    _ = Float32Array,
    w = (e) => {
      let t = e.createTexture();
      return (
        e.bindTexture(e.TEXTURE_2D, t),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.MIRRORED_REPEAT),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.MIRRORED_REPEAT),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST),
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST),
        t
      );
    };
  const S = {
      name: "post",
      vertex: y,
      fragment: `${T}uniform float brightness,contrast,saturation;mat4 v(float m){return mat4(1,0,0,0,0,1,0,0,0,0,1,0,m,m,m,1);}mat4 m(float m){float b=(1.-m)/2.;return mat4(m,0,0,0,0,m,0,0,0,0,m,0,b,b,b,1);}mat4 b(float m){vec3 b=vec3(.3086,.6094,.082);float n=1.-m;vec3 f=vec3(b.x*n);f+=vec3(m,0,0);vec3 v=vec3(b.y*n);v+=vec3(0,m,0);vec3 r=vec3(b.z*n);r+=vec3(0,0,m);return mat4(f,0,v,0,r,0,0,0,0,1);}void main(){color=v(brightness)*m(contrast)*b(saturation)*texture(image,position);}`,
      uniforms: [
        { name: "brightness", type: "uniform1f" },
        { name: "contrast", type: "uniform1f" },
        { name: "saturation", type: "uniform1f" },
      ],
    },
    I = (e, t = [], a) => {
      let r,
        n = ((e) => {
          let t = p("2d", e + "-2d"),
            { context: a } = t,
            r = { fill: !1, stroke: !1, blend: "source-over" },
            n = (e, t, n) => {
              (r[e] = m(t, n)), (a[`${e}Style`] = r[e]);
            },
            o = (e) => {
              r.fill && a.fill(), r.stroke && a.stroke();
            };
          return (
            (t.draw = (e, r) => {
              a.save(), a.scale(t.density, t.density);
              let n = e(t, r);
              return a.restore(), n;
            }),
            (t.blendMode = (e) => {
              (r.blend = e), (a.globalCompositeOperation = e);
            }),
            (t.setOpacity = (e) => (a.globalAlpha = e)),
            (t.clear = (e) =>
              a.clearRect(0, 0, t.width * t.density, t.height * t.density)),
            (t.fill = (e, t) => n("fill", e, t)),
            (t.stroke = (e, t) => n("stroke", e, t)),
            (t.noFill = (e) => (r.fill = !1)),
            (t.noStroke = (e) => (r.stroke = !1)),
            (t.strokeWeight = (e) =>
              (a.lineWidth = e * ((t.scale + t.scale) / 2))),
            (t.translate = (e, r) => a.translate(e * t.scale, r * t.scale)),
            (t.rotate = (e) => a.rotate((e * M.PI) / 180)),
            (t.setScale = (e, t) => a.scale(e, t || e)),
            (t.push = (e) => a.save()),
            (t.pop = (e) => a.restore()),
            (t.shape = (e, r, n, l, i) => {
              a.beginPath(),
                a[e](
                  r * t.scale,
                  n * t.scale,
                  l * t.scale,
                  (i || l) * t.scale,
                  0,
                  0,
                  2 * M.PI
                ),
                o();
            }),
            (t.rect = (e, a, r, n) => t.shape("rect", e, a, r, n)),
            (t.ellipse = (e, a, r, n) => t.shape("ellipse", e, a, r, n)),
            (t.line = (e, r) => {
              a.beginPath(),
                a.moveTo(e[0] * t.scale, e[1] * t.scale),
                a.lineTo(r[0] * t.scale, r[1] * t.scale),
                a.stroke();
            }),
            (t.polygon = (e, r = !0) => {
              a.beginPath(), a.moveTo(e[0][0] * t.scale, e[0][1] * t.scale);
              for (let r of e) a.lineTo(r[0] * t.scale, r[1] * t.scale);
              r && a.lineTo(e[0][0] * t.scale, e[0][1] * t.scale), o();
            }),
            (t.curvedPolygon = (e, r = !0) => {
              if (e.length > 3) {
                let n = [...e];
                r && n.push(e[0], e[1], e[2]);
                let l,
                  i = [];
                for (
                  a.beginPath(),
                    a.moveTo(n[1][0] * t.scale, n[1][1] * t.scale),
                    l = 1;
                  l + 2 < n.length;
                  l++
                ) {
                  let e = n[l];
                  (i[0] = [e[0], e[1]]),
                    (i[1] = [
                      e[0] + (n[l + 1][0] - n[l - 1][0]) / 6,
                      e[1] + (n[l + 1][1] - n[l - 1][1]) / 6,
                    ]),
                    (i[2] = [
                      n[l + 1][0] + (n[l][0] - n[l + 2][0]) / 6,
                      n[l + 1][1] + (n[l][1] - n[l + 2][1]) / 6,
                    ]),
                    (i[3] = [n[l + 1][0], n[l + 1][1]]),
                    a.bezierCurveTo(
                      i[1][0] * t.scale,
                      i[1][1] * t.scale,
                      i[2][0] * t.scale,
                      i[2][1] * t.scale,
                      i[3][0] * t.scale,
                      i[3][1] * t.scale
                    );
                }
                o();
              }
            }),
            (t.drawPoints = (e) => {
              a.beginPath();
              for (let r = e.length - 1; r >= 0; r--)
                a.rect(
                  e[r][0] * t.scale,
                  e[r][1] * t.scale,
                  e[r][2] * t.scale,
                  e[r][2] * t.scale
                );
              a.fill();
            }),
            (t.drawTexture = (e) => {
              a.beginPath();
              for (let r = e.length - 1; r >= 0; r--)
                a.ellipse(
                  e[r][0] * t.scale,
                  e[r][1] * t.scale,
                  e[r][2] * t.scale,
                  e[r][2] * t.scale,
                  0,
                  0,
                  2 * M.PI
                );
              a.fill();
            }),
            (t.image = (e, r = 0, n = 0, o, l) => {
              o
                ? a.drawImage(
                    e,
                    r * t.scale,
                    n * t.scale,
                    o * t.scale,
                    (l || o) * t.scale
                  )
                : a.drawImage(e, r * t.scale, n * t.scale);
            }),
            (t.gradient = (e, n, o, l) => {
              let i = a.createLinearGradient(
                  n[0] * t.scale,
                  n[1] * t.scale,
                  o[0] * t.scale,
                  o[1] * t.scale
                ),
                f = 1 / l.length,
                s = 0;
              for (let e of l) i.addColorStop(s, m(e)), (s += f);
              (r[e] = i), (a[`${e}Style`] = r[e]);
            }),
            t
          );
        })(a),
        o = { engine: n, blendMode: "source-over", completed: !1 };
      return (
        n.setSize(),
        t.length &&
          ((r = ((e, t) => {
            let a = p("webgl2", t + "-webgl", {
                colorSpace: "display-p3",
                powerPreference: "high-performance",
                preserveDrawingBuffer: !0,
              }),
              { context: r, canvas: n } = a;
            "drawingBufferColorSpace" in r &&
              (r.drawingBufferColorSpace = h.colorSpace),
              "unpackColorSpace" in r && (r.unpackColorSpace = h.colorSpace);
            let o,
              l = [],
              i = (e, t) =>
                ((e, t, a, r, n, o = 1) => {
                  let { width: l, height: i } = e.canvas,
                    f = new _([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
                    s = ((e, t, a) => {
                      let r = e.createProgram(),
                        n = A(e, t, e.VERTEX_SHADER),
                        o = A(e, a, e.FRAGMENT_SHADER);
                      return (
                        e.attachShader(r, n),
                        e.attachShader(r, o),
                        e.linkProgram(r),
                        e.getProgramParameter(r, e.LINK_STATUS) ||
                          e.deleteProgram(r),
                        r
                      );
                    })(e, t, a);
                  e.useProgram(s);
                  let c = e.getAttribLocation(s, "a_position"),
                    d = e.getAttribLocation(s, "a_texCoord"),
                    m = e.getUniformLocation(s, "u_textureMatrix"),
                    u = new _([1, 0, 0, 0, 1, 0, 0, 0, 1]),
                    b = e.createBuffer();
                  e.bindBuffer(e.ARRAY_BUFFER, b),
                    e.vertexAttribPointer(c, 2, e.FLOAT, !1, 0, 0),
                    e.enableVertexAttribArray(c),
                    e.vertexAttribPointer(d, 2, e.FLOAT, !1, 0, 0),
                    e.enableVertexAttribArray(d),
                    e.uniformMatrix3fv(m, !1, u),
                    e.bufferData(e.ARRAY_BUFFER, f, e.STATIC_DRAW);
                  let h = {};
                  for (let t of r)
                    h[t.name] = {
                      type: t.type,
                      location: e.getUniformLocation(s, t.name),
                      texture: t.texture,
                    };
                  let p = [];
                  for (let t = 0; t < o; t++) p.push(w(e));
                  let g = e.createFramebuffer();
                  return (
                    e.bindFramebuffer(e.FRAMEBUFFER, g),
                    e.texImage2D(
                      e.TEXTURE_2D,
                      0,
                      e.RGBA,
                      l,
                      i,
                      0,
                      e.RGBA,
                      e.UNSIGNED_BYTE,
                      null
                    ),
                    e.framebufferTexture2D(
                      e.FRAMEBUFFER,
                      e.COLOR_ATTACHMENT0,
                      e.TEXTURE_2D,
                      p[0],
                      0
                    ),
                    {
                      name: n,
                      getTexture: (e = 0) => p[e],
                      draw(t) {
                        e.useProgram(s);
                        let a = 1;
                        for (let [r, n] of Object.entries(t))
                          (n = Array.isArray(n) ? n : [n]),
                            h[r].texture
                              ? (e.activeTexture(e.TEXTURE0 + a),
                                e.bindTexture(e.TEXTURE_2D, p[a]),
                                e.texImage2D(
                                  e.TEXTURE_2D,
                                  0,
                                  e.RGBA,
                                  e.RGBA,
                                  e.UNSIGNED_BYTE,
                                  ...n
                                ),
                                e[h[r].type](h[r].location, a),
                                a++)
                              : e[h[r].type](h[r].location, ...n);
                        e.bindBuffer(e.ARRAY_BUFFER, b),
                          e.drawArrays(e.TRIANGLES, 0, 6);
                      },
                      set() {
                        e.bindFramebuffer(e.FRAMEBUFFER, g);
                      },
                      reset() {
                        ({ width: l, height: i } = e.canvas),
                          g &&
                            (e.bindTexture(e.TEXTURE_2D, p[0]),
                            e.bindFramebuffer(e.FRAMEBUFFER, g),
                            e.texImage2D(
                              e.TEXTURE_2D,
                              0,
                              e.RGBA,
                              l,
                              i,
                              0,
                              e.RGBA,
                              e.UNSIGNED_BYTE,
                              null
                            ),
                            e.framebufferTexture2D(
                              e.FRAMEBUFFER,
                              e.COLOR_ATTACHMENT0,
                              e.TEXTURE_2D,
                              p[0],
                              0
                            ));
                      },
                    }
                  );
                })(
                  r,
                  e.vertex,
                  e.fragment,
                  [
                    { type: "uniform1i", name: "image" },
                    { type: "uniform2f", name: "resolution" },
                    ...e.uniforms,
                  ],
                  e.name,
                  t
                );
            r.clear(r.COLOR_BUFFER_BIT),
              r.disable(r.DEPTH_TEST),
              r.enable(r.BLEND),
              r.blendFunc(r.SRC_ALPHA, r.ONE_MINUS_SRC_ALPHA),
              r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0),
              r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL, r.NONE),
              r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !0);
            for (let t = 0; t < e.length; t++) l.push(i(e[t], e[t].textures));
            o = i(S);
            let f = a.setSize;
            return (
              (a.setSize = (e) => {
                f(),
                  r.viewport(0, 0, a.width * a.density, a.height * a.density);
                for (let e of [...l, o]) e.reset();
              }),
              (a.draw = (e, t) => {
                let { uniforms: a, blendModeGL: n, post: i = {} } = t,
                  { brightness: f = 0, contrast: s = 1, saturation: c = 1 } = i,
                  d = { image: 0, resolution: [h.width, h.height] };
                for (let t = 0; t < l.length; t++)
                  r.activeTexture(r.TEXTURE0),
                    r.bindTexture(r.TEXTURE_2D, l[t].getTexture()),
                    0 === t &&
                      r.texImage2D(
                        r.TEXTURE_2D,
                        0,
                        r.RGBA,
                        r.RGBA,
                        r.UNSIGNED_BYTE,
                        e
                      ),
                    t + 1 < l.length ? l[t + 1].set() : o.set(),
                    l[t].draw({ ...d, ...a[l[t].name] });
                o.set(),
                  r.activeTexture(r.TEXTURE0),
                  r.bindTexture(r.TEXTURE_2D, o.getTexture()),
                  r.bindFramebuffer(r.FRAMEBUFFER, null),
                  o.draw({ ...d, brightness: f, contrast: s, saturation: c });
              }),
              (a.clear = (e) =>
                r.clear(
                  r.COLOR_BUFFER_BIT | r.DEPTH_BUFFER_BIT | r.STENCIL_BUFFER_BIT
                )),
              a
            );
          })(t, a)),
          r.setSize(),
          (o.engine = r),
          (o.engine2D = n)),
        (o.draw = (t) => {
          let a = n.draw(e, t);
          r && r.draw(n.canvas, a);
          for (let [e, t] of Object.entries(a)) o[e] = t;
        }),
        (o.setSize = (e) => {
          n.setSize(), r.setSize();
        }),
        (o.destroy = (e) => {
          n.destroy(), r && r.destroy();
        }),
        o
      );
    },
    P = (e) => ({
      draw(t) {
        t.fill(e.fill),
          t.stroke(e.stroke),
          W.params.stroke &&
            e.PRNG.chance(0.05) &&
            t.stroke(c(e.PRNG.randomElementInArray(l))),
          W.params.fill &&
            e.PRNG.chance(0.05) &&
            t.fill(c(e.PRNG.randomElementInArray(l))),
          e.draw(t);
      },
    }),
    U = (e, t, a, r, n, o, l, i, f, s) => {
      let c;
      return (
        (c = i
          ? [
              [0, 0],
              [r, n],
              [0, n],
            ]
          : [
              [0, 0],
              [r, 0],
              [r, n],
            ]),
        P({
          PRNG: e,
          fill: o,
          stroke: l,
          draw(e) {
            e.push(),
              e.translate(t, a),
              e.translate(r / 2, n / 2),
              e.setScale(f ? -1 : 1, s ? -1 : 1),
              e.translate(-r / 2, -n / 2),
              e.polygon(c),
              e.pop();
          },
        })
      );
    },
    F = (e, t, a, r, n, o, l, i, f, s) => {
      let c;
      return (
        (c = i
          ? [
              [0, n],
              [r / 2, 0],
              [r, n],
            ]
          : [
              [0, 0],
              [r, n / 2],
              [0, n],
            ]),
        P({
          PRNG: e,
          fill: o,
          stroke: l,
          draw(e) {
            e.push(),
              e.translate(t, a),
              e.translate(r / 2, n / 2),
              e.setScale(f ? -1 : 1, s ? -1 : 1),
              e.translate(-r / 2, -n / 2),
              e.polygon(c),
              e.pop();
          },
        })
      );
    },
    B = (e, t, a, r, n, o, l) =>
      P({
        PRNG: e,
        fill: o,
        stroke: l,
        draw(e) {
          e.rect(t, a, r, n);
        },
      }),
    N = (e, t, a, r, n, o, l) => {
      let i = r / 2,
        f = n / 2;
      return P({
        PRNG: e,
        fill: o,
        stroke: l,
        draw(e) {
          e.ellipse(t + i, a + f, i, f);
        },
      });
    },
    G = (e, t, a, r, n, o, l) => {
      let i = [
        [0, 0],
        [0.5 * r, 0.25 * n],
        [r, 0],
        [0.75 * r, 0.5 * n],
        [r, n],
        [0.5 * r, 0.75 * n],
        [0, n],
        [0.25 * r, 0.5 * n],
      ];
      return P({
        PRNG: e,
        fill: o,
        stroke: l,
        draw(e) {
          e.push(), e.translate(t, a), e.polygon(i), e.pop();
        },
      });
    },
    L = (e, t, a) => {
      let r = ((e = "tx piter") => {
          let t, a, r, n, o, l;
          (t = a = r = n = o = l = null),
            (a = Uint32Array.from(
              [0, 1, (r = n = 2), 3].map((t) =>
                parseInt(e.substr(8 * t + 2, 8), 16)
              )
            )),
            (t = (e) => (
              (n = a[3]),
              (a[3] = a[2]),
              (a[2] = a[1]),
              (a[1] = r = a[0]),
              (n ^= n << 11),
              (a[0] ^= n ^ (n >>> 8) ^ (r >>> 19)),
              a[0] / 2 ** 32
            ));
          let i = (e, a) => (
              void 0 === e ? ((e = 0), (a = 1)) : (a = a || 0),
              e + t() * (a - e)
            ),
            f = (e, t) => ~~i(e, t);
          return {
            random: i,
            randomInt: f,
            randomElementInArray: (e) => e[f(e.length)],
            randomGaussian: (e = 1, t = 0) => {
              if (l) {
                l = !1;
                let a = o;
                return (o = null), t + e * a;
              }
              {
                let a = 0,
                  r = 0,
                  n = 0;
                do {
                  (a = i(-1, 1)), (r = i(-1, 1)), (n = a * a + r * r);
                } while (n >= 1 || 0 === n);
                let f = M.sqrt((-2 * M.log(n)) / n);
                return (o = r * f), (l = !0), t + e * (a * f);
              }
            },
            shuffleArray: (e) => {
              let t = [...e],
                a = t.length,
                r = 0;
              for (; 0 != a; )
                (r = ~~(i() * a)), a--, ([t[a], t[r]] = [t[r], t[a]]);
              return t;
            },
            chance: (e) => i() < e,
          };
        })(a),
        n = e / 8,
        o = t / 8,
        i = [M.max(0, r.randomInt(8) - 1), M.max(0, r.randomInt(8) - 1)],
        f = [r.randomInt(8 - i[0]) + 1, r.randomInt(8 - i[1]) + 1],
        s = r.chance(0.5) ? U : F;
      r.chance(0.1)
        ? (s = G)
        : r.chance(0.1)
        ? (s = N)
        : r.chance(0.1) && (s = B);
      let d = i[0] * n,
        m = i[1] * o,
        u = f[0] * n,
        b = f[1] * o;
      (d += r.randomGaussian(0.05 * n)), (m += r.randomGaussian(0.05 * o));
      let h = r.randomInt(1, 7) * r.randomInt(3, 7),
        p = r.randomInt(1, 7) * r.randomInt(3, 7),
        g = u / h,
        E = b / p,
        T = M.min(g, E) * r.random(0.5);
      (g = (u - T) / h), (E = (b - T) / p);
      let R = [],
        y =
          (r.randomInt(3),
          Array.from({ length: r.randomInt(3) + 1 }, (e) => r.randomInt(2, h))),
        x = Array.from({ length: r.randomInt(h / 2) + 1 }, (e) =>
          r.randomInt(h)
        ),
        v = Array.from({ length: r.randomInt(p / 2) + 1 }, (e) =>
          r.randomInt(p)
        ),
        A = r.chance(0.5),
        _ = r.chance(0.5),
        w = _ ? [1, 1, 1] : [0, 0, 0],
        S = _ ? [0, 0, 0] : [1, 1, 1];
      W.params.fill && (w = c(r.randomElementInArray(l))),
        W.params.stroke && (S = c(r.randomElementInArray(l))),
        (d += r.randomGaussian(5)),
        (m += r.randomGaussian(5));
      let I = 1;
      for (let e = 0; e < p; e += 1)
        for (let t = 0; t < h; t += 1)
          y.every((e) => I % e) &&
            R.push(
              s(
                r,
                r.randomGaussian(0.5, d + g * t + T),
                r.randomGaussian(0.5, m + E * e + T),
                r.randomGaussian(0.5, g - T),
                r.randomGaussian(0.5, E - T),
                w,
                S,
                A,
                !x.every((e) => I % e),
                !v.every((e) => I % e)
              )
            ),
            (I += 1);
      return {
        draw(e) {
          e.strokeWeight(10);
          for (let t of R) t.draw(e);
        },
      };
    };
  ((i) => {
    (window.W = window), (W.D = document), (W.S = D.body.style), (W.M = Math);
    let f,
      c,
      d,
      m,
      u,
      p,
      E,
      T,
      R = ((e) => {
        let t = [];
        return {
          addLayers(e) {
            t.push(...e);
          },
          render(e) {
            let a = !0;
            for (let r of t) r.completed || ((a = !1), r.draw(e));
            return a;
          },
          reset() {
            t.forEach((e) => e.destroy()), (t = []);
          },
          save(e) {
            t[t.length - 1].engine.save(e);
          },
        };
      })(),
      y = (e) => {
        T
          ? console.log(
              `Completed render after ${f} frames in ${(m - d) / 1e3}s`
            )
          : ((E = W.requestAnimationFrame(y)),
            (m = e),
            (p = m - u),
            p > c &&
              ((u = m - (p % c)), (T = R.render({ frameCount: f })), (f += 1)));
      };
    (W.render = (i) => {
      E && W.cancelAnimationFrame(E),
        ((l = "tx piter") => {
          (e = t = a = r = n = o = null),
            (t = Uint32Array.from(
              [0, 1, (a = r = 2), 3].map((e) =>
                parseInt(l.substr(8 * e, 8), 16)
              )
            )),
            (e = (e) => (
              (r = t[3]),
              (t[3] = t[2]),
              (t[2] = t[1]),
              (t[1] = a = t[0]),
              (r ^= r << 11),
              (t[0] ^= r ^ (r >>> 8) ^ (a >>> 19)),
              t[0] / 2 ** 32
            ));
        })(W.myPubKey),
        (g = null),
        R.reset();
      let m = b(W);
      (f = 0),
        (c = 1e3 / 60),
        (u = W.performance.now()),
        (d = u),
        (T = !1),
        R.addLayers(
          ((e) => {
            let {
                background: t,
                exposure: a,
                seed: r,
                frequency: n,
                noiseSize: o,
              } = e,
              { width: i, height: f } = h,
              { abstract: c, upToPubKey: d } = W.params,
              m = c ? 0.3 : 0.05;
            m *= M.min(i, f);
            let u = i - 2 * m,
              b = f - 2 * m,
              p = [];
            for (let e = 0; e < 100; e += 1) {
              let e = L(u, b, generateHash());
              p.push(e);
            }
            return [
              I(
                (e, { frameCount: t }) => (
                  e.clear(),
                  e.translate(m, m),
                  (l = s[~~(t / 25) % s.length]),
                  e.setOpacity(c && t > 25 ? 0.7 : 1),
                  L(u, b, W.signatures[t].pubKey).draw(e),
                  {
                    completed: t === d - 1,
                    post: {
                      saturation: 1.4,
                      contrast: c ? 1.5 : 1,
                      brightness: c ? -0.1 : 0,
                    },
                    uniforms: {
                      noise: {
                        on: c,
                        seed: r + t / 500,
                        noiseSize: o,
                        frequency: n,
                      },
                    },
                  }
                ),
                [v(), v()],
                "artwork"
              ),
            ];
          })(m)
        ),
        y();
    }),
      navigator.userAgent.includes("HeadlessChrome") ||
        (W.addEventListener("resize", W.render),
        W.addEventListener("keydown", (e) => ("s" === e.key ? R.save() : ""))),
      W.render();
  })();
})();
