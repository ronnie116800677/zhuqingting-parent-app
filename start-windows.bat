@echo off
chcp 65001 >nul
title 竹蜻蜓教育 App 本地启动

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo 没有找到 npm。
  echo 请先安装 Node.js LTS 版本：https://nodejs.org/
  echo 安装完成后，关闭这个窗口，再重新双击 start-windows.bat。
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo.
  echo 第一次运行，正在安装依赖，请稍等...
  call npm install
  if errorlevel 1 (
    echo.
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

echo.
echo 正在启动项目...
echo 启动成功后，请在浏览器打开终端里显示的 localhost 地址。
echo.
call npm run dev
pause
