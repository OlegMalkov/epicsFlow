const canvas = document.body.appendChild(document.createElement('canvas'))
const fit = require('canvas-fit')

const str = '<a href="https://github.com/Erkaman/wireframe-world/"><img style="position: absolute; top: 0; left: 0; border: 0;" src="https://camo.githubusercontent.com/82b228a3648bf44fc1163ef44c62fcc60081495e/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_red_aa0000.png"></a>'

const regl = require('regl')({
	canvas,
	onDone: err => {
		if (err) {
			document.body.innerHTML = `
      Failed to initialize the demo because:</br></br>
      <code>${ err }</code></br></br>` +
        `
      <a href="https://github.com/Erkaman/wireframe-world">But you can find a recorded gif of the demo by clicking here. </a>
      `
			throw err
		}
	},
})

const container = document.createElement('div')

container.innerHTML = str
document.body.appendChild(container)

window.addEventListener('resize', fit(canvas), false)

const mat4 = require('gl-mat4')

const cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix')

// projection matrix settings.
const Z_FAR = 120000
const Z_NEAR = 0.01
const FOV = Math.PI / 4

// these variables are used all over the place. Declare them here,
// once and for all.
let x

let z

let y

let r

let i

function makeWireframeTexture () {
	let texData = []

	//
	// make base image,
	//
	const lw = 10 // line width

	for (y = 0; y < 256; y++) {
		r = []
		for (x = 0; x < 256; x++) {
			if (y < lw || y > (256 - lw) || x < lw || x > (256 - lw)) {
				r.push([255, 255, 255, 255])
			} else {
				r.push([0, 0, 0, 255])
			}
		}
		texData.push(r)
	}

	//
	// do box filter blur on the base image:
	//
	const tempTexData = []

	for (y = 0; y < 256; y++) {
		r = []
		for (x = 0; x < 256; x++) {
			let c = [0, 0, 0, 0]

			for (let ax = -3; ax <= +3; ax++) {
				for (let ay = -3; ay <= +3; ay++) {
					const wy = y + ay

					const wx = x + ax

					if (wy < 0 || wx < 0 || wy > 255 || wx > 255) {
						// avoid out-of-range access.
						continue
					}

					const d = texData[wy][wx]

					c = [
						c[0] + d[0],
						c[1] + d[1],
						c[2] + d[2],
						c[3] + d[3],
					]
				}
			}

			const u = 49.0

			r.push([c[0] / u, c[1] / u, c[2] / u, c[3] / u])
		}
		tempTexData.push(r)
	}
	texData = tempTexData

	return texData
}

// lerp between two colors
function lerp (c0, c1, x) {
	return [
		c1[0] * x + c0[0] * (1.0 - x),
		c1[1] * x + c0[1] * (1.0 - x),
		c1[2] * x + c0[2] * (1.0 - x),
		c1[3] * x + c0[3] * (1.0 - x),
	]
}

function makeSunTexture () {
	const texData = []

	// the color of the circle is based on this palette.
	// and the palette uses the distance from the center to
	// smoothly interpolate between colors.
	const palette = [
		[0.0, [246.0, 125.0, 202.0, 255.0]],
		[0.6, [247.0, 27.0, 111.0, 255.0]],
		[0.9, [247.0, 27.0, 111.0, 255.0]],
		[1.0, [0.0, 0.0, 0.0, 255.0]],
	]

	for (y = 0; y < 256; y++) {
		r = [] // row of pixel data
		for (x = 0; x < 256; x++) {
			// convert (x,y) to range [-1, +1]
			const ox = (x - 128) / 127

			const oy = (y - 128) / 127

			const R = Math.sqrt(ox * ox + oy * oy) // distance from center.

			let c

			if (R >= 1.0) {
				c = [0.0, 0.0, 0.0, 0.0]
			} else {
				let ip
				// find the two colors in the palette, which we should
				// interpolate between.

				for (ip = 0; ip < palette.length - 1; ip++) {
					if (palette[ip][0] <= R && palette[ip + 1][0] >= R) {
						break
					}
				}

				const c0 = palette[ip + 0]

				const c1 = palette[ip + 1]

				c = lerp(c0[1], c1[1], (R - c0[0]) / (c1[0] - c0[0]))
			}
			r.push(c)
		}
		texData.push(r)
	}

	return texData
}

