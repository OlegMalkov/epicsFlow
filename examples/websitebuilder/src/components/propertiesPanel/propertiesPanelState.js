// @flow strict

import { type RTPositionType, type DimensionsType } from '../../types'
import { setPropDeepCompare } from '../../../../../src/utils'

opaque type PropertiesPanelStateType: {| height: *, positonRT: *, visible: * |} = {|
    height: number,
    positonRT: RTPositionType,
    visible: bool,
|}

type GetPositionPropsType = {| propertiesPanelHeight: number, workspaceViewportDimensions: DimensionsType |}

const marginFromWorspaceViewportPx = 20
const propertiesPanelWidth = 300

const propertiesPanelInitialState: PropertiesPanelStateType = { positonRT: { right: 0, top: -99999 }, height: 300, visible: false }

const propertiesPanelSetVisible = setPropDeepCompare<PropertiesPanelStateType, *>('visible')
const propertiesPanelSetPositionNoChecks = setPropDeepCompare<PropertiesPanelStateType, *>('positonRT')

type PropertiesPanelSetPositionPropsType = {|
    workspaceViewportDimensions: DimensionsType,
    propertiesPanelPositionRT: RTPositionType,
    propertiesPanelHeight: number,
|}
const propertiesPanelSetPosition = ({ workspaceViewportDimensions, propertiesPanelPositionRT, propertiesPanelHeight }: PropertiesPanelSetPositionPropsType) => {
	let { right, top } = propertiesPanelPositionRT

	const maxRight = workspaceViewportDimensions.width - propertiesPanelWidth / 2

	if (right > maxRight) {
		right = maxRight
	}
	const minRight = -(propertiesPanelWidth / 2)

	if (right < minRight) {
		right = minRight
	}
	const maxTop = workspaceViewportDimensions.height - propertiesPanelHeight / 2

	if (top > maxTop) {
		top = maxTop
	}
	const minTop = 0

	if (top < minTop) {
		top = minTop
	}

	return propertiesPanelSetPositionNoChecks({ top, right })
}
const propertiesPanelSetHeight = setPropDeepCompare<PropertiesPanelStateType, *>('height')

const propertiesPanelComputeRightTopPositionRT = (props: GetPositionPropsType): RTPositionType => ({// eslint-disable-line no-unused-vars
	right: marginFromWorspaceViewportPx,
	top: marginFromWorspaceViewportPx,
})
const propertiesPanelComputeRightBottomPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionPropsType): RTPositionType => ({
	right: marginFromWorspaceViewportPx,
	top: workspaceViewportDimensions.height - propertiesPanelHeight - marginFromWorspaceViewportPx,
})
const propertiesPanelComputeRightForLeftCase = (workspaceWidth) => workspaceWidth - propertiesPanelWidth - marginFromWorspaceViewportPx
const propertiesPanelComputeLeftBottomPositionRT = ({ workspaceViewportDimensions, propertiesPanelHeight }: GetPositionPropsType): RTPositionType => ({
	right: propertiesPanelComputeRightForLeftCase(workspaceViewportDimensions.width),
	top: workspaceViewportDimensions.height - propertiesPanelHeight - marginFromWorspaceViewportPx,
})
const propertiesPanelComputeLeftTopPositionRT = ({ workspaceViewportDimensions }: GetPositionPropsType): RTPositionType => ({
	right: propertiesPanelComputeRightForLeftCase(workspaceViewportDimensions.width),
	top: marginFromWorspaceViewportPx,
})
const possiblePositionsRTPositionComputers = [
	propertiesPanelComputeRightTopPositionRT,
	propertiesPanelComputeRightBottomPositionRT,
	propertiesPanelComputeLeftBottomPositionRT,
	propertiesPanelComputeLeftTopPositionRT,
]
const propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea = ({
	workspaceWidth,
	templateWidth,
	propertiesPanelHeight,
	workspaceScroll,
}: {|
        propertiesPanelHeight: number,
        templateWidth: number,
        workspaceScroll: { top: number },
        workspaceWidth: number,
    |}) => (propertiesPanelPositionRT: RTPositionType) => {
	// |  | template |  |
	// |   workspace    |
	// properties panel is inside workspace
	// template is centered within workspace

	const templateOffset = (workspaceWidth - templateWidth) / 2
	const right = Math.floor((workspaceWidth - propertiesPanelPositionRT.right) - templateOffset)
	const top = propertiesPanelPositionRT.top + workspaceScroll.top
	const result = {
		left: right - propertiesPanelWidth,
		top,
		right,
		bottom: top + propertiesPanelHeight,
	}

	return result
}

export {
	propertiesPanelSetPositionNoChecks,
	propertiesPanelSetVisible,
	propertiesPanelSetPosition,
	propertiesPanelSetHeight,
	propertiesPanelInitialState,
	possiblePositionsRTPositionComputers,
	propertiesPanelComputeRightTopPositionRT,
	propertiesPanelCreateComputePropertiesPanelBBoxWithRespectToTemplateArea,
	propertiesPanelWidth,
}
