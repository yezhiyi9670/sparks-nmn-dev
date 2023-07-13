import { PartSignature } from "../../../../parser/des2cols/types"
import { inCheck, iterateMap } from "../../../../util/array"

export type ControlData = {[partHash: string]: {
	control: ControlDataPart
	signature: PartSignature | BeatMachineSignature
}}

export type ControlDataPart = {
	mute: boolean
	solo: boolean
	volume: number
	pan: number
} & ({
	type: 'part'
	octave: number
	tonicInstrument: TonicInstrumentName,
	drumlineInstrument: DrumlineInstrumentName
} | {
	type: 'beatMachine',
	drumlineInstrument: DrumlineInstrumentName
})

export const controlDataPartDefault: ControlDataPart = {
	mute: false,
	solo: false,
	volume: 100,
	pan: 0,
	type: 'part',
	octave: 0,
	tonicInstrument: 'piano',
	drumlineInstrument: 'drum'
}
export const controlDataPartBeatMachine: ControlDataPart = {
	mute: false,
	solo: false,
	volume: 100,
	pan: 0,
	type: 'beatMachine',
	drumlineInstrument: 'dip'
}

export const TonicInstruments = {
	chip: {},
	piano: {},
	string: {},
	horn: {},
	dah: {}
}
export type TonicInstrumentName = keyof(typeof TonicInstruments)

export const DrumlineInstruments = {
	drum: {},
	dip: {},
	dah: {}
}
export type DrumlineInstrumentName = keyof(typeof DrumlineInstruments)

export type BeatMachineSignature = {
	hash: 'beatMachine',
	type: 'beatMachine'
}

export type Instrument = (typeof TonicInstruments)['piano']

export module MixingControlUtils {
	export const maxVolume = 150
	export const maxOctave = 6

	export function dehydrate(data: ControlData): string[] {
		const result: string[] = []
		iterateMap(data, (part, partId) => {
			result.push(JSON.stringify({
				id: partId,
				c: {
					m: part.control.mute,
					s: part.control.solo,
					v: part.control.volume,
					nx: part.control.drumlineInstrument,
					...(part.control.type != 'beatMachine' && {
						nn: part.control.tonicInstrument,
						o: part.control.octave
					})
				}
			}))
		})
		return result
	}

	function reviveOne(configObj: unknown, isBeatMachine: boolean): ControlDataPart | undefined {
		if(!configObj || typeof configObj != 'object') {
			return undefined
		}
		const target = isBeatMachine ? {...controlDataPartBeatMachine} : {...controlDataPartDefault}
		if('m' in configObj && typeof configObj.m == 'boolean') {
			target.mute = configObj.m
		}
		if('s' in configObj && typeof configObj.s == 'boolean') {
			target.solo = configObj.s
		}
		if('v' in configObj && typeof configObj.v == 'number' && configObj.v == configObj.v) {
			target.volume = Math.min(maxVolume, Math.max(0, Math.floor(configObj.v)))
		}
		if('nx' in configObj && typeof configObj.nx == 'string' && inCheck(configObj.nx, DrumlineInstruments)) {
			target.drumlineInstrument = configObj.nx as any
		}
		if(target.type != 'beatMachine') {
			if('nn' in configObj && typeof configObj.nn == 'string' && inCheck(configObj.nn, TonicInstruments)) {
				target.tonicInstrument = configObj.nn as any
			}
			if('o' in configObj && typeof configObj.o == 'number' && configObj.o == configObj.o) {
				target.octave = Math.min(maxOctave, Math.max(-maxOctave, Math.floor(configObj.o)))
			}
		}
		return target
	}

	export function revive(currentData: ControlData, lines: string[]): ControlData {
		const referenceObj: {[_: string]: ControlDataPart} = {}
		for(let line of lines) {
			try {
				const obj: unknown = JSON.parse(line.trim())
				if(!obj || typeof obj != 'object') {
					continue
				}
				if(!('id' in obj) || typeof obj.id != 'string') {
					continue
				}
				if(!('c' in obj)) {
					continue
				}
				const isBeatMachine = obj.id == 'beatMachine'
				const revivedData = reviveOne(obj.c, isBeatMachine)
				if(!revivedData) {
					continue
				}
				referenceObj[obj.id] = revivedData
			} catch(_err) {
				console.warn('Cannot parse part data', line.trim(), _err)
			}
		}
		const newData = { ...currentData }
		for(let partId in newData) {
			if(referenceObj[partId]) {
				newData[partId] = {
					...newData[partId],
					control: referenceObj[partId]
				}
			}
		}
		return newData
	}
}
