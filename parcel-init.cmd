@echo off

rem Init frontend
echo [1/5] Init repo...
cmd /c "yarn init -y"
echo [2/5] Setting up config...
echo {"compilerOptions": {"target": "es6","module": "CommonJS","allowJs": true,"skipLibCheck": true,"esModuleInterop": true,"allowSyntheticDefaultImports": true,"strict": true,"forceConsistentCasingInFileNames": true,"moduleResolution": "node","resolveJsonModule": true,"isolatedModules": true,"noEmit": true,"jsx": "preserve","baseUrl": "src","noImplicitAny": true},"include": ["types/"]} > tsconfig.json
echo {"name": "test3","version": "1.0.0","source": "./src/index.html","license": "MIT","scripts": {"start": "parcel --port 8544 --host localhost","build": "parcel build --public-url ./"},"browserslist": "> 0.5%%, last 2 versions, Firefox ESR, not dead"} > package.json
echo [3/5] Add dependencies
cmd /c "yarn add -D parcel process react react-dom @types/react @types/react-dom sass @parcel/transformer-sass"
echo [4/5] Creating sources
echo /node_modules/ > .gitignore
echo /.parcel-cache/ >> .gitignore
echo /dist/ >> .gitignore
echo /package-lock.json >> .gitignore
echo /yarn.lock >> .gitignore
echo {"/backend": {"target": "http://localhost:8543/","pathRewrite": {"^/backend": ""}}} > .proxyrc
mkdir types
echo declare module '*.module.sass' > types/css-modules.d.ts
echo declare module '*.module.scss' >> types/css-modules.d.ts
mkdir src

@REM rem Init backend
@REM mkdir backend
@REM cd backend

@REM echo [1/5] Init repo...
@REM cmd /c "yarn init -y"
@REM echo [2/5] Setting up config...
@REM echo {"compilerOptions": {"target": "es6","module": "CommonJS","allowJs": true,"skipLibCheck": true,"esModuleInterop": true,"allowSyntheticDefaultImports": true,"strict": true,"forceConsistentCasingInFileNames": true,"moduleResolution": "node","resolveJsonModule": true,"isolatedModules": true,"noEmit": true,"jsx": "preserve","noImplicitAny": true,"rootDir": "./"}} > tsconfig.json
@REM echo {"name": "test3-backend","version": "1.0.0","license": "MIT","main": "app.ts","scripts": {"test": "set NODE_ENV=development & nodemon app.ts","start": "set NODE_ENV=production & ts-node app.ts"}} > package.json
@REM echo [3/5] Add dependencies
@REM cmd /c "yarn add -D typescript ts-node nodemon @types/node @types/express"
@REM cmd /c "yarn add express"
@REM echo [4/5] Creating sources
@REM echo /node_modules/ > .gitignore
@REM echo /build/ >> .gitignore
@REM echo /package-lock.json >> .gitignore
@REM echo /yarn.lock >> .gitignore
