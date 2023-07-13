import * as Tone from 'tone'
import { Instrument, InstrumentOptions } from 'tone/build/esm/instrument/Instrument'

/**
 * Tone 乐器
 */
export class ToneInstrument {
	static resourceUrls: {[_: string]: string} = {}
	static loadedResources: {[_: string]: Tone.ToneAudioBuffer} = {}
	static loaded = false
	/**
	 * 加载音源。不返回任何东西，开始播放前请等待 Tone.loaded。
	 */
	static load(baseUrl: string) {
		if(this.loaded) {
			return false
		}
		this.loaded = true
		for(let key in this.resourceUrls) {
			const url = baseUrl + this.resourceUrls[key]
			this.loadedResources[key] = new Tone.ToneAudioBuffer(url)
		}
	}

	synth: Instrument<InstrumentOptions>
	now: number

	constructor() {
		this.synth = new Tone.Synth().toDestination()
		this.now = Tone.now()
	}

	/**
	 * 获取时间
	 */
	resetTime() {
		this.now = Tone.now()
	}
	/**
	 * 设置音量，数值为能量的比例
	 */
	setVolume(volumeFrac: number) {
		this.synth.volume.value = Math.max(-60, 10 * Math.log10(volumeFrac))
	}
	/**
	 * 停止播放并丢弃
	 */
	dispose() {
		this.synth.dispose()
	}
}

/**
 * 音符型 Tone 乐器
 */
export class TonicToneInstrument extends ToneInstrument {
	/**
	 * 计划播放音符
	 */
	scheduleNote(freq: number, timeMillis: number, durationMillis: number) {
		this.synth.triggerAttackRelease(freq, timeMillis / 1000, this.now + durationMillis / 1000)
	}
}

/**
 * 鼓点型 Tone 乐器
 *
 * 实现方式是为不同音高分配不同声音，并将音符转化为音高
 */
export class DrumlineToneInstrument extends ToneInstrument {
	/**
	 * 计划播放音符
	 */
	scheduleNote(note: string, timeMillis: number, durationMillis: number) {
		this.synth.triggerAttackRelease(this.transformPitch(note), timeMillis / 1000, this.now + durationMillis / 1000)
	}
	/**
	 * 转换音高
	 */
	transformPitch(note: string): Tone.Unit.Frequency {
		return 'C2'
	}
}

export module ToneInstrumentUtils {

}
