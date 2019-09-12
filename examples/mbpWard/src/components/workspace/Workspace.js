// @flow

import React from 'react'
import { type WorkspaceStateType } from './workspaceEpic'
import { type DispatchType } from '../../../../../src/epics'
import {
	WorkspaceHtmlDraggingOverEvent,
	WorkspaceHtmlOnDropEvent,
	WorkspaceImageLoadedEvent,
	WorkspacePickSelectionAreaKindNameBtnPressedEvent,
	WorkspacePickSelectionAreaKindPhoneBtnPressedEvent,
	WorkspacePickSelectionAreaKindEmailBtnPressedEvent,
	WorkspacePickSelectionAreaKindCancelBtnPressedEvent,
} from './workspaceEvents'
import './Workspace.css'

type PropsType = {|
    state: WorkspaceStateType,
    dispatch: DispatchType,
|}

const workspaceImageId = 'workspaceImage'

export const Workspace = ({ state, dispatch }: PropsType) => {
	return (<div
		className={`Workspace${state.draggingFileOverWorkspace ? ' draggingFileOverWorkspace' : ''}`}
		onDragOver={(e) => {
			e.preventDefault()
			dispatch(WorkspaceHtmlDraggingOverEvent.create())
		}}
		onDrop={ev => {
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault()
			const files = []

			if (ev.dataTransfer.items) {
				// Use DataTransferItemList interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.items.length; i++) {
					// If dropped items aren't files, reject them
					if (ev.dataTransfer.items[i].kind === 'file') {
						const file = ev.dataTransfer.items[i].getAsFile()

						files.push(file)
					}
				}
			} else {
				// Use DataTransfer interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.files.length; i++) {
					files.push(ev.dataTransfer.files[i])
				}
			}

			dispatch(WorkspaceHtmlOnDropEvent.create({ files }))
		}}
	>
		{
			state.openedFile.url
				&& <img
					id={workspaceImageId}
					src={state.openedFile.url}
					onLoad={() => {
						const img: HTMLImageElement = (document.getElementById(workspaceImageId): any)

						dispatch(WorkspaceImageLoadedEvent.create({ width: img.naturalWidth, height: img.naturalHeight }))
					}}
				/>
		}
		<div className="fileInfo">
			{ state.openedFile.name ? <span className="text">Opened file: {state.openedFile.name}.</span> : <div/> }
			{ state.uploadingFile.active ? <span className="text"> Uploading: {state.uploadingFile.progress}%</span> : <div/> }
		</div>
		<div className="regognizedTextsBoxes">
			{
				state.openedFile.recognizedTextsScaled.map(({ box, text }, i) => {
					return <div key={i} className="regognizedTextBox" style={box} title={text} />
				})
			}
		</div>
		{ state.pickSelectionArea.active && <div className="selectionTypeDialog">
			<h3>What this selection represents?</h3>
			<button onClick={() => dispatch(WorkspacePickSelectionAreaKindNameBtnPressedEvent.create())} >name</button>
			<button onClick={() => dispatch(WorkspacePickSelectionAreaKindPhoneBtnPressedEvent.create())} >phone</button>
			<button onClick={() => dispatch(WorkspacePickSelectionAreaKindEmailBtnPressedEvent.create())} >email</button>
			<button onClick={() => dispatch(WorkspacePickSelectionAreaKindCancelBtnPressedEvent.create())} >cancel</button>
		</div> }
	</div>)
}
