import { render } from 'preact'
import { useComputed, signal } from '@preact/signals'
import classnames from 'classnames'

import './reset.css'
import './style.css'

const puzzle = signal(Array.from({ length: 64 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))))
const score = signal(0)
const sequence = signal([])
const downed = signal(false)

function isAdjacent(a, b) {
	// left and right
	if (a === b + 1 && b % 8 !== 7) return true
	if (a === b - 1 && b % 8 !== 0) return true

	// up and down
	if (a === b + 8 && b < 56) return true
	if (a === b - 8 && b > 7) return true

	// bottom left
	if (a === b + 7 && b < 56 && b % 8 !== 0) return true

	// top right
	if (a === b - 7 && b > 7 && b % 8 !== 7) return true

	// bottom right
	if (a === b + 9 && b < 56 && b % 8 !== 7) return true

	// top left
	if (a === b - 9 && b > 7 && b % 8 !== 0) return true

	return false
}

function Button({ index, letter }) {
	const direction = useComputed(() => {
		const sequenceIndex = sequence.value.indexOf(index)
		if (sequenceIndex < 1) return ''
		const previousIndex = sequence.value[sequenceIndex - 1]

		if (previousIndex === index - 1) return 'from-left'
		if (previousIndex === index + 1) return 'from-right'
		if (previousIndex === index - 8) return 'from-top'
		if (previousIndex === index + 8) return 'from-bottom'
		if (previousIndex === index - 9) return 'from-top-left'
		if (previousIndex === index - 7) return 'from-top-right'
		if (previousIndex === index + 7) return 'from-bottom-left'
		if (previousIndex === index + 9) return 'from-bottom-right'
	})

	const pressed = () => {
		if (sequence.value.length > 0) return
		sequence.value = [index]
		downed.value = true
	}

	const entered = () => {
		if (!downed.value) return
		if (sequence.value.includes(index)) return
		if (!isAdjacent(index, sequence.value.at(-1))) return
		sequence.value = [...sequence.value, index]
	}

	const released = () => {
		if (sequence.value.length < 3) return
		console.log('check word')
	}

	const classes = classnames(direction, {
		'pressed': sequence.value.includes(index),
	})

	return (
		<button onPointerDown={pressed} onPointerEnter={entered} onPointerUp={released} class={classes}>
			{letter}
			{Math.random() > 0.9 && (
				<span class="multiplier">2</span>
			)}
		</button>
	)
}

export function App() {
	const mouseUpped = () => {
		sequence.value = []
		downed.value = false
	}

	return (
		<>
			<div id="score">
				Score: {score.value}
			</div>

			<div id="word">
				{sequence.value.map(letter => puzzle.value[letter])}
			</div>

			<div id="puzzle" onMouseUp={mouseUpped}>
				{puzzle.value.map((letter, index) => (
					<Button key={index} index={index} letter={letter} />
				))}
			</div>
		</>
	)
}

render(<App />, document.getElementById('app'))