const elements = [] // faces

const texCoord = [] // texCoords

const H = 80 // number of squares on the height
const W = 60 // number of squares on the width

const size = 100.0 // the sidelength of a square.

const xmin = -(W / 2.0) * size

const xmax = +(W / 2.0) * size

const zmin = -(H / 2.0) * size

const zmax = +(H / 2.0) * size

let row

let col

function Chunk () {
	this.position = []
	this.positionBuffer = regl.buffer({
		length: (H + 1) * (W + 1) * 3 * 4,
		type: 'float',
		usage: 'dynamic',
	})
}
const chunkPool = []

function freeChunk (chunk) {
	chunkPool.push(chunk)
}

// every time we add a new chunk, we increment this number.
// it is used to determine the z-position of the chunk.
let N = 0

function makeChunk () {
	// retrieve chunk from the pool, or create one if necessary.
	const chunk = chunkPool.pop() || new Chunk()

	let j = 0

	for (row = 0; row <= H; ++row) {
		z = (row / H) * (zmax - zmin) + zmin
		// If N==0, then this is the first chunk that we see.
		// If N==1, it is the second chunk that we see, and so on.
		z += (zmax - zmin) * -N

		for (col = 0; col <= W; ++col) {
			x = (col / W) * (xmax - xmin) + xmin

			let f = 0.0015974

			let amp = 100.0

			let n = 0

			// FBM of two octaves.
			for (let i = 0; i < 2; i++) {
				n += amp * f
				amp *= 6.0
				f *= 0.5
			}

			// make the terrain less smooth looking.
			y = Math.round(n / 60) * 60

			chunk.position[j++] = [x, y, z]
		}
	}
	// upload vertex data to the GPU.
	chunk.positionBuffer.subdata(chunk.position)

	chunk.N = N

	N++
	return chunk
}

// render distance of chunks.
const RENDER_N = 10

const chunks = []

// create all the chunks we need.
for (i = 0; i < RENDER_N; i++) {
	chunks[i] = makeChunk()
}

// create texCoords.
for (row = 0; row <= H; ++row) {
	z = (row)
	for (col = 0; col <= W; ++col) {
		x = (col)
		texCoord.push([x, z])
	}
}

// create faces.
for (row = 0; row <= (H - 1); ++row) {
	for (col = 0; col <= (W - 1); ++col) {
		i = row * (W + 1) + col

		const i0 = i + 0

		const i1 = i + 1

		const i2 = i + (W + 1) + 0

		const i3 = i + (W + 1) + 1

		elements.push([i3, i1, i0])
		elements.push([i0, i2, i3])
	}
}

// this global scope encapsulates all state common to all drawCommands.
const globalScope = regl({
	uniforms: {
		projection: ({viewportWidth, viewportHeight}) => {
			return mat4.perspective([], FOV, viewportWidth / viewportHeight, Z_NEAR, Z_FAR)
		},
	},
	cull: {
		enable: true,
	},
})

