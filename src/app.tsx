import React from 'react'
import { createRoot } from 'react-dom/client'

import { SparksNMN } from './nmn'
import { Parser } from './nmn/parser/parser'
import nmnExamples from './nmn/examples/examples'
import { Frac } from './nmn/util/frac'
import { MusicTheory } from './nmn/util/music'
import { md5 } from './nmn/util/md5'
import { TestApp } from './app/TestApp'

function ConsoleTest() {
	console.log(md5('abc'))
	console.log('Complicated')
	console.log(Parser.parse(nmnExamples.structure_complicated))
	console.log('Multisection')
	console.log(Parser.parse(nmnExamples.strcture_multiSection))
	console.log('Multipart')
	console.log(Parser.parse(nmnExamples.basics_multiPart))
	console.log('Fracs')
	console.log(Frac.repr(Frac.create(3, 2)))
	console.log(Frac.repr(Frac.__sum(Frac.create(1, 2), Frac.create(1, 6), Frac.create(1, 3))))
	console.log(Frac.repr(Frac.prod(Frac.create(1, 2), Frac.create(2, 3), Frac.create(3, 4))))
	console.log('Abs Names')
	console.log(MusicTheory.absName2Pitch('C4'))
	console.log(MusicTheory.absName2Pitch('C5'))
	console.log(MusicTheory.absName2Pitch('C3'))
	console.log(MusicTheory.absName2Pitch('##C4'))
	console.log(MusicTheory.absName2Pitch('#B4'))
	console.log(MusicTheory.absName2Pitch('C13'))
	console.log('Degrees')
	console.log(MusicTheory.pitchInterval2dKey(1, 'th'))
	console.log(MusicTheory.pitchInterval2dKey(1, 'thd'))
	console.log(MusicTheory.pitchInterval2dKey(1, 'thm'))
	console.log(MusicTheory.pitchInterval2dKey(4, 'thm'))
	console.log(MusicTheory.pitchInterval2dKey(5, 'thm'))
	console.log(MusicTheory.pitchInterval2dKey(8, 'th'))
	console.log(MusicTheory.pitchInterval2dKey(-8, 'th'))
	return <></>
}

function App() {
	return <>
		<style>{`
			@page${'{'}
				size: A4;
				margin: 60px 0;
				padding: 0;
			${'}'}
			html, body${'{'}
				padding: 0;
				margin: 0;
			${'}'}
		`}</style>
		<TestApp />
	</>
}

/* TODO[Dev]: 改为字体加载时自动刷新预览 */
SparksNMN.loadFonts(() => {
	createRoot(document.getElementById('root')!).render(
		<App />
	)
})
