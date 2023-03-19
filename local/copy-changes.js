const fs = require('fs')
const path = require('path')

if (!fs.existsSync("package.json")) {
	console.log("This is not the right directory");
	process.exit(3);
}

const copy = (sd, td) => {
	if(!fs.existsSync(td)) {
		fs.mkdirSync(td)
	}
	// 读取目录下的文件，返回文件名及文件类型{name: 'xxx.txt, [Symbol(type)]: 1 }
	const sourceFile = fs.readdirSync(sd, { withFileTypes: true });
	for (const file of sourceFile) {
		// 源文件 地址+文件名
		const srcFile = path.resolve(sd, file.name);
		// 目标文件
		const tagFile = path.resolve(td, file.name);
		// 文件是目录且未创建
		if (file.isDirectory() && !fs.existsSync(tagFile)) {
			fs.mkdirSync(tagFile, (err) => console.log(err));
			copy(srcFile, tagFile);
		} else if (file.isDirectory() && fs.existsSync(tagFile)) {
			// 文件时目录且已存在
			copy(srcFile, tagFile);
		}
		!file.isDirectory() &&
			fs.copyFileSync(srcFile, tagFile, fs.constants.COPYFILE_FICLONE);
	}
};

const nexrSrc = '../sparks-nmn-desktop/src/renderer/nmn'
if(fs.existsSync(nexrSrc)) {
	console.log('Copy to sparks-nmn-desktop')
	copy('src/nmn', nexrSrc)
}

const demoPath = 'E:/wamp64/hosts/PhpTests/dist/sparks-nmn-dev'
if(fs.existsSync(demoPath)) {
	console.log('Copy to demo')
	const files = fs.readdirSync(demoPath, { withFileTypes: true })
	for(const file of files) {
		if(!file.isDirectory()) {
			fs.unlinkSync(path.resolve(demoPath, file.name))
		}
	}
	copy('dist/demo', demoPath)
}

require('child_process').execSync('start "" "' + 'dist\\demo' + '"')