// encapsulates state needed for drawing chunks.
const chunkScope = regl({
	uniforms: {
		view: (_, props) => props.view,

		tex: regl.texture({
			min: 'linear mipmap linear',
			mag: 'linear',
			wrap: 'repeat',
			data: makeWireframeTexture(),
		}),
		cameraPos: (_, props) => {
			return cameraPosFromViewMatrix([], props.view)
		},
		tick: ({tick}) => tick,
	},

	frag: `
  precision mediump float;

  varying vec2 vTexCoord;
  varying vec3 vPosition;

  uniform sampler2D tex;
  uniform vec3 cameraPos;
  uniform float tick;

  void main () {
    vec3 d = vec3(
      (sin(tick*0.02 + 0.0) + 1.0) * 0.5 + 0.5,
      (sin(tick*0.02 + 2.0) + 1.0) * 0.5 + 0.5,
      (sin(tick*0.01 + 4.0) + 1.0) * 0.5 + 0.5
    );

    vec3 c = texture2D(tex, vTexCoord).x * d;
    gl_FragColor = vec4(c.xyz, 1.0);
  }`,
	vert: `
  precision mediump float;

  attribute vec3 position;
  attribute vec2 texCoord;

  varying vec2 vTexCoord;
  varying vec3 vPosition;

  uniform mat4 projection, view;
  uniform vec3 cameraPos;

  void main() {
    vTexCoord = texCoord;
    vPosition = position.xyz;

    float dist = distance(cameraPos.xz, vPosition.xz);
    float curveAmount = 0.3;

    // we lower all vertices down a bit, to create a slightly curved horizon.
    gl_Position = projection * view * vec4(position - vec3(0.0, dist*curveAmount * 0.0, 0.0), 1);
  }`,

	attributes: {
		texCoord,
	},
	elements,
})

const drawSun = regl({
	uniforms: {
		view: (_, props) => {
			const m = mat4.copy([], props.view)
			// the sun should always stay where it is, so do this:

			m[12] = 0
			m[13] = 0
			m[14] = 0
			return m
		},
		tex: regl.texture({
			data: makeSunTexture(),
			mag: 'linear',
		}),
	},

	frag: `
  precision mediump float;

  varying vec2 vTexCoord;

  uniform sampler2D tex;

  void main () {
    gl_FragColor = vec4(texture2D(tex, vTexCoord).xyz, 1.0);
  }`,
	vert: `
  precision mediump float;

  attribute vec3 position;
  attribute vec2 texCoord;

  uniform mat4 projection, view;
  uniform vec3 cameraPos;

  varying vec2 vTexCoord;

  void main() {
    vec3 q = position;
    // scale and translate the sun:
    q += vec3(0.0, 0.1, 0.0);
    q *= vec3(vec2(0.4), -1.0);
    vec4 p = view * vec4(q, 1);

    vTexCoord = texCoord;
    gl_Position = projection * p;
  }`,

	attributes: {
		position: [
			[-0.5, -0.5, 1.0],
			[+0.5, -0.5, 1.0],
			[+0.5, +0.5, 1.0],

			[+0.5, +0.5, 1.0],
			[-0.5, +0.5, 1.0],
			[-0.5, -0.5, 1.0],
		],
		texCoord: [
			[0.0, 0.0],
			[1.0, 0.0],
			[1.0, 1.0],

			[1.0, 1.0],
			[0.0, 1.0],
			[0.0, 0.0],
		],
	},

	count: 6,
	depth: {
		enable: false, // the sun will be behind everything else.
	},
})

// used for drawing a single chunk.
const drawChunk = regl({
	attributes: {
		position: regl.prop('pos'),
	},
})

// make sure that we actually upload all the vertex-data before starting.
regl._gl.flush()
regl._gl.finish()

regl.frame(({tick, viewportWidth, viewportHeight}) => {
	regl.clear({color: [0.0, 0.0, 0.0, 1.0], depth: 1})

	// create a moving camera.
	const view = []

	const startZ = 5100
	const down = -1000

	const cameraPos = [0, 410, startZ]

	mat4.lookAt(view, cameraPos, [0, down, -startZ], [0, 1, 0])

	globalScope(() => {
		drawSun({view})

		chunkScope({view}, () => {
			for (i = 0; i < chunks.length; i++) {
				drawChunk({pos: {buffer: chunks[i].positionBuffer}})
			}
		})
	})

	// If the first chunk can't be seen anymore, remove it.
	// Then way back in the horizon we place a new chunk,
	// so that the world goes on forever.
	if (chunks.length > 0) {
		z = zmin + (zmax - zmin) * -chunks[0].N
		if (cameraPos[2] < z) {
			freeChunk(chunks.shift())
			chunks.push(makeChunk())
		}
	}
})