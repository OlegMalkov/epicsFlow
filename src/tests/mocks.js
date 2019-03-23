// @flow

let dateNow = 0

// $FlowFixMe
Date.now = () => dateNow

const setNow = (now: number) => {
	dateNow = now
}

export {
	setNow,
}
